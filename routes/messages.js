const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// Middleware: login kontrolü
function isLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

// Tüm kullanıcılarla konuşma listesi
router.get("/", isLoggedIn, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.session.userId } });
  res.render("messages", { users });
});

// Belirli kullanıcıyla mesajları gör
router.get("/:id", isLoggedIn, async (req, res) => {
  const otherUserId = req.params.id;
  const messages = await Message.find({
    $or: [
      { from: req.session.userId, to: otherUserId },
      { from: otherUserId, to: req.session.userId }
    ]
  }).populate("from to");

  const otherUser = await User.findById(otherUserId);
  res.render("messageDetail", { messages, otherUser });
});

// Mesaj gönderme
router.post("/:id", isLoggedIn, async (req, res) => {
  const otherUserId = req.params.id;
  await Message.create({
    from: req.session.userId,
    to: otherUserId,
    text: req.body.text
  });
  res.redirect("/messages/" + otherUserId);
});

module.exports = router;
