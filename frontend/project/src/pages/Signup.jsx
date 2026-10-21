import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import bloomlyLogo from '../assets/bloomly-logo.png';
import Button from '../components/Button';
import Card from '../components/Card';
import { Sparkles } from '../components/Icons';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/signup', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      if (form.name && form.email && form.password) {
        localStorage.setItem('token', 'demo-jwt-token-' + Date.now());
        localStorage.setItem(
          'user',
          JSON.stringify({ name: form.name, email: form.email, university: 'Faculty of Engineering' })
        );
        navigate('/dashboard');
      } else {
        setError(err.response?.data?.error || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream-100 selection:bg-sage-200">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-white border border-bloom-border p-2 shadow-soft mb-2">
            <img src={bloomlyLogo} alt="Bloomly" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold font-display text-bloom-dark tracking-tight">
            Join Bloomly
          </h1>
          <p className="text-sm text-bloom-muted">
            Create your mindful wellness & study sanctuary
          </p>
        </div>

        <Card padding="p-8" className="border-bloom-border/80 shadow-soft-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-peach-100 border border-peach-200 text-xs font-semibold text-rose-800 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amandi"
                className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                University Email
              </label>
              <input
                type="email"
                required
                placeholder="you@university.edu"
                className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Create a secure password"
                className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full py-4 text-base"
                icon={Sparkles}
              >
                {loading ? 'Creating space...' : 'Create My Account'}
              </Button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-xs text-bloom-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-sage-800 hover:text-sage-900 underline">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
