const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// GET /api/posts — list published posts (with optional search & category filter)
router.get("/", async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const filter = { published: true };

    if (category && ["Programming", "Tech", "AI"].includes(category)) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-content"),
      Post.countDocuments(filter),
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

// GET /api/posts/:slug — single post by slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

module.exports = router;
