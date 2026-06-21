const express = require('express');
const auth = require('../middleware/auth');
const Log = require('../models/Log');
const router = express.Router();

router.get('/tips', auth, async (req, res) => {
  try {
    const logs = await Log.find({ user: req.userId }).sort({ date: -1 }).limit(7);
    const summary = logs.map(l =>
      `Date: ${l.date.toDateString()}, Mood: ${l.mood}, Energy: ${l.energyLevel}/5, Study hours: ${l.studyHours}, Little win: "${l.littleWin}", Self-care: ${Object.entries(l.selfCare || {}).filter(([,v]) => v).map(([k]) => k).join(', ') || 'none'}`
    ).join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Here is a student's last 7 days of wellness logs:\n${summary}\n\nAct as "Bloomly," a warm, encouraging companion (not a doctor). Give 3 short, cute, supportive tips (max 2 sentences each) connecting her mood, energy, study habits, and self-care patterns. Use gentle, garden/growth-themed language (e.g. "your garden is blooming," "give yourself room to grow"). No medical claims.`
        }],
      }),
    });

    const data = await response.json();
    const tips = data.content?.[0]?.text || 'No tips available right now.';
    res.json({ tips });
  } catch (err) {
    console.error('AI ERROR:', err);
    res.status(500).json({ error: 'AI service failed' });
  }
});

module.exports = router;