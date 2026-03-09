import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Send from 'lucide-react/dist/esm/icons/send';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Live API consultation request via Vercel Serverless Functions (Voiceflow)
const handleConsultationRequest = async (message: string, userKey: string): Promise<string> => {
  try {
    const response = await fetch('/api/voiceflow', {
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
      console.error("API Call Failed.", e);
      return "I apologize, but my tailoring room is unusually busy right now. Could you please try asking that again in a moment?";
    }

    console.log("VOICEFLOW TRACES:", json);

    if (!response.ok) {
      console.error("Vercel returned an error:", json);
      return typeof json.error === 'string' ? json.error : "I apologize, but I need to step into the tailoring room for a moment. Please try again shortly.";
    }

    const traces = json.traces;
    if (!Array.isArray(traces)) {
      console.warn("Voiceflow returned invalid trace array:", json);
      return "I apologize, I'm having trouble retrieving my notes.";
    }

    // Parse the traces to find text responses
    let assistantText = "";
    for (const trace of traces) {
      if (trace.type === 'text' && trace.payload && trace.payload.message) {
        assistantText += trace.payload.message + "\n\n";
      }
    }

    return assistantText.trim() || "I apologize, I didn't quite catch that.";
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
  const [isHovered, setIsHovered] = useState(false);
  const [showInitialTooltip, setShowInitialTooltip] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasPlayedSoundRef = useRef(false);

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
          content: "I am TedBot, your personal concierge. It would be my distinct pleasure to offer you a personal style consultation. Before we begin, may I have your name, and tell me—how may I assist your sartorial needs today?"
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

  // Auto-scroll logic: Bottom for user, Top-aligned (beginning) for assistant
  useEffect(() => {
    if (messages.length > 0 && isOpen) {
      const isLastMessageAssistant = messages[0].role === 'assistant';

      const timer = setTimeout(() => {
        if (isLastMessageAssistant) {
          // Align assistant response to show the beginning (start)
          latestMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          // Immediately bring user to the bottom anchor
          messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen]);

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
    // Play subtle bell sound only on first interaction and NOT on mobile
    if (!hasPlayedSoundRef.current) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

      if (!isMobile) {
        // Add cache-buster to ensure browsers fetch the latest version
        const audioPath = `/freesound_community-bell-98033.mp3?v=${Date.now()}`;
        const audio = new Audio(audioPath);
        audio.volume = 0.005; // Standard desktop volume
        audio.play().catch(e => console.error("Audio play blocked or failed:", e));
      }

      hasPlayedSoundRef.current = true;
    }

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
              onMouseLeave={() => {
                handleMouseLeave();
                setIsHovered(false);
              }}
              onMouseEnter={() => setIsHovered(true)}
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


                {/* Heritage Background (Appears on scroll) */}
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isScrolled ? '#050E17' : 'rgba(0,0,0,0)',
                    borderColor: isScrolled ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0)',
                    scale: isScrolled ? 1 : 0.8,
                    opacity: isScrolled ? 1 : 0
                  }}
                  className="absolute inset-2 rounded-full border shadow-2xl transition-all duration-700"
                />

                {/* Split Semi-Circle Heritage Orbit (Failsafe External Rotation) */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none overflow-visible">
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="47"
                      stroke="#D4AF37"
                      strokeWidth="1"
                      strokeOpacity="0.5"
                      initial={false}
                      animate={{
                        strokeDasharray: isHovered ? "300 0" : "60 87.6"
                      }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  </svg>
                </motion.div>

                {/* Centered Heritage Bell Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  <img
                    src="/concierge bell icon-2.png"
                    alt="Concierge"
                    className="sm:w-16 sm:h-16 w-11 h-11 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 brightness-110"
                  />
                </div>

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
                      <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-300/60 mt-2 font-medium">Direct To TedBot</p>
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
          <div className="fixed sm:bottom-6 sm:right-6 bottom-4 right-4 z-[100] w-[calc(100vw-32px)] sm:w-[400px] h-[600px] max-h-[calc(100vh-32px)] bg-[#050E17]/95 border border-gold-300/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl">
            {/* Header Title */}
            <div className="absolute top-0 w-full text-center pt-5 pb-2 z-40 bg-gradient-to-b from-[#050E17] via-[#050E17]/80 to-transparent pointer-events-none">
              <span className="font-serif italic text-gold-300/90 text-[18px]">TedBot</span>
            </div>

            {/* Elegant Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors group"
            >
              <X className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </motion.button>

            {/* Message Area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              ref={scrollContainerRef}
              className="relative z-10 w-full flex-1 px-5 overflow-y-auto flex flex-col scrollbar-hide pt-16 pb-2"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 98%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 98%, transparent)'
              }}
            >
              <div className="mt-auto" />
              <AnimatePresence initial={false} mode="popLayout">
                {[...messages].reverse().map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1]
                      }
                    }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                    className={`flex mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    ref={idx === messages.length - 1 ? latestMessageRef : null}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                      {msg.role === 'assistant' && (
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full border border-gold-300/30 overflow-hidden bg-black/40">
                            <img src="/tedsilveraibot.jpg" alt="Ted Silver" className="w-full h-full object-cover grayscale" />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col">
                        <div className={`
                          ${msg.role === 'assistant'
                            ? 'font-serif font-normal text-[16px] text-white/90 leading-snug italic'
                            : 'font-sans text-[10px] tracking-[0.15em] uppercase text-gold-300/70 border-r border-gold-300/20 pr-3'
                          }
                          whitespace-pre-line
                        `}>
                          {msg.role === 'assistant'
                            ? msg.content.split('\n\n').filter(p => p.trim()).map((para, i, arr) => (
                              <div key={i} className={i !== arr.length - 1 ? 'mb-3' : ''}>
                                {para.trim()}
                              </div>
                            ))
                            : msg.content
                          }
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
                  <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/20">Tailoring your advice</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-8 w-full shrink-0" />
            </motion.div>

            {/* Input Console */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 w-full px-5 pb-5 shrink-0 bg-[#050E17]/95"
            >
              <div className="relative group mt-2">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-gold-300/20 via-white/5 to-gold-300/20 rounded-full blur-sm opacity-70 group-focus-within:opacity-100 transition-opacity duration-1000" />
                <div className="relative bg-black/80 backdrop-blur-2xl border border-white/20 rounded-full flex items-center p-1 pl-5 pr-1 transition-all duration-500 focus-within:border-gold-300/40">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSend(input)}
                    placeholder="Message..."
                    className="flex-1 bg-transparent py-3 text-white/90 placeholder:text-white/40 text-sm focus:outline-none font-sans tracking-wide"
                  />
                  <button
                    onClick={() => onSend(input)}
                    disabled={!input.trim() || isTyping}
                    className="group ml-2"
                  >
                    <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-gold-500 transition-all duration-500 group-disabled:opacity-20">
                      <Send className="w-4 h-4 text-gold-300 group-hover:text-black transition-colors" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};