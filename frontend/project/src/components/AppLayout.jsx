import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Menu,
  Sparkles,
  Sun,
  X,
} from './Icons';
import bloomlyLogo from '../assets/bloomly-logo.png';
import DailyCheckInModal from './DailyCheckInModal';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/habits', label: 'My Habits', icon: CheckSquare },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/progress', label: 'Progress', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

export default function AppLayout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('bloomly_theme') === 'dark';
  });
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const updateUser = () => setUser(getStoredUser());
    window.addEventListener('bloomly_account_updated', updateUser);
    return () => window.removeEventListener('bloomly_account_updated', updateUser);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const enabled = !darkMode;
    document.documentElement.classList.toggle('dark', enabled);
    localStorage.setItem('bloomly_theme', enabled ? 'dark' : 'light');
    setDarkMode(enabled);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const renderNavItems = () => NAV_ITEMS.map((item) => {
    const IconComp = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setMobileMenuOpen(false)}
        className={({ isActive }) =>
          `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`
        }
      >
        <IconComp className="app-nav-icon" aria-hidden="true" />
        <span>{item.label}</span>
      </NavLink>
    );
  });

  return (
    <div className="app-shell min-h-screen bg-cream-100 text-bloom-dark">
      <aside className="app-sidebar hidden lg:flex">
        <Link className="app-brand" to="/dashboard" aria-label="Bloomly dashboard">
          <span className="app-brand-mark">
            <img src={bloomlyLogo} alt="" />
          </span>
          <span className="app-brand-copy">
            <span className="app-brand-name">Bloomly</span>
            <span className="app-brand-caption">Wellness & Habits</span>
          </span>
        </Link>

        <nav className="app-sidebar-nav" aria-label="Main navigation">
          {renderNavItems()}
        </nav>
      </aside>

      <div className="app-workspace">
        <header className="app-header">
          <div className="app-header-inner">
            <Link className="app-brand app-mobile-brand" to="/dashboard" aria-label="Bloomly dashboard">
              <span className="app-brand-mark">
                <img src={bloomlyLogo} alt="" />
              </span>
              <span className="app-brand-copy">
                <span className="app-brand-name">Bloomly</span>
                <span className="app-brand-caption">Wellness & Habits</span>
              </span>
            </Link>

            <div className="app-header-actions">
              <button
                type="button"
                onClick={toggleDarkMode}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={darkMode}
                className="app-icon-button"
              >
                {darkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              </button>

              <button
                type="button"
                onClick={() => setIsCheckInOpen(true)}
                className="app-check-in app-check-in-compact"
              >
                <Sparkles className="app-nav-icon" aria-hidden="true" />
                <span className="hidden sm:inline">Check in</span>
              </button>

              <div className="app-user-card">
                <span className="app-user-avatar" aria-hidden="true">
                  {(user.name || 'A').charAt(0).toUpperCase()}
                </span>
                <span className="app-user-copy">
                  <span className="app-user-name">{user.name || 'Account'}</span>
                  <span className="app-user-date">{todayFormatted}</span>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title="Log out"
                  aria-label="Log out"
                  className="app-icon-button app-logout-button"
                >
                  <LogOut aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="app-mobile-navigation"
                className="app-icon-button app-menu-button"
              >
                {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </button>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <nav id="app-mobile-navigation" className="app-mobile-navigation" aria-label="Main navigation">
            {renderNavItems()}
            <button
              type="button"
              onClick={logout}
              className="app-mobile-logout"
            >
              <LogOut className="app-nav-icon" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </nav>
        )}

        <main className="app-content">
          {children}
        </main>
      </div>

      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={() => {
          window.dispatchEvent(new Event('bloomly_data_updated'));
        }}
      />
    </div>
  );
}
