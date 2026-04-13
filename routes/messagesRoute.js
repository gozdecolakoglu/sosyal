import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const router = express.Router();

// Kullanıcıların listesini göster
router.get("/", authenticateToken, async (req, res) => {
  const user = res.locals.user;
  if (!user) return res.redirect("/login");
  const userId = user._id;

  // Tüm kullanıcılar (kendisi hariç)
  const allUsers = await User.find({ _id: { $ne: userId } });

  // Kullanıcının mesajlaştığı mesajlar
  const messages = await Message.find({
    $or: [{ from: userId }, { to: userId }]
  }).populate("from to", "username avatar");

  // Unique kullanıcıları map ile bul
  const usersMap = new Map();
  messages.forEach(msg => {
    if (msg.from && String(msg.from._id) !== String(userId)) {
      usersMap.set(msg.from._id.toString(), msg.from);
    }
    if (msg.to && String(msg.to._id) !== String(userId)) {
      usersMap.set(msg.to._id.toString(), msg.to);
    }
  });

  const conversationUsers = Array.from(usersMap.values());

  res.render("messages", { users: allUsers, conversationUsers, link: "messages" });
});

// Belirli bir kullanıcı ile olan mesajları listele
router.get("/:id", authenticateToken, async (req, res) => {
  const user = res.locals.user;
  if (!user) return res.redirect("/login");

  const otherUser = await User.findById(req.params.id);
  if (!otherUser) return res.redirect("/messages");

  const messages = await Message.find({
    $or: [
      { from: user._id, to: otherUser._id },
      { from: otherUser._id, to: user._id }
    ]
  }).populate("from to", "username avatar").sort("createdAt");

  res.render("messageDetail", { otherUser, messages, link: "messages" });
});

// Mesaj gönder
router.post("/:id", authenticateToken, async (req, res) => {
  const user = res.locals.user;
  if (!user) return res.status(401).json({ success: false, error: "Not logged in" });

  const msg = await Message.create({
    from: user._id,
    to: req.params.id,
    text: req.body.text
  });
 await msg.populate('from', 'username'); // opsiyonel
res.json({ success: true, message: msg });
});

export default router;
