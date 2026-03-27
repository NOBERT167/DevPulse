const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const { requireAuth } = require("../middleware/auth");

// GET /api/comments/:postId — get comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/comments — create a comment (auth required)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { postId, body, userName, userAvatar } = req.body;
    if (!postId || !body || !body.trim()) {
      return res.status(400).json({ error: "postId and body are required" });
    }
    if (body.length > 2000) {
      return res
        .status(400)
        .json({ error: "Comment too long (max 2000 chars)" });
    }
    const comment = await Comment.create({
      postId,
      userId: req.userId,
      userName: userName || "Anonymous",
      userAvatar: userAvatar || "",
      body: body.trim(),
    });
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// DELETE /api/comments/:id — delete own comment (auth required)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId !== req.userId) {
      return res.status(403).json({ error: "Cannot delete others' comments" });
    }
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

module.exports = router;
