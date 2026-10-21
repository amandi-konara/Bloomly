import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Check, LogOut, Heart, Sparkles } from '../components/Icons';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { dataService } from '../services/dataService';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [settings, setSettings] = useState(dataService.getSettings());
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSettings(dataService.getSettings());
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    dataService.saveSettings(settings);
    // Also sync user name in localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.name = settings.name;
    user.email = settings.email;
    localStorage.setItem('user', JSON.stringify(user));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="space-y-7 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-bloom-dark">
          Settings & Preferences <SettingsIcon className="inline-block w-5 h-5 ml-1" aria-hidden="true" />
        </h1>
        <p className="text-sm text-bloom-muted">
          Personalize your wellness routine, notification reminders, and account details
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card padding="p-6" className="space-y-4">
          <h2 className="text-base font-bold font-display text-bloom-dark pb-2 border-b border-bloom-border">
            Student Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={settings.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                University Email
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
              Faculty / Major
            </label>
            <input
              type="text"
              value={settings.university || ''}
              onChange={(e) => handleChange('university', e.target.value)}
              className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>
        </Card>

        {/* Routine Preferences */}
        <Card padding="p-6" className="space-y-4">
          <h2 className="text-base font-bold font-display text-bloom-dark pb-2 border-b border-bloom-border">
            Mindful Routine & Reminders
          </h2>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 border border-bloom-border">
            <div>
              <p className="text-xs font-bold text-bloom-dark">Evening Check-in Reminder</p>
              <p className="text-[11px] text-bloom-muted">A gentle notification to record your daily vibe</p>
            </div>
            <input
              type="time"
              value={settings.dailyReminder || '20:30'}
              onChange={(e) => handleChange('dailyReminder', e.target.value)}
              className="p-2 rounded-xl border border-bloom-border bg-white text-xs font-semibold"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 border border-bloom-border">
            <div>
              <p className="text-xs font-bold text-bloom-dark">Weekly AI Reflection Report</p>
              <p className="text-[11px] text-bloom-muted">Receive a weekly summary with encouragement</p>
            </div>
            <input
              type="checkbox"
              checked={settings.weeklyReport ?? true}
              onChange={(e) => handleChange('weeklyReport', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-sage-700 cursor-pointer"
            />
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <Button type="submit" variant="primary" size="md" icon={saved ? Check : Sparkles}>
            {saved ? 'Preferences Saved!' : 'Save Changes'}
          </Button>

          <Button variant="ghost" size="sm" onClick={logout} icon={LogOut} className="text-rose-600">
            Log Out of Account
          </Button>
        </div>
      </form>
    </div>
  );
}
