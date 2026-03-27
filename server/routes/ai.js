const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many AI requests, please try again later" },
});

// POST /api/ai/generate — generate blog draft using AI
router.post("/generate", requireAdmin, aiLimiter, async (req, res) => {
  try {
    const { prompt, category } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemPrompt = `You are a professional blog writer for DevPulse, a tech blog platform. 
Write a high-quality blog post draft based on the user's prompt.
Category: ${category || "Tech"}
Format the response as JSON with these fields:
- title: A compelling blog title
- excerpt: A 1-2 sentence summary (max 200 chars)
- content: The full blog post in HTML format with proper headings, paragraphs, and code blocks where appropriate
- tags: An array of 3-5 relevant tags`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI API key not configured" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt.trim() },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errData);
      return res.status(502).json({ error: "AI service unavailable" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: "No response from AI" });
    }

    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate blog draft" });
  }
});

module.exports = router;
