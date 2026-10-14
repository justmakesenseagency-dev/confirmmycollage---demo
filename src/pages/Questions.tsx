import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Flame,
  ArrowRight,
  Filter,
  Layers,
  HelpCircle,
  Clock,
  Languages,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUESTIONS_DATA } from '../data/questions';
import { useProgressStore } from '../store/progressStore';
import { GeminiService } from '../services/gemini';
import { SoundFX } from '../utils/sound';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { Question, ExamName } from '../types';

export const Questions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const {
    bookmarkedQuestions,
    solvedQuestions,
    streak,
    aiQuestions,
    toggleBookmarkQuestion,
    markQuestionSolved,
    addAiQuestions,
  } = useProgressStore();

  // Combine standard and AI-generated questions
  const allQuestions = useMemo(() => {
    return [...QUESTIONS_DATA, ...aiQuestions];
  }, [aiQuestions]);

  // Filters from query params
  const searchQuery = searchParams.get('q') || '';
  const selectedSection = searchParams.get('section') || 'All';
  const selectedExam = searchParams.get('exam') || 'All';
  const selectedDifficulty = searchParams.get('difficulty') || 'All';
  const filterTab = searchParams.get('tab') || 'all'; // all | bookmarked | solved | ai
  const openQid = searchParams.get('qid');

  // Currently opened question state (if any)
  const activeQuestionIndex = useMemo(() => {
    if (!openQid) return -1;
    return allQuestions.findIndex((q) => q.id === openQid);
  }, [openQid, allQuestions]);

  const activeQuestion = activeQuestionIndex >= 0 ? allQuestions[activeQuestionIndex] : null;

  // Question solving state
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Gemini "Explain" state
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLanguage, setAiLanguage] = useState<'en' | 'hi'>('en');
  const [isExplaining, setIsExplaining] = useState(false);

  // Gemini "Generate More Questions" generator panel state
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [genExam, setGenExam] = useState<ExamName>('CAT');
  const [genSection, setGenSection] = useState<'Quant' | 'VARC' | 'DILR' | 'GK'>('Quant');
  const [genTopic, setGenTopic] = useState('Percentages');
  const [genDifficulty, setGenDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);

  // Deterministic Question of the Day based on today's day of year
  const questionOfTheDay = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const quantAndVarc = QUESTIONS_DATA.filter((q) => q.section === 'Quant' || q.section === 'VARC');
    return quantAndVarc[dayOfYear % quantAndVarc.length] || QUESTIONS_DATA[0];
  }, []);

  // Filter questions list
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // Tab filter
      if (filterTab === 'bookmarked' && !bookmarkedQuestions.includes(q.id)) return false;
      if (filterTab === 'solved' && !solvedQuestions[q.id]) return false;
      if (filterTab === 'ai' && !q.isAiGenerated) return false;

      // Section
      if (selectedSection !== 'All' && q.section !== selectedSection) return false;

      // Exam
      if (selectedExam !== 'All' && q.exam !== selectedExam) return false;

      // Difficulty
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.text.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesTags = q.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesText && !matchesTopic && !matchesTags) return false;
      }

      return true;
    });
  }, [
    allQuestions,
    filterTab,
    bookmarkedQuestions,
    solvedQuestions,
    selectedSection,
    selectedExam,
    selectedDifficulty,
    searchQuery,
  ]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handleSelectQuestion = (q: Question) => {
    updateParam('qid', q.id);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setAiExplanation(null);
  };

  const handleCloseQuestion = () => {
    updateParam('qid', null);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setAiExplanation(null);
  };

  const handleOptionClick = (idx: number) => {
    if (selectedOptionIndex !== null || !activeQuestion) return;
    setSelectedOptionIndex(idx);
    setShowExplanation(true);
    const isCorrect = idx === activeQuestion.correctIndex;
    markQuestionSolved(activeQuestion.id, idx, isCorrect);
    if (isCorrect) {
      SoundFX.success();
      try {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#7456ff', '#d9ff64', '#ff8dc7'],
        });
      } catch {
        // ignore
      }
      showToast('Correct answer! +3 marks 🎯', 'success');
    } else {
      SoundFX.pop();
      showToast(`Incorrect. Right answer was Option ${activeQuestion.correctIndex + 1}.`, 'error');
    }
  };

  // Gemini explain handler
  const handleRequestAiExplanation = async (lang: 'en' | 'hi') => {
    if (!activeQuestion) return;
    setAiLanguage(lang);
    setIsExplaining(true);
    try {
      const expl = await GeminiService.explainAnswer(
        activeQuestion.text,
        activeQuestion.options,
        activeQuestion.correctIndex,
        lang
      );
      setAiExplanation(expl);
    } catch {
      showToast('The AI is busy, please try again.', 'error');
    } finally {
      setIsExplaining(false);
    }
  };

  // Gemini generate questions handler
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const newQuestions = await GeminiService.generateQuestions({
        exam: genExam,
        section: genSection,
        topic: genTopic,
        difficulty: genDifficulty,
        count: 3,
      });
      addAiQuestions(newQuestions);
      showToast(`Generated ${newQuestions.length} practice questions!`, 'success');
      setShowGenPanel(false);
      updateParam('tab', 'ai');
    } catch {
      showToast('The AI is busy, please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-7 py-8 text-left space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7456ff] bg-[#eeebff] px-3 py-1 rounded-full mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Question Corner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#17172b] tracking-tight">
            Entrance <span className="hero-highlight">Question Bank</span>
          </h1>
          <p className="text-sm text-[#77788b] mt-1">
            Practise 60+ repeated high-frequency questions across CAT, XAT, SNAP & CMAT with instant explanations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-2 bg-[#d9ff64] text-[#17172b] px-3.5 py-2 rounded-2xl font-bold text-xs shadow-xs">
            <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
            <span>{streak} Day Streak!</span>
          </div>

          <Link to="/questions/practice">
            <Button variant="primary" size="md" icon={<Clock className="w-4 h-4" />}>
              Timed Practice Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* Question of the Day Banner */}
      <div className="bg-gradient-to-r from-[#eeebff] to-white rounded-[24px] border border-[#7456ff]/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="active" size="sm">
              Question of the Day
            </Badge>
            <span className="text-xs font-bold text-[#7456ff]">
              {questionOfTheDay.exam} · {questionOfTheDay.topic}
            </span>
          </div>
          <h3 className="font-bold text-base text-[#17172b] line-clamp-2">
            {questionOfTheDay.text}
          </h3>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 bg-white"
          onClick={() => handleSelectQuestion(questionOfTheDay)}
        >
          Solve Today’s Question →
        </Button>
      </div>

      {/* Tabs bar: All | Bookmarked | Solved | AI-Generated */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9e7f4] pb-2">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: `All Questions (${allQuestions.length})` },
            { id: 'bookmarked', label: `Bookmarks (${bookmarkedQuestions.length})` },
            { id: 'solved', label: `Solved (${Object.keys(solvedQuestions).length})` },
            { id: 'ai', label: `AI-Generated (${aiQuestions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateParam('tab', tab.id === 'all' ? null : tab.id)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-[#7456ff] text-white shadow-xs'
                  : 'text-[#77788b] hover:text-[#17172b] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<Sparkles className="w-4 h-4 text-[#7456ff]" />}
          onClick={() => setShowGenPanel(true)}
        >
          Generate Questions (Gemini)
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search topic, question keywords..."
            value={searchQuery}
            onChange={(e) => updateParam('q', e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e9e7f4] bg-white text-xs text-[#17172b] outline-none focus:border-[#7456ff]"
          />
        </div>

        {/* Section Filter */}
        <select
          value={selectedSection}
          onChange={(e) => updateParam('section', e.target.value)}
          className="h-11 px-3 rounded-xl border border-[#e9e7f4] bg-white text-xs font-semibold text-[#17172b] outline-none"
        >
          <option value="All">All Sections</option>
          <option value="Quant">Quant (QA)</option>
          <option value="VARC">VARC</option>
          <option value="DILR">DILR</option>
          <option value="GK">General Knowledge</option>
          <option value="Interview">Interview & WAT</option>
        </select>

        {/* Exam Filter */}
        <select
          value={selectedExam}
          onChange={(e) => updateParam('exam', e.target.value)}
          className="h-11 px-3 rounded-xl border border-[#e9e7f4] bg-white text-xs font-semibold text-[#17172b] outline-none"
        >
          <option value="All">All Exams</option>
          <option value="CAT">CAT</option>
          <option value="XAT">XAT</option>
          <option value="SNAP">SNAP</option>
          <option value="NMAT">NMAT</option>
          <option value="CMAT">CMAT</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => updateParam('difficulty', e.target.value)}
          className="h-11 px-3 rounded-xl border border-[#e9e7f4] bg-white text-xs font-semibold text-[#17172b] outline-none"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Questions List View */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          title="No questions match your filters"
          description="Try broadening your section, difficulty, or search term to discover more questions."
          actionText="Reset Filters"
          onAction={() => setSearchParams(new URLSearchParams())}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const isBookmarked = bookmarkedQuestions.includes(q.id);
            const solvedRecord = solvedQuestions[q.id];

            return (
              <div
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className="bg-white p-5 rounded-[20px] border border-[#e9e7f4] shadow-[0_8px_24px_rgba(33,25,76,0.03)] hover:border-[#7456ff]/40 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="purple" size="sm">
                        {q.exam}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {q.section}
                      </Badge>
                      <Badge variant="lime" size="sm">
                        {q.difficulty}
                      </Badge>
                      {q.isAiGenerated && (
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                          AI-generated
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmarkQuestion(q.id);
                        showToast(isBookmarked ? 'Removed bookmark' : 'Question bookmarked!', 'info');
                      }}
                      className="text-gray-400 hover:text-[#7456ff] p-1"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#7456ff] text-[#7456ff]' : ''}`} />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-[#17172b] line-clamp-3 mb-2 leading-relaxed">
                    {q.text}
                  </h4>
                </div>

                <div className="pt-3 border-t border-[#e9e7f4]/60 flex items-center justify-between text-xs text-[#77788b]">
                  <span className="font-medium">{q.topic}</span>
                  {solvedRecord ? (
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        solvedRecord.isCorrect ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {solvedRecord.isCorrect ? 'Solved (Correct)' : 'Attempted'}
                    </span>
                  ) : (
                    <span className="text-[#7456ff] font-bold hover:underline flex items-center gap-0.5">
                      Solve <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= QUESTION SOLVING MODAL ================= */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#17172b]/50 backdrop-blur-xs" onClick={handleCloseQuestion} />
          <div className="relative bg-white rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto flex flex-col text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e9e7f4]">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="md">
                  {activeQuestion.exam} · {activeQuestion.section}
                </Badge>
                <Badge variant="lime" size="md">
                  {activeQuestion.difficulty}
                </Badge>
                <span className="text-xs font-semibold text-[#77788b]">
                  {activeQuestion.frequencyTag}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmarkQuestion(activeQuestion.id)}
                  className="p-1.5 text-gray-400 hover:text-[#7456ff] rounded-lg"
                  aria-label="Bookmark question"
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      bookmarkedQuestions.includes(activeQuestion.id) ? 'fill-[#7456ff] text-[#7456ff]' : ''
                    }`}
                  />
                </button>
                <button
                  onClick={handleCloseQuestion}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="my-6">
              <span className="text-xs font-bold text-[#77788b] uppercase tracking-wider block mb-1">
                Topic: {activeQuestion.topic}
              </span>
              <p className="text-base font-bold text-[#17172b] leading-relaxed whitespace-pre-wrap">
                {activeQuestion.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const isCorrect = idx === activeQuestion.correctIndex;

                let btnStyle = 'border-[#e9e7f4] bg-white hover:border-[#7456ff] hover:bg-[#eeebff]/30';
                if (showExplanation) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-red-400 bg-red-50 text-red-900';
                  } else {
                    btnStyle = 'border-[#e9e7f4] opacity-50 bg-gray-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleOptionClick(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-bold text-xs shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {showExplanation && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Step-by-Step Explanation */}
            {showExplanation && (
              <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] space-y-4">
                <div>
                  <h4 className="font-bold text-xs text-[#7456ff] uppercase tracking-wider mb-1">
                    Step-by-Step Solution
                  </h4>
                  <p className="text-xs sm:text-sm text-[#17172b] leading-relaxed">
                    {activeQuestion.explanation}
                  </p>
                </div>

                {/* Gemini AI explanation helpers */}
                <div className="pt-3 border-t border-[#e9e7f4] flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#77788b]">Gemini Tutor:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!text-xs"
                    isLoading={isExplaining && aiLanguage === 'en'}
                    icon={<Sparkles className="w-3.5 h-3.5 text-[#7456ff]" />}
                    onClick={() => handleRequestAiExplanation('en')}
                  >
                    Explain in Simple Words
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!text-xs"
                    isLoading={isExplaining && aiLanguage === 'hi'}
                    icon={<Languages className="w-3.5 h-3.5 text-[#7456ff]" />}
                    onClick={() => handleRequestAiExplanation('hi')}
                  >
                    Explain in Hindi (हिंदी)
                  </Button>
                </div>

                {aiExplanation && (
                  <div className="p-4 rounded-xl bg-white border border-[#7456ff]/30 text-xs sm:text-sm text-[#17172b] leading-relaxed">
                    <span className="font-bold text-[#7456ff] block mb-1">
                      {aiLanguage === 'hi' ? 'हिंदी में स्पष्टीकरण (Gemini Tutor):' : 'Simplified Explanation (Gemini Tutor):'}
                    </span>
                    {aiExplanation}
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer Navigation */}
            <div className="pt-4 mt-6 border-t border-[#e9e7f4] flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={activeQuestionIndex <= 0}
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => {
                  if (activeQuestionIndex > 0) {
                    handleSelectQuestion(allQuestions[activeQuestionIndex - 1]);
                  }
                }}
              >
                Previous
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={activeQuestionIndex >= allQuestions.length - 1}
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => {
                  if (activeQuestionIndex < allQuestions.length - 1) {
                    handleSelectQuestion(allQuestions[activeQuestionIndex + 1]);
                  }
                }}
              >
                Next Question
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= GENERATE QUESTIONS MODAL (GEMINI F4) ================= */}
      {showGenPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#17172b]/50 backdrop-blur-xs" onClick={() => setShowGenPanel(false)} />
          <div className="relative bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl z-10 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e9e7f4]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7456ff]" />
                <h3 className="font-bold text-base text-[#17172b]">Generate Practice Questions</h3>
              </div>
              <button onClick={() => setShowGenPanel(false)} className="p-1 text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#77788b]">
              Gemini will generate 3 original questions tailored to your target exam and topic.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#17172b] block mb-1">Target Exam</label>
                <select
                  value={genExam}
                  onChange={(e) => setGenExam(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e9e7f4] text-xs bg-white"
                >
                  <option value="CAT">CAT</option>
                  <option value="XAT">XAT</option>
                  <option value="SNAP">SNAP</option>
                  <option value="NMAT">NMAT</option>
                  <option value="CMAT">CMAT</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#17172b] block mb-1">Section</label>
                <select
                  value={genSection}
                  onChange={(e) => setGenSection(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e9e7f4] text-xs bg-white"
                >
                  <option value="Quant">Quantitative Aptitude</option>
                  <option value="VARC">Verbal Ability & RC</option>
                  <option value="DILR">Data Interpretation & LR</option>
                  <option value="GK">General Knowledge</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#17172b] block mb-1">Topic</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Percentages, Para Jumbles, Seating Arrangements"
                  className="w-full h-10 px-3 rounded-xl border border-[#e9e7f4] text-xs outline-none focus:border-[#7456ff]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#17172b] block mb-1">Difficulty</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e9e7f4] text-xs bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e9e7f4]">
              <Button
                variant="primary"
                size="md"
                isLoading={isGenerating}
                className="w-full"
                onClick={handleGenerateQuestions}
              >
                Generate 3 Questions with Gemini
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
