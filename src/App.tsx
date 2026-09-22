import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import UebersichtPage from './pages/dashboard/UebersichtPage';
import TischReservierungenPage from './pages/dashboard/TischReservierungenPage';
import ComingSoonPage from './pages/dashboard/ComingSoonPage';

function PublicSite() {
  return (
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UebersichtPage />} />
            <Route path="tische" element={<TischReservierungenPage />} />
            <Route path="zimmerkalender" element={<ComingSoonPage title="Zimmerkalender" />} />
            <Route path="speisekarte" element={<ComingSoonPage title="Speisekarte & Aktionen" />} />
            <Route path="kanaele" element={<ComingSoonPage title="Kanäle" />} />
          </Route>
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
