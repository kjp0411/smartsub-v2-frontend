import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StorePage from './pages/StorePage';
import GuidePage from './pages/GuidePage';
import ChatPage from './pages/ChatPage';
import ReportPage from './pages/ReportPage';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/stores" element={<StorePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/reports" element={<ReportPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}