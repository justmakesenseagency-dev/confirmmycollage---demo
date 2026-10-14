import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Shared in-memory cache for responses
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getCached(key: string) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  responseCache.set(key, { data, timestamp: Date.now() });
}

// Strip markdown code fences if present
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

// Server-side Gemini client initialization as required by skill
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Retry wrapper with 20s timeout
async function callGeminiWithRetry(fn: () => Promise<string>, retries = 1): Promise<string> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 20 seconds')), 20000)
      );
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  throw lastError;
}

// 1. Quiz Recommender endpoint
app.post('/api/gemini/quiz-recommend', async (req, res) => {
  try {
    const { answers, colleges } = req.body;
    const cacheKey = `quiz_${JSON.stringify(answers)}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ai = getAi();
    const prompt = `Recommend exactly 5 colleges for this student based on their quiz profile and the college list below.
Student Quiz Profile:
- Highest Exam Percentile: ${answers.percentile}%
- Preferred Cities: ${(answers.preferredCities || []).join(', ') || 'Any'}
- Annual Budget: ₹${answers.annualBudgetLakh} Lakh
- Work Experience: ${answers.workExperienceYears} years
- Career Goal: ${answers.careerGoal}
- Priority Ranking: ${(answers.importanceRanking || []).join(' > ')}

Available Colleges Data:
${JSON.stringify(
  colleges.map((c: any) => ({
    id: c.id,
    name: c.name,
    city: c.city,
    feesLakh: (c.programmes[0]?.totalFeeInr || 0) / 100000,
    minPercentile: c.minPercentile,
    avgPackageLpa: c.avgPackageLpa,
    tags: c.tags,
  }))
)}

Return strict JSON with schema:
{
  "recommendations": [
    { "collegeId": string, "matchPercent": number, "reason": string }
  ]
}
Sort by matchPercent descending. Provide realistic match percentages (70-98%) and concise reasons under 30 words explaining why this college matches their city, percentile, budget, or career goal.`;

    const raw = await callGeminiWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an admissions counsellor for Indian MBA aspirants. Recommend ONLY from the provided college list. Never invent colleges or numbers. Return strict JSON.',
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });
      return response.text || '';
    });

    const parsed = JSON.parse(cleanJsonString(raw));
    setCache(cacheKey, parsed);
    res.json(parsed);
  } catch (err: any) {
    console.error('Quiz recommendation error:', err);
    res.status(500).json({
      error: 'The AI is busy, please try again.',
      details: err?.message,
    });
  }
});

// 2. Explain Answer endpoint
app.post('/api/gemini/explain', async (req, res) => {
  try {
    const { question, options, correctIndex, language } = req.body;
    const cacheKey = `explain_${question.slice(0, 40)}_${language}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ai = getAi();
    const isHindi = language === 'hi';
    const prompt = `Question: ${question}
Options:
${options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}
Correct Answer: Option ${correctIndex + 1} (${options[correctIndex]})

Please explain step-by-step why this answer is correct in ${isHindi ? 'Hindi (in Devanagari script)' : 'simple English'}.
Keep the explanation under 150 words. Provide a shortcut trick or mnemonic if one exists.`;

    const raw = await callGeminiWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a patient tutor for CAT-style questions. Explain step by step in simple language for a student. Keep it under 150 words. Offer a shortcut trick if one exists.',
          temperature: 0.4,
        },
      });
      return response.text || '';
    });

    const result = { explanation: raw.trim() };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err: any) {
    console.error('Explain answer error:', err);
    res.status(500).json({
      error: 'The AI is busy, please try again.',
      details: err?.message,
    });
  }
});

