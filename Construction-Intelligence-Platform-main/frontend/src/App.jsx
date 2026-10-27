import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  Shield, Search, Home, Calendar, CloudSun, MessageSquare,
  History, LayoutDashboard, HardHat
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Safety from './pages/Safety';
import Cracks from './pages/Cracks';
import Valuation from './pages/Valuation';
import Planning from './pages/Planning';
import DailyAssistant from './pages/DailyAssistant';
import Chat from './pages/Chat';
import HistoryPage from './pages/History';

import './index.css';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
];

const MODULE_ITEMS = [
  { to: '/safety', icon: Shield, label: 'Safety Monitor' },
  { to: '/cracks', icon: Search, label: 'Crack Detection' },
  { to: '/valuation', icon: Home, label: 'Real Estate Valuation' },
  { to: '/planning', icon: Calendar, label: 'Project Planning' },
  { to: '/daily', icon: CloudSun, label: 'Daily Assistant' },
  { to: '/chat', icon: MessageSquare, label: 'Knowledge Chat' },
];

const UTIL_ITEMS = [
  { to: '/history', icon: History, label: 'History' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <HardHat size={22} color="#0a0f1e" />
        </div>
        <div>
          <div className="sidebar-logo-text">ConstructAI</div>
          <div className="sidebar-logo-sub">Intelligence Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Overview</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon className="sidebar-link-icon" />
            {label}
          </NavLink>
        ))}

        <div className="sidebar-section-label">AI Modules</div>
        {MODULE_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon className="sidebar-link-icon" />
            {label}
          </NavLink>
        ))}

        <div className="sidebar-section-label">Tools</div>
        {UTIL_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon className="sidebar-link-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border)',
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        Powered by Google Gemini
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/cracks" element={<Cracks />} />
            <Route path="/valuation" element={<Valuation />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/daily" element={<DailyAssistant />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#0a0f1e' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0a0f1e' } },
        }}
      />
    </BrowserRouter>
  );
}
