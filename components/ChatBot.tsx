import React, { useState, useEffect, useRef, FormEvent } from 'react';
import type { ChatMessage } from '../types';
import { useTranslation } from './LanguageProvider';
import {
  XIcon,
  PaperAirplaneIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  SparklesIcon,
} from './icons';

declare var marked: {
  parse(markdownString: string): string;
};

interface ChatBotProps {
  patientId: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ patientId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  // Chat history is now reset if the language changes, which is a sensible UX.
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: 'model', text: t('aiWelcomeMessage') },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect ensures that if the language changes, the welcome message is updated.
    setMessages([{ role: 'model', text: t('aiWelcomeMessage') }]);
  }, [t]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send history *before* the current user message
        body: JSON.stringify({ history: messages, message: messageToSend }),
      });
      
      if (!response.ok || !response.body) {
        throw new Error(response.statusText || 'Failed to get response from server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        currentResponse += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = currentResponse;
          return newMessages;
        });
      }

    } catch (e) {
      console.error("Chat API error:", e);
      setError(t('aiError'));
      // On failure, remove the optimistic user message
      setMessages(prev => prev.filter(msg => msg !== userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 bg-purple-500/30 backdrop-blur-md border border-purple-500/50 hover:bg-purple-500/50 text-purple-300 rounded-full p-4 shadow-lg shadow-purple-500/20 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50 z-40"
        aria-label={t('chatWithAI')}
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-6 right-6 sm:left-auto sm:w-96 h-[60vh] bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/30 flex flex-col z-50 animate-fade-in-up">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-zinc-700/50">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg font-bold text-zinc-100">{t('aiAssistant')}</h2>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-200 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs md:max-w-sm lg:max-w-md rounded-xl px-4 py-2 prose prose-sm dark:prose-invert prose-p:my-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-700/80 text-zinc-200'
                  }`}
                  dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                />
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                  <div className="bg-zinc-700/80 text-zinc-400 rounded-xl px-4 py-3 flex items-center space-x-1.5">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></span>
                  </div>
              </div>
            )}
             {error && (
                <div className="text-sm text-red-400 text-center p-2 bg-red-500/20 rounded-lg">{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <footer className="p-4 border-t border-zinc-700/50">
             <p className="text-xs text-center text-zinc-500 mb-2">{t('chatDisclaimer')}</p>
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('typeYourMessage')}
                className="w-full px-4 py-2 bg-zinc-900/50 text-white placeholder-zinc-400 border border-zinc-700 rounded-full focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-500 shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 disabled:bg-purple-500/50 disabled:shadow-none disabled:cursor-not-allowed transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                disabled={!input.trim() || isLoading}
                aria-label={t('sendMessage')}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
};