// 3. SOP Reviewer endpoint
app.post('/api/gemini/review-sop', async (req, res) => {
  try {
    const { sopText, careerGoal } = req.body;
    const cacheKey = `sop_${sopText.slice(0, 50)}_${sopText.length}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ai = getAi();
    const prompt = `Review this MBA Statement of Purpose (SOP):
Target Goal / Field: ${careerGoal || 'General Management'}
Student SOP Draft:
"""${sopText}"""

Evaluate the SOP and provide constructive feedback.
Do NOT invent new biographical facts, degrees, or companies. Polish what is written.
Return strict JSON with this exact schema:
{
  "clarityScore": number (0 to 10),
  "strengths": [string, string, string],
  "weaknesses": [string, string, string],
  "suggestions": [string, string, string],
  "improvedVersion": string
}`;

    const raw = await callGeminiWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an MBA admissions reviewer. Be honest, specific and constructive. Do not add facts the student did not write. Return strict JSON.',
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });
      return response.text || '';
    });

    const parsed = JSON.parse(cleanJsonString(raw));
    setCache(cacheKey, parsed);
    res.json(parsed);
  } catch (err: any) {
    console.error('SOP review error:', err);
    res.status(500).json({
      error: 'The AI is busy, please try again.',
      details: err?.message,
    });
  }
});

// 4. Practice Question Generator endpoint
app.post('/api/gemini/generate-questions', async (req, res) => {
  try {
    const { exam, section, topic, difficulty, count = 3 } = req.body;
    const cacheKey = `genq_${exam}_${section}_${topic}_${difficulty}_${count}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ai = getAi();
    const prompt = `Create ${count} ORIGINAL, high-quality questions for entrance exam: ${exam}, section: ${section}, topic: ${topic}, difficulty: ${difficulty}.
Never reproduce real past test papers.
Each question must have:
- Clear question text
- Exactly 4 options
- Exactly 1 correctIndex (0, 1, 2, or 3)
- Clear step-by-step explanation
- frequencyTag ('Very frequent' | 'Frequent' | 'Occasional')
- tags (array of strings)

Return strict JSON with schema:
{
  "questions": [
    {
      "id": string,
      "exam": "${exam}",
      "section": "${section}",
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "text": string,
      "options": [string, string, string, string],
      "correctIndex": number,
      "explanation": string,
      "frequencyTag": "Frequent",
      "tags": [string]
    }
  ]
}`;

    const raw = await callGeminiWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Create ORIGINAL questions. Never reproduce real past papers. Each question must have exactly 4 options with exactly one correct answer, and a clear explanation. Return strict JSON matching the Question type.',
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });
      return response.text || '';
    });

    const parsed = JSON.parse(cleanJsonString(raw));
    // Validate correctIndex bounds
    if (Array.isArray(parsed.questions)) {
      parsed.questions.forEach((q: any, idx: number) => {
        if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
          q.correctIndex = 0;
        }
        q.id = `ai-gen-${Date.now()}-${idx}`;
        q.isAiGenerated = true;
      });
    }

    setCache(cacheKey, parsed);
    res.json(parsed);
  } catch (err: any) {
    console.error('Question generation error:', err);
    res.status(500).json({
      error: 'The AI is busy, please try again.',
      details: err?.message,
    });
  }
});

// 5. Admission Chatbot endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, collegeSummary } = req.body;
    const ai = getAi();

    const systemPrompt = `You are the ConfirmMyCollege admissions assistant. Answer student questions about the common application process, documents, exams (CAT, XAT, SNAP, NMAT, CMAT), deadlines, and the 12 partner colleges on ConfirmMyCollege.
Knowledge Context:
- Platform: ConfirmMyCollege lets students fill 1 common form and apply to up to 5 B-schools with a single application fee of ₹1,500.
- Colleges available: Apex Institute of Management & Research (Mumbai), National School of Business & Analytics (Bengaluru), Vanguard Graduate School of Management (Delhi NCR), Sahyadri Institute (Pune), Deccan School (Hyderabad), Coromandel Institute (Chennai), Eastern Heritage (Kolkata), Coastal Coast (Manipal), Metropolitan School (Mumbai), Aravalli Institute (Delhi NCR), Silicon Valley Institute (Bengaluru), Maratha Chamber Academy (Pune).
- Important Rules:
  1. If the answer is not in your data, say you are not sure and suggest checking the college's official website.
  2. NEVER guarantee admission.
  3. NEVER invent dates, fees, or cutoffs.
  4. Keep answers friendly, concise, and structured in bullet points.`;

    const formattedContents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });

    res.json({ reply: response.text || '' });
  } catch (err: any) {
    console.error('Chatbot error:', err);
    res.status(500).json({
      error: 'The AI is busy, please try again.',
      details: err?.message,
    });
  }
});

// Mount Vite or static server
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ConfirmMyCollege server running on port ${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
