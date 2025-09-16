import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const router = express.Router();

// Kullanıcıların listesini göster
router.get("/", authenticateToken, async (req, res) => {
  const users = await User.find({ _id: { $ne: res.locals.user._id } });
res.render("messages", { users, link: "messages" });

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

  res.render("messageDetail", { otherUser, messages,
      link: "messages"  
   });
});

// Mesaj gönder
router.post("/:id", authenticateToken, async (req, res) => {
  await Message.create({
    from: res.locals.user._id,
    to: req.params.id,
    text: req.body.text
  });
  res.redirect("/messages/" + req.params.id);
});

export default router;
