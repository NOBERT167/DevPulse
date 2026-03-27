const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { requireAdmin } = require("../middleware/auth");

// All admin routes require admin role
router.use(requireAdmin);

// GET /api/admin/stats — dashboard overview
router.get("/stats", async (_req, res) => {
  try {
    const [totalPosts, publishedPosts, totalComments] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ published: true }),
      Comment.countDocuments(),
    ]);
    res.json({ totalPosts, publishedPosts, totalComments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/admin/posts — all posts (including unpublished)
router.get("/posts", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-content"),
      Post.countDocuments(),
    ]);
    res.json({
      posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/admin/posts/:id — single post with content
router.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /api/admin/posts — create a post
router.post("/posts", async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      published,
      author,
    } = req.body;
    if (!title || !content || !excerpt || !category) {
      return res
        .status(400)
        .json({ error: "title, content, excerpt, and category are required" });
    }
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36);

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt,
      coverImage: coverImage || "",
      category,
      tags: tags || [],
      author: author || { userId: req.userId, name: "Admin", avatar: "" },
      published: published ?? false,
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/admin/posts/:id — update a post
router.put("/posts/:id", async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, published } =
      req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (excerpt !== undefined) update.excerpt = excerpt;
    if (coverImage !== undefined) update.coverImage = coverImage;
    if (category !== undefined) update.category = category;
    if (tags !== undefined) update.tags = tags;
    if (published !== undefined) update.published = published;

    const post = await Post.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /api/admin/posts/:id — delete a post
router.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    // Also delete associated comments
    await Comment.deleteMany({ postId: req.params.id });
    res.json({ message: "Post and associated comments deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// PATCH /api/admin/posts/:id/toggle — toggle publish status
router.patch("/posts/:id/toggle", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.published = !post.published;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle post status" });
  }
});

module.exports = router;
