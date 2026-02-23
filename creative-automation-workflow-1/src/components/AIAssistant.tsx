import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, Loader2, Sparkles, Minimize2,
  Maximize2, Trash2, Copy, Check, Bot, User, ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'How do I analyze a competitor?',
  'Help me create a TikTok ad script',
  'What workflow should I use for social media?',
  'Generate 5 ad hooks for my product',
  'How do I use the visual workflow builder?',
];

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your RedFace AI Assistant. I can help you with competitor analysis, content creation, workflow building, and more. What would you like to create today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages.filter(m => m.id !== 'welcome'), userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          task: 'chat',
          messages: chatHistory.slice(-10), // Last 10 messages for context
          prompt: messageText
        }
      });

      const aiContent = data?.raw || data?.result?.raw || 
        "I can help you with that! Try using the Competitor Analysis tool to scan competitors, the Creation Studio for generating content, or the Workflow Builder to automate your creative pipeline. What specific area would you like to explore?";

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. In the meantime, you can explore the Workflow Builder, run a Competitor Analysis, or try the Creation Studio directly from the navigation menu!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date()
    }]);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-all duration-300 group">
        <MessageCircle className="w-6 h-6 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a1a] animate-pulse" />
        <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-lg bg-gray-800 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          AI Assistant
        </div>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1a1a2e] border border-gray-700/50 shadow-2xl shadow-purple-500/10 cursor-pointer"
        onClick={() => setIsMinimized(false)}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-white">AI Assistant</span>
        {isLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
        <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 rounded hover:bg-gray-800">
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[600px] rounded-2xl bg-[#1a1a2e] border border-gray-700/50 shadow-2xl shadow-purple-500/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Assistant</p>
            <p className="text-[10px] text-green-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors" title="Clear chat">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors" title="Minimize">
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px]">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-700'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-gray-300" />}
            </div>
            <div className={`max-w-[280px] group ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-gray-800/50 text-gray-300 rounded-tl-sm'
                  : 'bg-purple-600/20 text-purple-200 rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-gray-600">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && msg.id !== 'welcome' && (
                  <button onClick={() => copyMessage(msg.id, msg.content)} className="p-0.5 rounded text-gray-600 hover:text-gray-400">
                    {copied === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-gray-800/50 rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-[10px] text-gray-600 mb-1.5">Quick actions:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.slice(0, 3).map(prompt => (
              <button key={prompt} onClick={() => sendMessage(prompt)}
                className="px-2.5 py-1 rounded-lg bg-gray-800/50 border border-gray-700/30 text-[10px] text-gray-400 hover:text-white hover:border-purple-500/30 transition-colors truncate max-w-[180px]">
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-800/50">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-xl text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
            disabled={isLoading}
          />
          <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
