import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
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

const systemInstruction = `You are a helpful and compassionate AI assistant for diabetes management, named 'GlucoGuide'. 
Your primary goal is to provide supportive information, answer questions about diet, exercise, and general diabetes care based on established knowledge.
You MUST NOT provide medical advice, diagnoses, or prescribe treatments. 
Always conclude your responses with a clear disclaimer in the user's language: 
'Remember, I am an AI assistant. Please consult with your healthcare provider for any medical advice or before making changes to your treatment plan.'`;

export const ChatBot: React.FC<ChatBotProps> = ({ patientId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the chat session when the component mounts or patientId changes
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const session = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
      });
      setChatSession(session);
      setMessages([
        { role: 'model', text: t('aiWelcomeMessage') },
      ]);
    } catch (e) {
      console.error("Failed to initialize Gemini AI:", e);
      setError(t('aiError'));
    }
  }, [patientId, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatSession.sendMessageStream({ message: input });
      
      let currentResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        currentResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = currentResponse;
          return newMessages;
        });
      }
    } catch (e) {
      console.error("Gemini API error:", e);
      setError(t('aiError'));
      setMessages(prev => [...prev.slice(0, -1)]); // Remove user message if API fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300 z-40"
        aria-label={t('chatWithAI')}
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-6 right-6 sm:left-auto sm:w-96 h-[60vh] bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-6 h-6 text-purple-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('aiAssistant')}</h2>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
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
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                  }`}
                  dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-xl px-4 py-2 animate-pulse">
                      {t('aiLoading')}
                  </div>
              </div>
            )}
             {error && (
                <div className="text-sm text-red-500 text-center p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <footer className="p-4 border-t border-zinc-200 dark:border-zinc-700">
             <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 mb-2">{t('chatDisclaimer')}</p>
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('typeYourMessage')}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-700 text-black dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border border-zinc-300 dark:border-zinc-600 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-purple-300 dark:disabled:bg-purple-800 disabled:cursor-not-allowed transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300"
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