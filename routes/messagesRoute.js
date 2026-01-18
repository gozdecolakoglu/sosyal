import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const router = express.Router();

// Kullanıcıların listesini göster
router.get("/", authenticateToken, async (req, res) => {
  const userId = res.locals.user._id;

  // Tüm kullanıcılar (kendisi hariç)
  const allUsers = await User.find({ _id: { $ne: userId } });

  // Kullanıcının mesajlaştığı mesajlar
  const messages = await Message.find({
    $or: [{ from: userId }, { to: userId }]
  }).populate("from to", "username");

  // Unique kullanıcıları map ile bul
  const usersMap = new Map();
  messages.forEach(msg => {
    if (msg.from && String(msg.from._id) !== String(userId)) {
      usersMap.set(msg.from._id.toString(), msg.from);
    }
    if (String(msg.to._id) !== String(userId)) {
      usersMap.set(msg.to._id.toString(), msg.to);
    }
  });

  const conversationUsers = Array.from(usersMap.values());

  res.render("messages", { users: allUsers, conversationUsers, link: "messages" });
});

// Belirli bir kullanıcı ile olan mesajları listele
router.get("/:id", authenticateToken, async (req, res) => {
  const otherUser = await User.findById(req.params.id);
  const messages = await Message.find({
    $or: [
      { from: res.locals.user._id, to: otherUser._id },
      { from: otherUser._id, to: res.locals.user._id }
    ]
  }).populate("from to", "username").sort("createdAt");

  res.render("messageDetail", { otherUser, messages, link: "messages" });
});

// Mesaj gönder
router.post("/:id", authenticateToken, async (req, res) => {
  const msg = await Message.create({
    from: res.locals.user._id,
    to: req.params.id,
    text: req.body.text
  });
 await msg.populate('from', 'username'); // opsiyonel
res.json({ success: true, message: msg });
});

export default router;
