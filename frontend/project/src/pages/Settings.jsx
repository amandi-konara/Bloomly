import { useEffect, useState } from 'react';
import { Check, LogOut, Moon, Save, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { dataService } from '../services/dataService';

function getErrorMessage(error) {
  return error.response?.data?.error || 'Settings could not be saved. Please try again.';
}

export default function Settings() {
  const [settings, setSettings] = useState({ name: '', email: '', reminderTime: '' });
  const [loading, setLoading] = useState(true);
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('bloomly_theme') === 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    dataService.getAccountSettings()
      .then((account) => {
        if (active) {
          setSettings({
            name: account.name || '',
            email: account.email || '',
            reminderTime: account.reminderTime || '',
          });
          setAccountLoaded(true);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.response?.data?.error || 'Account settings could not be loaded.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const account = await dataService.saveAccountSettings({
        name: settings.name.trim(),
        email: settings.email.trim(),
        reminderTime: settings.reminderTime,
      });
      setSettings({
        name: account.name || '',
        email: account.email || '',
        reminderTime: account.reminderTime || '',
      });
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, name: account.name, email: account.email }));
      } catch {
        localStorage.setItem('user', JSON.stringify({ name: account.name, email: account.email }));
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field) => (event) => {
    setSettings((current) => ({ ...current, [field]: event.target.value }));
  };

  const toggleTheme = () => {
    const enabled = !darkMode;
    document.documentElement.classList.toggle('dark', enabled);
    localStorage.setItem('bloomly_theme', enabled ? 'dark' : 'light');
    setDarkMode(enabled);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold font-display text-bloom-dark sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-bloom-muted">Manage your account and preferences.</p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <form id="settings-form" onSubmit={handleSave} className="space-y-4">
        <Card padding="p-5 sm:p-6">
          <h2 className="text-base font-bold font-display text-bloom-dark">Profile</h2>
          <p className="mt-1 text-sm text-bloom-muted">These details are saved to your account.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="settings-name" className="mb-1.5 block text-sm font-medium text-bloom-dark">Name</label>
              <input
                id="settings-name"
                type="text"
                required
                maxLength={80}
                autoComplete="name"
                value={settings.name}
                onChange={updateField('name')}
                disabled={loading || saving || !accountLoaded}
                className="w-full rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="settings-email" className="mb-1.5 block text-sm font-medium text-bloom-dark">Email</label>
              <input
                id="settings-email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={settings.email}
                onChange={updateField('email')}
                disabled={loading || saving || !accountLoaded}
                className="w-full rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-60"
              />
            </div>
          </div>
        </Card>

        <Card padding="p-5 sm:p-6">
          <h2 className="text-base font-bold font-display text-bloom-dark">Reminder preference</h2>
          <p className="mt-1 text-sm text-bloom-muted">
            Save a preferred check-in time to your account. Bloomly does not currently deliver reminders or notifications.
          </p>
          <div className="mt-4 max-w-xs">
            <label htmlFor="settings-reminder-time" className="mb-1.5 block text-sm font-medium text-bloom-dark">
              Preferred reminder time <span className="font-normal text-bloom-muted">(optional)</span>
            </label>
            <input
              id="settings-reminder-time"
              type="time"
              value={settings.reminderTime}
              onChange={updateField('reminderTime')}
              disabled={loading || saving || !accountLoaded}
              className="w-full rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-60"
            />
          </div>
        </Card>
      </form>

      <Card padding="p-5 sm:p-6">
        <h2 className="text-base font-bold font-display text-bloom-dark">Appearance</h2>
        <p className="mt-1 text-sm text-bloom-muted">Choose the color theme for this browser.</p>
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={darkMode}
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-bloom-border bg-white px-3.5 py-2 text-sm font-medium text-bloom-dark transition hover:bg-cream-100"
        >
          {darkMode
            ? <Sun className="h-4 w-4" aria-hidden="true" />
            : <Moon className="h-4 w-4" aria-hidden="true" />}
          Use {darkMode ? 'light' : 'dark'} theme
        </button>
      </Card>

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="ghost" onClick={logout} icon={LogOut} className="text-rose-700">
          Log out
        </Button>
        <Button
          type="submit"
          form="settings-form"
          variant="primary"
          icon={saved ? Check : Save}
          disabled={loading || saving || !accountLoaded}
        >
          {loading ? 'Loading…' : saving ? 'Saving…' : saved ? 'Saved' : 'Save settings'}
        </Button>
      </div>
    </div>
  );
}
