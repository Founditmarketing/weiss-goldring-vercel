import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BrandShowcase } from './components/BrandShowcase';
import { MeetTed } from './components/MeetTed';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { AppointmentModal } from './components/AppointmentModal';
import { HeritagePage } from './components/HeritagePage';
import { MerchandisePage } from './components/MerchandisePage';
import { Services } from './components/Services';
import { StyleConcierge } from './components/StyleConcierge';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { CastangiaPage } from './components/CastangiaPage';
import { CastangiaBlazerPage } from './components/CastangiaBlazerPage';
import { CastangiaSharkskinSuitPage } from './components/CastangiaSharkskinSuitPage';
import { CastangiaNavySuitPage } from './components/CastangiaNavySuitPage';
import { CastangiaBlackSuitPage } from './components/CastangiaBlackSuitPage';
import { CastangiaTuxedoPage } from './components/CastangiaTuxedoPage';

type Page = 'home' | 'heritage' | 'brands' | 'ted' | 'privacy' | 'castangia' | 'castangia-blazer' | 'castangia-sharkskin' | 'castangia-navy-suit' | 'castangia-black-suit' | 'castangia-tuxedo';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine "page" state based on standard URL path
  let activePage: Page = 'home';
  if (location.pathname === '/heritage') activePage = 'heritage';
  else if (location.pathname === '/brands') activePage = 'brands';
  else if (location.pathname === '/privacy') activePage = 'privacy';
  else if (location.pathname === '/castangia') activePage = 'castangia';
  else if (location.pathname === '/product/castangia-navy-blazer') activePage = 'castangia-blazer';
  else if (location.pathname === '/product/castangia-grey-sharkskin-suit') activePage = 'castangia-sharkskin';
  else if (location.pathname === '/product/castangia-navy-suit') activePage = 'castangia-navy-suit';
  else if (location.pathname === '/product/castangia-black-suit') activePage = 'castangia-black-suit';
  else if (location.pathname === '/product/castangia-tuxedo') activePage = 'castangia-tuxedo';

  const openAppointment = () => setIsAppointmentOpen(true);
  const closeAppointment = () => setIsAppointmentOpen(false);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navigateTo = (page: Page) => {
    if (page === 'ted') {
      scrollToSection('ted');
      return;
    }
    if (page === 'home') navigate('/');
    else if (page === 'castangia-blazer') navigate('/product/castangia-navy-blazer');
    else if (page === 'castangia-sharkskin') navigate('/product/castangia-grey-sharkskin-suit');
    else if (page === 'castangia-navy-suit') navigate('/product/castangia-navy-suit');
    else if (page === 'castangia-black-suit') navigate('/product/castangia-black-suit');
    else if (page === 'castangia-tuxedo') navigate('/product/castangia-tuxedo');
    else navigate(`/${page}`);
  };

  const handleFooterLink = (href: string) => {
    if (href === '#heritage') navigate('/heritage');
    else if (href === '#brands') navigate('/brands');
    else if (href === '#ted') scrollToSection('ted');
    else if (href === '#privacy') navigate('/privacy');
    else navigate('/');
  };

  return (
    <div className="bg-cream min-h-screen selection:bg-gold-300 selection:text-navy-900 font-sans overflow-x-hidden relative w-full">
      <ScrollToTop />
      <Navbar onNavigate={navigateTo} onBookClick={openAppointment} activePage={activePage} />

      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero onExplore={() => navigateTo('brands')} />
              <BrandShowcase onNavigate={navigateTo} />
              <Services />
              <MeetTed onBook={openAppointment} />
              <Testimonials />
            </>
          } />
          <Route path="/heritage" element={<HeritagePage onBack={() => navigateTo('home')} />} />
          <Route path="/brands" element={<MerchandisePage onBack={() => navigateTo('home')} />} />
          <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigateTo('home')} />} />
          <Route path="/castangia" element={<CastangiaPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />} />
          <Route path="/product/castangia-navy-blazer" element={<CastangiaBlazerPage onBack={() => navigateTo('castangia')} onBook={openAppointment} />} />
          <Route path="/product/castangia-grey-sharkskin-suit" element={<CastangiaSharkskinSuitPage onBack={() => navigateTo('castangia')} onBook={openAppointment} />} />
          <Route path="/product/castangia-navy-suit" element={<CastangiaNavySuitPage onBack={() => navigateTo('castangia')} onBook={openAppointment} />} />
          <Route path="/product/castangia-black-suit" element={<CastangiaBlackSuitPage onBack={() => navigateTo('castangia')} onBook={openAppointment} />} />
          <Route path="/product/castangia-tuxedo" element={<CastangiaTuxedoPage onBack={() => navigateTo('castangia')} onBook={openAppointment} />} />
          <Route path="*" element={<Hero onExplore={() => navigateTo('brands')} />} />
        </Routes>
      </main>

      <Footer onLinkClick={handleFooterLink} onContactClick={openAppointment} />

      <AppointmentModal isOpen={isAppointmentOpen} onClose={closeAppointment} />
      <StyleConcierge isHomePage={activePage === 'home'} onNavigate={navigateTo} />
    </div>
  );
}

export default App;