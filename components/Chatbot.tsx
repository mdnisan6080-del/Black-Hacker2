
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponseStream } from '../services/geminiService';
import type { ChatMessage } from '../types';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi! I'm Quizy. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const stream = await getChatResponseStream(messages, input);
        let modelResponse = '';
        setMessages(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = modelResponse;
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => [...prev, { role: 'model', content: 'Oops! Something went wrong.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-emerald-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg text-3xl transform transition-transform hover:scale-110"
      >
        💬
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-auto max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-opacity animate-fade-in">
          <header className="bg-emerald-500 text-white p-4 rounded-t-2xl">
            <h3 className="font-bold text-lg">Chat with Quizy</h3>
          </header>
          <div className="flex-1 p-4 overflow-y-auto bg-emerald-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length-1].role === 'user' && (
                 <div className="flex justify-start mb-3">
                    <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                        <span className="animate-pulse">...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold disabled:bg-emerald-300"
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default Chatbot;
