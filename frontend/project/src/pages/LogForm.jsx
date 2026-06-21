import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const MOODS = [
  { key: 'sunny', emoji: '☀️', label: 'Sunny' },
  { key: 'blooming', emoji: '🌸', label: 'Blooming' },
  { key: 'seedling', emoji: '🌱', label: 'Growing' },
  { key: 'wilting', emoji: '🥀', label: 'Wilting' },
  { key: 'stormy', emoji: '⛈️', label: 'Stormy' },
];

export default function LogForm() {
  const [mood, setMood] = useState('seedling');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [studyHours, setStudyHours] = useState(0);
  const [littleWin, setLittleWin] = useState('');
  const [selfCare, setSelfCare] = useState({ meal: false, stretch: false, screenBreak: false, friend: false });
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const toggleCare = (key) => setSelfCare({ ...selfCare, [key]: !selfCare[key] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/logs', { mood, energyLevel, studyHours, littleWin, selfCare });
    setSaved(true);
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <h1 className="text-xl font-bold text-rose-500">How's your garden today? 🌷</h1>

        <div>
          <p className="text-sm text-gray-500 mb-2">Pick your vibe</p>
          <div className="flex gap-2 justify-between">
            {MOODS.map((m) => (
              <button key={m.key} type="button" onClick={() => setMood(m.key)}
                className={`flex-1 p-3 rounded-2xl text-2xl transition ${mood === m.key ? 'bg-rose-200 scale-110' : 'bg-rose-50'}`}>
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Energy level: {energyLevel}/5</p>
          <input type="range" min="1" max="5" value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
            className="w-full accent-rose-400" />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Study hours today</p>
          <input type="number" min="0" step="0.5" value={studyHours}
            onChange={(e) => setStudyHours(Number(e.target.value))}
            className="w-full p-3 rounded-xl border border-rose-200" />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Self-care moments</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'meal', label: '🍲 Good meal' },
              { key: 'stretch', label: '🧘 Stretched' },
              { key: 'screenBreak', label: '📵 Screen break' },
              { key: 'friend', label: '💬 Connected' },
            ].map((c) => (
              <button key={c.key} type="button" onClick={() => toggleCare(c.key)}
                className={`p-2 rounded-xl text-sm transition ${selfCare[c.key] ? 'bg-rose-300 text-white' : 'bg-rose-50 text-gray-600'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Today's little bloom 🌼</p>
          <input type="text" placeholder="One tiny thing that made you happy..."
            value={littleWin} onChange={(e) => setLittleWin(e.target.value)}
            className="w-full p-3 rounded-xl border border-rose-200" />
        </div>

        <button onClick={handleSubmit} className="w-full bg-rose-400 text-white p-3 rounded-xl hover:bg-rose-500 transition">
          {saved ? 'Saved! 🌸' : 'Save today\'s log'}
        </button>
      </div>
    </div>
  );
}