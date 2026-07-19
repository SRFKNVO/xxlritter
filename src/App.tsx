import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import HomePage from './pages/HomePage';
import SpeisekartePage from './pages/SpeisekartePage';
import ErlebnisPage from './pages/ErlebnisPage';
import HotelPage from './pages/HotelPage';
import EventsPage from './pages/EventsPage';
import GaleriePage from './pages/GaleriePage';
import KontaktPage from './pages/KontaktPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen overflow-x-hidden" style={{ background: '#E8F5E8' }}>
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/speisekarte" element={<SpeisekartePage />} />
            <Route path="/erlebnis" element={<ErlebnisPage />} />
            <Route path="/hotel" element={<HotelPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/galerie" element={<GaleriePage />} />
            <Route path="/kontakt" element={<KontaktPage />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  );
}
