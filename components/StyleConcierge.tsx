import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Send from 'lucide-react/dist/esm/icons/send';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  "I need a suit for an upcoming event.",
  "Looking for a gift (Baccarat/Accessories).",
  "Inquire about Castangia or Bespoke Tailoring."
];

// Live API consultation request via Vercel Serverless Functions
const handleConsultationRequest = async (message: string, userKey: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: message, sessionKey: userKey }),
    });

    const json = await response.json();
    console.log("VERCEL RESPONSE:", json);

    if (!response.ok) {
      console.error("Vercel returned an error:", json);
      throw new Error(json.error || 'Vercel returned an error');
    }

    const aiText = json.text;

    if (!aiText) {
      console.warn("Ted Silver API: No text field found in response data.", json);
      return "I apologize, I'm having trouble retrieving my notes.";
    }

    return aiText;
  } catch (error) {
    console.error("Chat UI Error:", error);
    throw error;
  }
};

export const StyleConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Greetings. I am Ted Silver. It would be my distinct pleasure to offer you a personal style consultation. How may I assist your sartorial needs today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionKey, setSessionKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate session key on mount
  useEffect(() => {
    const randomKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSessionKey(randomKey);
  }, []);

  // Magnetic Button Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Magnetic pull strength
    const strength = 0.35;
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const onSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await handleConsultationRequest(text, sessionKey);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Ted Silver API Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I need to step into the tailoring room for a moment. Please try again shortly."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Trigger Button (Magnetic) */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-10 right-10 z-50">
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ x: mouseX, y: mouseY }}
              className="relative group"
            >
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={toggleOpen}
                className="w-20 h-20 bg-[#1C1C1E] border border-white/10 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden group"
              >
                {/* Subtle Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-300/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Concierge Bell */}
                <div className="flex flex-col items-center justify-center">
                  <Bell className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Animated Inner Border */}
                <svg className="absolute inset-0 w-full h-full p-1 fill-none">
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    stroke="#D4AF37"
                    strokeWidth="1"
                    strokeDasharray="10 100"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  />
                </svg>
              </motion.button>

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileHover={{ opacity: 1, x: -10 }}
                className="absolute right-[110%] top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg pointer-events-none"
              >
                <span className="font-quicksand text-xs tracking-widest uppercase text-white">Request a Consultation</span>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Interface (Sidebar Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Background Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.6 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-gradient-to-b from-[#1C1C1E] to-[#0F172A] z-[60] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col border-l border-white/5"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 bg-black/20 backdrop-blur-xl flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="flex items-center gap-5 relative z-10">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-gold-300/30 p-0.5">
                      <img
                        src="/TedSilver.jpg"
                        alt="Ted Silver"
                        className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1C1C1E] animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-playfair text-2xl text-[#D4AF37] leading-none tracking-tight">The Silver Standard</h2>
                    <p className="font-quicksand text-[11px] text-white/40 uppercase tracking-[0.2em] mt-2 font-medium">Bespoke Digital Concierge</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="group relative z-10 flex items-center gap-2 hover:text-gold-300 transition-colors"
                >
                  <span className="font-quicksand text-[10px] uppercase tracking-widest text-white/40 group-hover:text-gold-300">Close</span>
                  <X className="w-5 h-5 text-white/40 group-hover:text-gold-300" />
                </button>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] bg-fixed">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-gold-300 to-gold-500 text-navy-900 p-5 rounded-2xl rounded-tr-none shadow-xl shadow-gold-900/10 font-quicksand text-[14px] font-semibold'
                        : 'bg-transparent text-white/90 font-playfair text-[18px] leading-relaxed italic'
                        }`}>
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-[1px] bg-gold-300/30 mb-4" />
                        )}
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Quick Actions (Intro State) */}
                {messages.length === 1 && (
                  <div className="pt-4 space-y-3">
                    {QUICK_ACTIONS.map((action, i) => (
                      <motion.button
                        key={action}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + (i * 0.15), duration: 0.6 }}
                        onClick={() => onSend(action)}
                        className="w-full text-left p-4 rounded-xl border border-gold-300/10 hover:border-gold-300/40 hover:bg-gold-300/5 transition-all duration-300 flex items-center justify-between group"
                      >
                        <span className="font-quicksand text-[12px] text-white/60 tracking-wide group-hover:text-gold-300">{action}</span>
                        <ChevronRight className="w-4 h-4 text-gold-300/30 group-hover:text-gold-300 group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Thinking Animation (Horizontal Glowing Pulsing Line) */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-start gap-3"
                  >
                    <span className="font-quicksand text-[9px] uppercase tracking-[0.3em] text-white/20">Ted is formulating advice</span>
                    <div className="w-32 h-[1px] bg-white/5 relative overflow-hidden">
                      <motion.div
                        animate={{
                          x: ['-100%', '100%'],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gold-300 to-transparent shadow-[0_0_10px_#D4AF37]"
                      />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-8 bg-black/40 border-t border-white/5 backdrop-blur-3xl">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-300/20 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                  <div className="relative bg-[#1C1C1E] border border-white/10 rounded-xl flex items-center transition-all duration-300 focus-within:border-gold-300/50">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSend(input)}
                      placeholder="Share your style inquiries..."
                      className="flex-1 bg-transparent px-6 py-5 text-white/80 placeholder:text-white/20 text-sm focus:outline-none font-quicksand tracking-wide"
                    />
                    <button
                      onClick={() => onSend(input)}
                      disabled={!input.trim() || isTyping}
                      className="pr-6 text-gold-300 hover:text-white transition-all disabled:opacity-20 group"
                    >
                      <div className="p-3 bg-white/5 rounded-full group-hover:bg-gold-500 group-hover:text-[#1C1C1E] transition-all duration-500">
                        <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <p className="font-quicksand text-[10px] text-white/10 uppercase tracking-[0.4em]">Est. 1899 • Alexandria, Louisiana</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};