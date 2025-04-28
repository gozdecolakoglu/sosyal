import express from 'express';
import Mood from '../models/Mood.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const EMOJIS = ['👍', '👎', '😄', '🤩', '😔', '😡'];

// POST /mood – Günlük emoji seçimi
router.post('/mood', authenticateToken, async (req, res) => {
  const emoji = req.body.emoji;
  const userId = res.locals.user._id; // checkUser'da zaten user set ediliyor

  if (!EMOJIS.includes(emoji)) {
    return res.status(400).json({ message: 'Geçersiz emoji seçimi' });
  }

  const today = new Date().toISOString().slice(0, 10);

  const existing = await Mood.findOne({ userId, date: today });
  if (existing) {
    return res.status(400).json({ message: 'Bugün zaten cevap verdin' });
  }

  const mood = new Mood({ userId, emoji, date: today });
  await mood.save();

  res.status(201).json({ message: 'Modun kaydedildi 🩵' });
});

// GET /mood/stats – Günlük emoji istatistikleri
router.get('/mood/stats', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const allMoods = await Mood.find({ date: today });

  const stats = EMOJIS.reduce((acc, emoji) => {
    acc[emoji] = allMoods.filter(m => m.emoji === emoji).length;
    return acc;
  }, {});

  res.json({ date: today, stats });
});

export default router;
