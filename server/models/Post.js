const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    coverImage: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Programming", "Tech", "AI"],
      required: true,
    },
    tags: [{ type: String }],
    author: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: "" },
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// postSchema.index({ slug: 1 });
postSchema.index({ category: 1, published: 1 });
postSchema.index({ title: "text", excerpt: "text" });

module.exports = mongoose.model("Post", postSchema);
