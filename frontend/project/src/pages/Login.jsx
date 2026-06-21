import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-rose-500 text-center">🌸 Bloomly</h1>
        <p className="text-center text-gray-500 text-sm">Welcome back</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email" placeholder="Email" required
          className="w-full p-3 rounded-xl border border-rose-200 focus:outline-rose-300"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password" placeholder="Password" required
          className="w-full p-3 rounded-xl border border-rose-200 focus:outline-rose-300"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" className="w-full bg-rose-400 text-white p-3 rounded-xl hover:bg-rose-500 transition">
          Log In
        </button>
        <p className="text-center text-sm text-gray-500">
          New here? <Link to="/signup" className="text-rose-500 font-medium">Sign up</Link>
        </p>
      </form>
    </div>
  );
}