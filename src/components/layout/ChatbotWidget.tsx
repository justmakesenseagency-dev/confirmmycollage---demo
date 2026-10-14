import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { GeminiService } from '../../services/gemini';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'How does the 1 Common Form work for 5 B-schools?',
  'What documents are needed for MBA application?',
  'Which partner colleges accept 80+ CAT percentile?',
  'What is the application fee package for 5 colleges?',
];

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content:
        'Hi there! I am your ConfirmMyCollege Admissions Assistant. Ask me anything about our 12 partner B-schools, entrance cutoffs, required documents, or how to apply with 1 common form and fee.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await GeminiService.chatWithAdviser(history);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          content: 'The AI is busy, please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'init-fresh',
        role: 'model',
        content:
          'Chat cleared! How can I assist you with your B-school exploration today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Admissions Assistant"
        className="fixed bottom-20 lg:bottom-6 right-6 z-40 p-4 bg-[#7456ff] text-white rounded-full shadow-[0_10px_30px_rgba(116,86,255,0.4)] hover:bg-[#6046e8] hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d9ff64] rounded-full border-2 border-[#7456ff]" />
          </div>
        )}
      </button>

      {/* Chat Dialog Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="ConfirmMyCollege Admissions Assistant"
          className="fixed bottom-28 lg:bottom-22 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 h-[540px] max-h-[80vh] z-40 bg-white rounded-[24px] border border-[#e9e7f4] shadow-[0_20px_50px_rgba(23,23,43,0.18)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#7456ff] to-[#6046e8] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <span>Admissions Assistant</span>
                  <span className="text-[10px] bg-[#d9ff64] text-[#17172b] px-1.5 py-0.2 rounded-md font-bold">
                    Gemini
                  </span>
                </h4>
                <p className="text-[11px] text-white/80">Online · Instant admissions support</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Clear conversation"
                aria-label="Clear chat"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f7ff] text-left">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-[#eeebff] text-[#7456ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-[#7456ff] text-white rounded-br-xs'
                      : 'bg-white text-[#17172b] border border-[#e9e7f4] rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-white/70' : 'text-[#77788b]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[#17172b] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-[#eeebff] text-[#7456ff] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-bl-xs border border-[#e9e7f4] text-xs text-[#77788b] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7456ff]" />
                  <span>Checking admission requirements...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-white border-t border-[#e9e7f4]/60 flex gap-1.5 overflow-x-auto no-scrollbar text-left">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSend(q)}
                className="shrink-0 text-[11px] bg-[#eeebff] hover:bg-[#e0dbff] text-[#7456ff] px-2.5 py-1 rounded-full font-semibold transition-colors truncate max-w-[200px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#e9e7f4] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cutoffs, fees, forms..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#e9e7f4] text-xs text-[#17172b] outline-none focus:border-[#7456ff] focus:ring-2 focus:ring-[#7456ff]/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="h-10 w-10 bg-[#7456ff] hover:bg-[#6046e8] disabled:opacity-50 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
