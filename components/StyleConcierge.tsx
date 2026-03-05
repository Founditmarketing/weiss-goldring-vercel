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

    let json;
    try {
      json = await response.json();
    } catch (e) {
      console.error("Vercel returned non-JSON response (likely an error page or timeout):", e);
      return "I apologize, but my tailoring room is unusually busy right now. Could you please try asking that again in a moment?";
    }

    console.log("VERCEL RESPONSE:", json);

    if (!response.ok) {
      console.error("Vercel returned an error:", json);
      return typeof json.error === 'string' ? json.error : "I apologize, but I need to step into the tailoring room for a moment. Please try again shortly.";
    }

    const aiText = json.text;

    if (!aiText || typeof aiText !== 'string') {
      console.warn("Ted Silver API: No valid text field found in response data.", json);
      return "I apologize, I'm having trouble retrieving my notes.";
    }

    return aiText;
  } catch (error) {
    console.error("Chat UI Fetch Error:", error);
    return "I apologize, but I encountered an error while formulating my advice. Please try again.";
  }
};

export const StyleConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionKey, setSessionKey] = useState('');
  const [showInitialTooltip, setShowInitialTooltip] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track scroll position for bell background dynamics
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show initial tooltip for 3 seconds on mount
  useEffect(() => {
    setShowInitialTooltip(true);
    const timer = setTimeout(() => setShowInitialTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sequence initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const timer = setTimeout(() => {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: "Greetings. I am Ted Silver. It would be my distinct pleasure to offer you a personal style consultation. How may I assist your sartorial needs today?"
        }]);
      }, 1500); // Wait for input bar to finish (1.5s)
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

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

    const strength = 0.35;
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const onSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [userMsg, ...prev]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await handleConsultationRequest(text, sessionKey);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: String(response) };
      setMessages(prev => [assistantMsg, ...prev]);
    } catch (error) {
      console.error("onSend Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but my tailoring room is unusually busy right now. Could you please try asking that again?"
      };
      setMessages(prev => [errorMsg, ...prev]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleOpen = () => {
    // Play subtle bell sound
    const audio = new Audio('/freesound_community-bell-98033.mp3');
    audio.volume = 0.1;
    audio.play().catch(e => console.error("Audio play blocked or failed:", e));

    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Trigger Button (Heritage Edition - Est. 1899) */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed sm:bottom-10 sm:right-10 bottom-6 right-6 z-[100]">
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
                className="sm:w-24 sm:h-24 w-20 h-20 flex items-center justify-center relative group"
              >
                {/* Subtle Heritage Glow */}
                <div className="absolute inset-4 rounded-full bg-gold-300/5 blur-2xl group-hover:bg-gold-300/10 transition-colors duration-1000" />

                {/* Heritage Heritage Frame (Solid black on scroll) */}
                <div className={`absolute inset-2 rounded-full border border-gold-300/20 backdrop-blur-xl group-hover:border-gold-300/40 transition-all duration-700 shadow-[0_12px_40px_rgba(0,0,0,0.3)] ${isScrolled ? 'bg-black/95' : 'bg-black/45'}`} />

                {/* Split Semi-Circle Heritage Orbit (Failsafe External Rotation) */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none overflow-visible">
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      stroke="#D4AF37"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                      strokeDasharray="130 17.5"
                    />
                  </svg>
                </motion.div>

                {/* Centered Heritage Bell */}
                <div className="relative z-10">
                  <Bell className="sm:w-8 sm:h-8 w-7 h-7 text-[#D4AF37] opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                </div>

                {/* Reflective Inner Bezel */}
                <div className="absolute inset-3 rounded-full border border-white/5 pointer-events-none" />
              </motion.button>

              {/* Temporary Load Greeting & Hover Tooltip */}
              <AnimatePresence mode="wait">
                {showInitialTooltip ? (
                  <motion.div
                    key="load-greeting"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: -12 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.5 }}
                    className="absolute right-full top-1/2 -translate-y-1/2 -mt-6 whitespace-nowrap px-8 py-4 border-r border-gold-300/40 pointer-events-none mr-2"
                  >
                    <div className="flex flex-col items-end justify-center h-full">
                      <span className="font-serif italic text-xl text-white leading-none">Personal Style Consultation</span>
                      <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-300/60 mt-2 font-medium">Direct to Ted Silver</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="standard-tooltip"
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: -12 }}
                    className="absolute right-full top-1/2 -translate-y-1/2 -mt-6 whitespace-nowrap px-8 py-4 border-r border-gold-300/40 pointer-events-none mr-2"
                  >
                    <div className="flex flex-col items-end justify-center h-full">
                      <span className="font-serif italic text-xl text-white leading-none">The Silver Standard</span>
                      <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-300/60 mt-2 font-medium">Established 1899</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Cinematic Interface */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end overflow-hidden">
            {/* Immersive Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl z-0"
            />

            {/* Elegant Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 z-50 flex flex-col items-center gap-1 group"
            >
              <div className="p-3 rounded-full border border-white/10 group-hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </div>
              <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 group-hover:text-white transition-colors">Close</span>
            </motion.button>

            {/* Message Area (Flows Upwards) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="relative z-10 w-full max-w-3xl h-[65vh] px-6 mb-24 overflow-y-auto flex flex-col-reverse scrollbar-hide py-12"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 90%, transparent)'
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                      }
                    }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                    className={`flex mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                      {msg.role === 'assistant' && (
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-10 h-10 rounded-full border border-gold-300/30 overflow-hidden bg-black/40">
                            <img src="/tedsilveraibot.jpg" alt="Ted Silver" className="w-full h-full object-cover grayscale" />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col">
                        <div className={`
                          ${msg.role === 'assistant'
                            ? 'font-serif text-lg sm:text-2xl text-white/90 leading-snug italic'
                            : 'font-sans text-[11px] tracking-[0.2em] uppercase text-gold-300/60 border-r border-gold-300/20 pr-4'
                          }
                        `}>
                          {msg.content}
                        </div>
                        {msg.role === 'assistant' && (
                          <div className="mt-3 w-12 h-[1px] bg-gold-300/30" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Thinking State */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <div className="w-10 flex-shrink-0 flex justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 rounded-full bg-gold-300 shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                    />
                  </div>
                  <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/20">Ted is formulating advice</span>
                </motion.div>
              )}
            </motion.div>

            {/* Input Console (Bottom Center) */}
            <motion.div
              initial={{ x: 1000, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 1000, opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-12 z-20 w-full max-w-3xl px-6"
            >
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-gold-300/30 via-white/5 to-gold-300/30 rounded-full blur-sm opacity-50 group-focus-within:opacity-100 transition-opacity duration-1000" />
                <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full flex items-center p-1 pl-8 pr-2 transition-all duration-500 focus-within:border-gold-300/50">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSend(input)}
                    placeholder="Share your style inquiries..."
                    className="flex-1 bg-transparent py-4 text-white/90 placeholder:text-white/30 text-base focus:outline-none font-sans tracking-wide"
                  />
                  <button
                    onClick={() => onSend(input)}
                    disabled={!input.trim() || isTyping}
                    className="group"
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-gold-500 transition-all duration-500 group-disabled:opacity-20">
                      <Send className="w-5 h-5 text-gold-300 group-hover:text-black transition-colors" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Subtle Brand Watermark */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              <p className="font-sans text-[10px] text-white/5 uppercase tracking-[0.5em] whitespace-nowrap">Est. 1899 • Cinematic Concierge Experience</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};