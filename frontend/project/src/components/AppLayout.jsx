import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Target,
  BarChart3,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sparkles,
  Sun,
} from './Icons';
import bloomlyLogo from '../assets/bloomly-logo.png';
import DailyCheckInModal from './DailyCheckInModal';
import AddHabitModal from './AddHabitModal';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/habits', label: 'My Habits', icon: CheckSquare },
  { path: '/journal', label: 'Wellness Journal', icon: BookOpen },
  { path: '/goals', label: 'Goals & Milestones', icon: Target },
  { path: '/insights', label: 'Insights & Trends', icon: BarChart3 },
  { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AppLayout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('bloomly_theme') === 'dark';
  });
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Amandi","email":"student@university.edu"}');

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

  return (
    <div className="min-h-screen flex bg-cream-100 text-bloom-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-5 bg-white/70 backdrop-blur-md border-r border-bloom-border/70 flex-shrink-0 sticky top-0 h-screen justify-between">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-11 h-11 rounded-2xl bg-cream-50 border border-bloom-border p-0.5 shadow-soft flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={bloomlyLogo}
                alt="Bloomly"
                className="w-full h-full object-contain hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl text-sage-800 tracking-tight block">
                Bloomly
              </span>
              <span className="text-[11px] font-medium text-bloom-muted block">
                Wellness & Habits
              </span>
            </div>
          </div>

          {/* Quick Check-in CTA Button */}
          <div className="px-1">
            <button
              onClick={() => setIsCheckInOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-sage-300 hover:bg-sage-400 text-sage-900 font-semibold text-sm shadow-clay active:shadow-clay-active active:translate-y-0.5 transition"
            >
              <Sparkles className="w-4 h-4 text-sage-900" />
              <span>Daily Check-in</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 px-1">
            {NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sage-100 text-sage-900 font-semibold shadow-soft border border-sage-200/80'
                        : 'text-bloom-muted hover:text-bloom-dark hover:bg-cream-200/50'
                    }`
                  }
                >
                  <IconComp className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 border-b border-bloom-border/70 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-bloom-muted">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sage-400" />
              <span>{todayFormatted}</span>
            </div>

            <div className="md:ml-auto flex items-center gap-2.5">
              <button
                onClick={toggleDarkMode}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={darkMode}
                className="p-2.5 rounded-xl border border-bloom-border bg-white/80 text-bloom-dark hover:bg-cream-200/60 transition"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-2 rounded-2xl border border-bloom-border bg-white/80 px-2.5 py-2 shadow-soft">
                <div className="w-9 h-9 rounded-full bg-peach-200 border border-peach-300 flex items-center justify-center font-bold text-sm text-peach-700 flex-shrink-0">
                  {(user.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-bloom-dark truncate">{user.name || 'Student'}</p>
                  <p className="text-[10px] text-bloom-muted truncate">{todayFormatted}</p>
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 rounded-xl text-bloom-muted hover:text-rose-600 hover:bg-peach-100/60 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-bloom-border sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <img src={bloomlyLogo} alt="Bloomly" className="w-8 h-8 object-contain" />
            <span className="font-display font-extrabold text-base text-sage-800">Bloomly</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={darkMode}
              className="p-1.5 rounded-xl border border-bloom-border bg-white text-bloom-dark"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsCheckInOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-sage-300 text-sage-900 text-[11px] font-bold shadow-sm"
            >
              + Check-in
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-bloom-dark hover:bg-cream-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-bloom-border p-4 space-y-2 animate-fade-in">
            {NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium ${
                      isActive ? 'bg-sage-100 text-sage-900 font-semibold' : 'text-bloom-muted'
                    }`
                  }
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-bloom-border flex justify-between items-center">
              <span className="text-xs text-bloom-muted">{user.name || 'Student'}</span>
              <button onClick={logout} className="text-xs text-rose-600 font-medium">Log out</button>
            </div>
          </div>
        )}

        {/* Page Content Slot */}
        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={() => {
          // Trigger custom event so active pages refresh data reactively
          window.dispatchEvent(new Event('bloomly_data_updated'));
        }}
      />
      <AddHabitModal
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
        onAdded={() => {
          window.dispatchEvent(new Event('bloomly_data_updated'));
        }}
      />
    </div>
  );
}
