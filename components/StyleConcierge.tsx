import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useDragControls, animate } from 'framer-motion';
import Send from 'lucide-react/dist/esm/icons/send';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import CalendarIcon from 'lucide-react/dist/esm/icons/calendar';
import Minimize2 from 'lucide-react/dist/esm/icons/minimize-2';
import Maximize2 from 'lucide-react/dist/esm/icons/maximize-2';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isCalendarPicker?: boolean;
  calendarSubmitted?: boolean;
  buttons?: { name: string, payload: any }[];
}

interface ConsultationResponse {
  text: string;
  hasCalendarPicker: boolean;
  buttons?: { name: string, payload: any }[];
}

// Live API consultation request via Vercel Serverless Functions (Voiceflow)
const handleConsultationRequest = async (message: string, userKey: string, type: string = 'text', pageUrl?: string): Promise<ConsultationResponse> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: message, sessionKey: userKey, type, pageUrl }),
    });

    let json;
    try {
      json = await response.json();
    } catch (e) {
      console.error("API Call Failed.", e);
      return { 
        text: "I apologize, but my tailoring room is unusually busy right now. Could you please try asking that again in a moment?", 
        hasCalendarPicker: false 
      };
    }

    console.log("VOICEFLOW TRACES:", json);

    if (!response.ok) {
      console.error("Vercel returned an error:", json);
      return { 
        text: typeof json.error === 'string' ? json.error : "I apologize, but I need to step into the tailoring room for a moment. Please try again shortly.",
        hasCalendarPicker: false
      };
    }

    const traces = json.traces;
    if (!Array.isArray(traces)) {
      console.warn("Voiceflow returned invalid trace array:", json);
      return { 
        text: "I apologize, I'm having trouble retrieving my notes.",
        hasCalendarPicker: false
      };
    }

    // Parse the traces to find text responses and custom actions (redirects, calendar picker, buttons)
    let assistantText = "";
    let hasCalendarPicker = false;
    let buttons: { name: string, payload: any }[] = [];

    for (const trace of traces) {
      console.log('Voiceflow Trace:', trace); // Log every trace for debugging

      if (trace.type === 'text' && trace.payload && trace.payload.message) {
        assistantText += trace.payload.message + "\n\n";
      }

      // Check for Choice Buttons
      if (trace.type === 'choice' && trace.payload?.buttons) {
        // Voiceflow 'choice' traces often contain a 'buttons' array with 'name' and 'request.payload'
        trace.payload.buttons.forEach((b: any) => {
          if (b.name) {
             buttons.push({ 
               name: b.name, 
               payload: b.request?.payload || b.name 
             });
          }
        });
      }

      // Check for Custom Action: calendar_picker
      const isCalendarPicker =
        trace.type === 'calendar_picker' ||
        (trace.type === 'custom_action' && trace.payload?.name === 'calendar_picker') ||
        (trace.type === 'Custom' && trace.payload?.name === 'calendar_picker') ||
        trace.payload?.action === 'calendar_picker' ||
        trace.payload?.name === 'calendar_picker';

      if (isCalendarPicker) {
        hasCalendarPicker = true;
      }

      // Robust check for the Maps_browser custom action
      const isMapsBrowser =
        trace.type === 'Maps_browser' ||
        (trace.type === 'custom_action' && trace.payload?.name === 'Maps_browser') ||
        (trace.type === 'Custom' && trace.payload?.name === 'Maps_browser') ||
        trace.payload?.action === 'Maps_browser' ||
        trace.payload?.name === 'Maps_browser';

      if (isMapsBrowser) {
        let targetUrl = '';

        // Safely extract the target_url from the payload
        try {
          if (typeof trace.payload === 'string') {
            const parsed = JSON.parse(trace.payload);
            targetUrl = parsed.target_url;
          } else if (typeof trace.payload === 'object' && trace.payload !== null) {
            if (trace.payload.target_url) {
              targetUrl = trace.payload.target_url;
            } else if (typeof trace.payload.payload === 'string') {
              const nestedParsed = JSON.parse(trace.payload.payload);
              targetUrl = nestedParsed.target_url;
            }
          }
        } catch (e) {
          console.error("Failed to parse Voiceflow custom action payload:", e);
        }

        if (targetUrl) {
          console.log(`Voiceflow requested map redirect to: ${targetUrl}`);
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 1500);
        }
      }

      // Check for Custom Action: redirect
      const isRedirect =
        trace.type === 'redirect' ||
        trace.type === 'ext_ui_redirect' ||
        (trace.type === 'custom_action' && trace.payload?.name === 'redirect') ||
        (trace.type === 'Custom' && trace.payload?.name === 'redirect') ||
        trace.payload?.action === 'redirect' ||
        trace.payload?.name === 'redirect' ||
        trace.payload?.name === 'ui_redirect';

      if (isRedirect) {
        let targetUrl = '';
        try {
          if (typeof trace.payload === 'string') {
            const parsed = JSON.parse(trace.payload);
            targetUrl = parsed.url || parsed.payload?.url;
          } else if (typeof trace.payload === 'object' && trace.payload !== null) {
            targetUrl = trace.payload.url || trace.payload.payload?.url;
            
            if (!targetUrl && typeof trace.payload.payload === 'string') {
              const nestedParsed = JSON.parse(trace.payload.payload);
              targetUrl = nestedParsed.url;
            }
          }
        } catch (e) {
          console.error("Failed to parse redirect payload:", e);
        }

        if (targetUrl) {
          console.log(`Voiceflow explicitly requested immediate redirect to: ${targetUrl}`);
          window.location.href = targetUrl;
        }
      }

      // Check for Custom Action: highlight
      const isHighlight =
        trace.type === 'highlight' ||
        (trace.type === 'custom_action' && trace.payload?.name === 'highlight') ||
        (trace.type === 'Custom' && trace.payload?.name === 'highlight') ||
        trace.payload?.action === 'highlight' ||
        trace.payload?.name === 'highlight';

      if (isHighlight) {
        let targetId = '';
        try {
          if (typeof trace.payload === 'string') {
            const parsed = JSON.parse(trace.payload);
            targetId = parsed.targetId;
          } else if (typeof trace.payload === 'object' && trace.payload !== null) {
            if (trace.payload.targetId) {
              targetId = trace.payload.targetId;
            } else if (typeof trace.payload.payload === 'string') {
              const nestedParsed = JSON.parse(trace.payload.payload);
              targetId = nestedParsed.targetId;
            }
          }
        } catch (e) {
          console.error("Failed to parse highlight payload:", e);
        }

        if (targetId) {
          console.log(`Voiceflow requested UI highlight on element ID: ${targetId}`);
          setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) {
              const originalTransition = el.style.transition;
              const originalBoxShadow = el.style.boxShadow;
              
              el.style.transition = 'all 0.5s ease-in-out';
              el.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.9)';
              
              setTimeout(() => {
                el.style.boxShadow = originalBoxShadow || 'none';
                setTimeout(() => {
                  el.style.transition = originalTransition || '';
                }, 500);
              }, 4000);
            } else {
              console.warn(`Highlight target element '${targetId}' not found in DOM.`);
            }
          }, 100);
        }
      }
    }

    return { text: assistantText.trim(), hasCalendarPicker, buttons: buttons.length > 0 ? buttons : undefined }; // We return empty string if there's ONLY a redirect trace
  } catch (error) {
    console.error("Chat UI Fetch Error:", error);
    return { 
      text: "I apologize, but I encountered an error while formulating my advice. Please try again.",
      hasCalendarPicker: false
    };
  }
};

