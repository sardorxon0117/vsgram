const express = require("express");
const router = express.Router();
const db = require("../db");

// Create post
router.post("/", async (req, res) => {
  const { customer_id, post, hashtag } = req.body;

  const result = await db.query(
    "INSERT INTO posts (customer_id, post, hashtag) VALUES ($1,$2,$3) RETURNING *",
    [customer_id, post, hashtag]
  );

  res.json(result.rows[0]);
});

// Get all posts + like count
router.get("/", async (req, res) => {
  const result = await db.query(`
    SELECT p.post_id,
           p.post,
           p.hashtag,
           p.created_at,
           c.username,
           COUNT(l.like_id) AS like_count
    FROM posts p
    JOIN customers c ON p.customer_id = c.customer_id
    LEFT JOIN likes l ON p.post_id = l.post_id
    GROUP BY p.post_id, c.username
    ORDER BY p.created_at DESC
  `);

  res.json(result.rows);
});

router.delete("/del/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `delete from posts
      where post_id = $1
      returning*`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post topilmadi"
      });
    }
    res.status(200).json({
        message: "Post muvaffaqqiyatli o'chirildi:",
        deletePost: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;
