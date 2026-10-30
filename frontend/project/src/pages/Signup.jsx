import { useState } from 'react';
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
    if (!form.name.trim() || form.name.trim().length > 80) {
      setError('Name must be between 1 and 80 characters.');
      return;
    }
    if (form.password.length < 8 || form.password.length > 72) {
      setError('Password must be between 8 and 72 characters.');
      return;
    }
    setLoading(true);

    try {
      const res = await api.post('/auth/signup', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create your account. Check your connection and try again.');
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
              <div role="alert" className="p-3 rounded-2xl bg-peach-100 border border-peach-200 text-xs font-semibold text-rose-800 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold tracking-wider text-bloom-muted mb-1.5">
                What should we call you?
              </label>
              <input
                type="text"
                required
                maxLength={80}
                placeholder="e.g. John"
                className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-bloom-muted mb-1.5">
                Your email address
              </label>
              <input
                type="email"
                required
                maxLength={254}
                placeholder="you@example.com"
                className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-bloom-muted mb-1.5">
                Create a password
              </label>
              <input
                type="password"
                required
                minLength={8}
                maxLength={72}
                placeholder="Choose a secure password"
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