export const StyleConcierge = ({ isHomePage = true, onNavigate }: { isHomePage?: boolean, onNavigate?: (page: 'home' | 'heritage' | 'brands' | 'ted' | 'privacy') => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('voiceflow_chat_history');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { console.error("Failed to parse chat history", e); }
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionKey, setSessionKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedKey = sessionStorage.getItem('voiceflow_userID');
      if (storedKey) return storedKey;
      const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('voiceflow_userID', newKey);
      return newKey;
    }
    return '';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [showInitialTooltip, setShowInitialTooltip] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasPlayedSoundRef = useRef(false);

  // Hide the text input field if the newest message is from the assistant and expects a button or calendar response
  const latestMessage = messages.length > 0 ? messages[0] : null;
  const isInputHidden = latestMessage?.role === 'assistant' && (
    (latestMessage.buttons && latestMessage.buttons.length > 0) || 
    (latestMessage.isCalendarPicker && !latestMessage.calendarSubmitted)
  );

  // Get current date-time for restricting past selections in calendar
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"

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

  // Sequence initial greeting from Voiceflow
  useEffect(() => {
    if (isOpen && messages.length === 0 && sessionKey) {
      const fetchGreeting = async () => {
        setIsTyping(true);
        try {
          const response = await handleConsultationRequest('', sessionKey, 'launch', window.location.pathname);
          if (response && (response.text.trim() !== '' || response.hasCalendarPicker || response.buttons)) {
            setMessages([{
              id: Date.now().toString(),
              role: 'assistant',
              content: response.text,
              isCalendarPicker: response.hasCalendarPicker,
              buttons: response.buttons
            }]);
          }
        } catch (error) {
          console.error("Failed to fetch initial greeting:", error);
          setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: "I am TedBot, your personal concierge. It would be my distinct pleasure to offer you a personal style consultation. How may I assist you today?"
          }]);
        } finally {
          setIsTyping(false);
        }
      };

      fetchGreeting();
    }
  }, [isOpen, messages.length, sessionKey]);

  // Sync messages to session storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('voiceflow_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll logic: Always align to the very bottom of the chat
  useEffect(() => {
    if (messages.length > 0 && isOpen) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isFloating]);

  // Draggable Window Logic
  const dragControls = useDragControls();
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useEffect(() => {
    if (!isFloating) {
      dragX.set(0);
      dragY.set(0);
    }
  }, [isFloating, dragX, dragY]);

  const handleDragEnd = (_event: any, info: any) => {
    if (!isFloating) return;
    
    // Calculate projected destination using velocity for a natural feel
    const projectedY = dragY.get() + (info.velocity.y * 0.1);
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    // 3 distinct snap positions: Bottom (default), Middle, and Top
    let snapPoints = [0];
    if (isMobile) {
      snapPoints = [0, -(h * 0.22), -(h * 0.46)]; // Top boundary matches dragConstraint top
    } else {
      snapPoints = [0, -200, -450];
    }
    
    // Find closest snap point
    const closest = snapPoints.reduce((prev, curr) => 
      Math.abs(curr - projectedY) < Math.abs(prev - projectedY) ? curr : prev
    );
    
    // Snap smoothly with spring animation
    animate(dragY, closest, { type: 'spring', bounce: 0.15, duration: 0.6 });
  };

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

      // Only add a chat bubble if Voiceflow returned actual text, buttons, or a calendar picker
      if (response && (response.text.trim() !== '' || response.hasCalendarPicker || response.buttons)) {
        const assistantMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: response.text,
          isCalendarPicker: response.hasCalendarPicker,
          buttons: response.buttons
        };
        setMessages(prev => [assistantMsg, ...prev]);
      }
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

  const onCalendarSubmit = async (messageId: string, isoString: string, humanReadableString: string) => {
    // 1. Mark the calendar message as submitted to hide the picker
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, calendarSubmitted: true } : m));
    
    // 2. Add the user message to the UI
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: humanReadableString };
    setMessages(prev => [userMsg, ...prev]);
    setIsTyping(true);

    try {
      const response = await handleConsultationRequest(isoString, sessionKey);

      if (response && (response.text.trim() !== '' || response.hasCalendarPicker || response.buttons)) {
        const assistantMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: response.text,
          isCalendarPicker: response.hasCalendarPicker,
          buttons: response.buttons
        };
        setMessages(prev => [assistantMsg, ...prev]);
      }
    } catch (error) {
      console.error("onCalendarSubmit Error:", error);
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


                {/* Heritage Background (Appears on scroll or on non-home pages) */}
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: (isScrolled || !isHomePage) ? '#050E17' : 'rgba(0,0,0,0)',
                    borderColor: (isScrolled || !isHomePage) ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0)',
                    scale: (isScrolled || !isHomePage) ? 1 : 0.8,
                    opacity: (isScrolled || !isHomePage) ? 1 : 0
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
          <motion.div 
            drag={isFloating ? "y" : false}
            onDragEnd={handleDragEnd}
            dragConstraints={{ top: typeof window !== 'undefined' ? (window.innerWidth < 640 ? -window.innerHeight * 0.46 : -450) : -450, bottom: 0 }}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            style={{ 
              transformOrigin: '100% 100%',
              ...(isFloating ? { x: dragX, y: dragY } : {}) 
            }}
            initial={{ opacity: 0, x: isFloating ? 0 : "100%", scale: isFloating ? 0.9 : 1 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: isFloating ? 0 : "100%", scale: isFloating ? 0.9 : 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed z-[100] flex flex-col overflow-hidden backdrop-blur-xl bg-[#091521]/95 border-gold-300/20 shadow-2xl ${
              isFloating
                ? 'w-[90vw] sm:w-[400px] h-[50vh] sm:h-[600px] bottom-6 sm:bottom-10 right-6 sm:right-10 rounded-2xl border'
                : 'top-0 right-0 w-full sm:w-[450px] h-[100dvh] rounded-none border-l'
            }`}
          >
            {/* Draggable Borders: Touch around edges to move, touch center to scroll */}
            {isFloating && (
              <>
                <div onPointerDown={(e) => dragControls.start(e)} style={{ touchAction: 'none' }} className="absolute top-0 left-0 right-0 h-10 z-[60] cursor-grab active:cursor-grabbing touch-none" />
                <div onPointerDown={(e) => dragControls.start(e)} style={{ touchAction: 'none' }} className="absolute bottom-0 left-0 right-0 h-6 z-[60] cursor-grab active:cursor-grabbing touch-none" />
                <div onPointerDown={(e) => dragControls.start(e)} style={{ touchAction: 'none' }} className="absolute top-0 bottom-0 left-0 w-6 z-[60] cursor-grab active:cursor-grabbing touch-none" />
                <div onPointerDown={(e) => dragControls.start(e)} style={{ touchAction: 'none' }} className="absolute top-0 bottom-0 right-0 w-6 z-[60] cursor-grab active:cursor-grabbing touch-none" />
              </>
            )}
            
            {/* Very faint, elegant vertical pinstripe background (Sartorial luxury) */}
            <div 
              className="absolute inset-0 z-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(212, 175, 55, 0.025) 39px, rgba(212, 175, 55, 0.025) 40px)`
              }}
            />

            {/* Header Title */}
            <div 
              className={`absolute top-0 w-full text-center pt-6 pb-20 z-40 bg-gradient-to-b from-[#091521] via-[#091521]/95 via-40% to-transparent pointer-events-none`}
            >
              <span className="font-serif italic text-gold-300/90 text-[19px] pointer-events-none">Personal Concierge</span>
            </div>

            {/* Elegant Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 z-50 flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors group"
            >
              <X className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </motion.button>

            {/* Privacy Disclaimer Notice (Sidebar Mode) */}
            {!isFloating && (
              <div className="absolute top-[56px] w-full text-center px-8 z-40">
                <p className="text-[10px] text-white/30 font-sans tracking-wide leading-tight">
                  By messaging, you acknowledge that you have read and agree to our
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      if (onNavigate) {
                        onNavigate('privacy');
                      }
                    }}
                    className="text-gold-300/70 hover:text-gold-300 ml-1 underline underline-offset-2 transition-colors pointer-events-auto cursor-pointer relative z-50 inline-block"
                  >
                    Privacy Policy
                  </button>.
                </p>
              </div>
            )}

            {/* Message Area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              ref={scrollContainerRef}
              className={`relative z-10 w-full flex-1 px-6 overflow-y-auto overscroll-contain flex flex-col scrollbar-hide pt-[110px] transition-[padding] duration-500 ${isInputHidden ? 'pb-12' : 'pb-4'}`}
              style={{
                transformOrigin: 'bottom',
                maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 98%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12%, black 98%, transparent)'
              }}
            >
              <div className="mt-auto" />
              <AnimatePresence initial={false} mode="popLayout">
                {[...messages].reverse().map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.6,
                        delay: idx === messages.length - 1 && messages.length === 1 ? 1.0 : 0,
                        ease: [0.16, 1, 0.3, 1]
                      }
                    }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
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
                            ? 'font-serif font-normal text-[19px] sm:text-[19px] text-white/90 leading-snug italic'
                            : 'font-sans text-[12px] sm:text-[12px] tracking-[0.15em] uppercase text-gold-300/70 border-r border-gold-300/20 pr-3 leading-normal'
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
                        {msg.role === 'assistant' && msg.buttons && msg.buttons.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {msg.buttons.map((btn, bIdx) => {
                              // Only enable buttons on the very latest message so historical choices are locked out
                              const isLatestMessage = idx === messages.length - 1;
                              const disabled = !isLatestMessage || isTyping;
                              return (
                                <button
                                  key={bIdx}
                                  disabled={disabled}
                                  onClick={() => onSend(btn.name)}
                                  className={`
                                    border rounded-[14px] py-1.5 px-3 font-sans text-[11.5px] tracking-wide transition-all duration-300 text-left cursor-pointer
                                    ${disabled 
                                      ? 'border-gold-300/10 text-white/20 bg-transparent cursor-not-allowed' 
                                      : 'border-gold-300/40 text-white/90 bg-gold-900/10 hover:bg-gold-500/20 hover:border-gold-300'}
                                  `}
                                >
                                  {btn.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {msg.role === 'assistant' && msg.isCalendarPicker && !msg.calendarSubmitted && (
                          <div className="mt-4 flex flex-col gap-3">
                            <div className="relative w-full">
                              <input
                                type="datetime-local"
                                id={`calendar-${msg.id}`}
                                step="1800"
                                min={minDateTime}
                                className="w-full bg-black/40 border border-gold-300/30 text-white/90 rounded-md p-2 pl-3 pr-10 font-sans text-sm focus:outline-none focus:border-gold-300/60 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full cursor-pointer"
                              />
                              <button
                                aria-label="Open Calendar"
                                onClick={() => {
                                  const inputEl = document.getElementById(`calendar-${msg.id}`) as HTMLInputElement;
                                  if (inputEl && typeof inputEl.showPicker === 'function') {
                                    try {
                                      inputEl.showPicker();
                                    } catch (e) {
                                      console.log("showPicker not supported or blocked", e);
                                    }
                                  }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gold-300/70 hover:text-gold-300 hover:bg-white/5 rounded-md transition-colors pointer-events-none sm:pointer-events-auto"
                              >
                                <CalendarIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-col gap-1 px-1 -mt-1 text-white/50">
                              <span className="text-[10px] sm:text-[11px] font-sans tracking-wide">
                                Appointments: Mon-Fri 10AM-6PM, Sat 10AM-5PM
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-sans tracking-wide italic">
                                (Only book in 30-minute intervals)
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const inputEl = document.getElementById(`calendar-${msg.id}`) as HTMLInputElement;
                                if (inputEl && inputEl.value) {
                                  const dateValue = inputEl.value; // "YYYY-MM-DDTHH:mm"
                                  const isoString = `${dateValue}:00-05:00`;
                                  
                                  const [datePart, timePart] = dateValue.split('T');
                                  const [yyyy, mm, dd] = datePart.split('-');
                                  const [HH, min] = timePart.split(':');
                                  const dateObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(HH), Number(min));
                                  
                                  // Validation Logic: Mon-Fri 10am-6pm, Sat 10am-5pm. Sun Closed.
                                  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
                                  const hour = dateObj.getHours(); // 0-23
                                  
                                  let isValid = true;
                                  
                                  if (dayOfWeek === 0) isValid = false; // Sunday
                                  if (hour < 10) isValid = false; // Before 10 AM
                                  if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 18) isValid = false; // Mon-Fri after 6PM
                                  if (dayOfWeek === 6 && hour >= 17) isValid = false; // Saturday after 5PM
                                  
                                  if (!isValid) {
                                    // Inject local error message from Assistant without closing the picker or submitting to Voiceflow
                                    const errorMsg: Message = {
                                      id: Date.now().toString(),
                                      role: 'assistant',
                                      content: "I do apologize, it appears my calendar is either already spoken for at that moment, or it falls outside of our standard operating hours.\n\nAs a reminder, we are here Monday through Friday from 10 AM to 6 PM, and Saturday from 10 AM to 5 PM.\n\nWhat other day and time might suit your schedule?"
                                    };
                                    setMessages(prev => [errorMsg, ...prev]);
                                    return;
                                  }

                                  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                  const month = monthNames[dateObj.getMonth()];
                                  const day = dateObj.getDate();
                                  
                                  let suffix = 'th';
                                  if (day === 1 || day === 21 || day === 31) suffix = 'st';
                                  else if (day === 2 || day === 22) suffix = 'nd';
                                  else if (day === 3 || day === 23) suffix = 'rd';
                                  
                                  let hours = dateObj.getHours();
                                  const ampm = hours >= 12 ? 'PM' : 'AM';
                                  hours = hours % 12;
                                  hours = hours ? hours : 12; // the hour '0' should be '12'
                                  const displayStr = `${month} ${day}${suffix} at ${hours}:${min} ${ampm}`;
                                  
                                  onCalendarSubmit(msg.id, isoString, displayStr);
                                }
                              }}
                              className="bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-300/30 rounded-full py-2 px-4 font-sans text-xs tracking-wider uppercase transition-colors self-start"
                            >
                              Confirm Appointment
                            </button>
                          </div>
                        )}
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

            {/* Mode Toggle Button */}
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`absolute right-6 z-50 transition-all duration-500 ${isInputHidden ? 'bottom-8' : 'bottom-[120px]'}`}
                >
                  <button
                    onClick={() => setIsFloating(!isFloating)}
                    className="w-10 h-10 bg-black/60 border border-gold-300/30 hover:border-gold-300/60 hover:bg-gold-900/20 text-gold-300 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-300 group relative"
                  >
                    {isFloating ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-[#050E17]/90 border border-gold-300/20 text-gold-300/90 text-[10px] uppercase tracking-wider px-3 py-1.5 rounded whitespace-nowrap pointer-events-none transition-opacity">
                      {isFloating ? "Dock to Sidebar" : "Float Window"}
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Console */}
            <AnimatePresence>
              {!isInputHidden && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'bottom' }}
                  className="relative z-20 w-full px-6 py-6 shrink-0 bg-[#091521]/95 border-t border-white/[0.02]"
                >
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-gold-300/20 via-white/5 to-gold-300/20 rounded-full blur-sm opacity-70 group-focus-within:opacity-100 transition-opacity duration-1000" />
                    <div className="relative bg-black/80 backdrop-blur-2xl border border-white/20 rounded-full flex items-center p-1 pl-5 pr-1 transition-all duration-500 focus-within:border-gold-300/40">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSend(input)}
                        placeholder="Message..."
                        className="flex-1 bg-transparent py-3 text-white/90 placeholder:text-white/40 text-[16px] focus:outline-none font-sans tracking-wide"
                      />
                      <button
                        onClick={() => onSend(input)}
                        disabled={!input.trim() || isTyping}
                        className="group ml-2"
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${(!input.trim() || isTyping) ? 'bg-white/5 opacity-30' : 'bg-gold-500 hover:bg-gold-400 cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.3)]'}`}>
                          <Send className={`w-4 h-4 transition-colors ${(!input.trim() || isTyping) ? 'text-white' : 'text-black'}`} />
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Privacy Disclaimer Notice (Floating Mode) */}
                  {isFloating && (
                    <div className="w-full text-center mt-3">
                      <p className="text-[9px] text-white/30 font-sans tracking-wide leading-tight">
                        By messaging, you agree to our
                        <button 
                          onClick={() => {
                            setIsOpen(false);
                            if (onNavigate) {
                              onNavigate('privacy');
                            }
                          }}
                          className="text-gold-300/70 hover:text-gold-300 ml-1 underline underline-offset-2 transition-colors pointer-events-auto cursor-pointer relative z-50 inline-block"
                        >
                          Privacy Policy
                        </button>.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};