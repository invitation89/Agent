import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NewProjectPage from './pages/NewProjectPage';
import ProjectBuilderPage from './pages/ProjectBuilderPage';
import DeployPage from './pages/DeployPage';
import SettingsPage from './pages/SettingsPage';
import ApiKeysPage from './pages/ApiKeysPage';
import TeamPage from './pages/TeamPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Authenticated (wrapped in AppShell) */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
            <Route path="/project/new" element={<NewProjectPage />} />
            <Route path="/project/:id" element={<ProjectBuilderPage />} />
            <Route path="/project/:id/deploy" element={<DeployPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/api-keys" element={<ApiKeysPage />} />
            <Route path="/settings/team" element={<TeamPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
