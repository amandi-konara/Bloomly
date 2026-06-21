import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

const MOOD_EMOJI = { sunny: '☀️', blooming: '🌸', seedling: '🌱', wilting: '🥀', stormy: '⛈️' };

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [tips, setTips] = useState('');
  const [loadingTips, setLoadingTips] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/logs').then((res) => setLogs(res.data));
  }, []);

  const streak = (() => {
    let count = 0;
    const today = new Date().toDateString();
    let cursor = new Date();
    const logDates = new Set(logs.map(l => new Date(l.date).toDateString()));
    while (logDates.has(cursor.toDateString())) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  const chartData = [...logs].reverse().map((l) => ({
    date: new Date(l.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    energy: l.energyLevel,
    studyHours: l.studyHours,
  }));

  const getTips = async () => {
    setLoadingTips(true);
    try {
      const res = await api.get('/ai/tips');
      setTips(res.data.tips);
    } catch {
      setTips("Couldn't fetch tips right now — try again soon 🌧️");
    }
    setLoadingTips(false);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-rose-500">🌸 Hi, {user.name || 'there'}!</h1>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-rose-400">Log out</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl">🔥 {streak}</p>
            <p className="text-sm text-gray-500">day streak</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl">{logs[0] ? MOOD_EMOJI[logs[0].mood] : '🌱'}</p>
            <p className="text-sm text-gray-500">today's vibe</p>
          </div>
        </div>

        <button onClick={() => navigate('/log')}
          className="w-full bg-rose-400 text-white p-3 rounded-xl hover:bg-rose-500 transition">
          + Log today's entry
        </button>

        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-sm text-gray-500 mb-2">Energy & study trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="energy" stroke="#fb7185" strokeWidth={2} />
                <Line type="monotone" dataKey="studyHours" stroke="#fda4af" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium text-rose-500">🌷 Bloomly's tips for you</p>
            <button onClick={getTips} className="text-sm text-rose-400 hover:underline">
              {loadingTips ? 'Thinking...' : 'Refresh'}
            </button>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {tips || "Tap 'Refresh' once you've logged a few days to get personalized tips 🌼"}
          </p>
        </div>

        {logs.filter(l => l.littleWin).length > 0 && (
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="font-medium text-rose-500 mb-2">🌼 Memory lane</p>
            <ul className="space-y-1 text-sm text-gray-600">
              {logs.filter(l => l.littleWin).slice(0, 5).map((l) => (
                <li key={l._id}>• {l.littleWin}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}