import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SevaPage from './pages/SevaPage';
import SevekariPage from './pages/SevekariPage';
import SchedulePage from './pages/SchedulePage';
import PublicSchedule from './pages/PublicSchedule';

function App() {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/seva';

  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/seva" element={<PublicSchedule />} />
      </Routes>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-white pb-20 shadow-sm">
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sevas" element={<SevaPage />} />
          <Route path="/sevekari" element={<SevekariPage />} />
          <Route path="/assignments" element={<SchedulePage />} />
          <Route path="/schedule" element={<Navigate to="/assignments" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Navbar />
    </div>
  );
}

export default App;
