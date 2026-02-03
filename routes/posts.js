const express = require("express");
const router = express.Router();
const db = require("../db");

/* ======================
   GET ALL POSTS
   (doim yuqorida)
====================== */
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.post_id,
             p.post,
             p.hashtag,
             TO_CHAR(
               p.created_at AT TIME ZONE 'Asia/Tashkent',
               'YYYY-MM-DD HH24:MI:SS'
             ) AS created_at,
             c.username,
             COUNT(l.like_id) AS like_count
      FROM posts p
      JOIN customers c ON p.customer_id = c.customer_id
      LEFT JOIN likes l ON p.post_id = l.post_id
      GROUP BY p.post_id, c.username
      ORDER BY p.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ======================
   GET POST BY ID
====================== */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid post id"
      });
    }

    const result = await db.query(
      `
      SELECT p.post_id,
             p.post,
             p.hashtag,
             TO_CHAR(
               p.created_at AT TIME ZONE 'Asia/Tashkent',
               'YYYY-MM-DD HH24:MI:SS'
             ) AS created_at,
             c.username,
             COUNT(l.like_id) AS like_count
      FROM posts p
      JOIN customers c ON p.customer_id = c.customer_id
      LEFT JOIN likes l ON p.post_id = l.post_id
      WHERE p.post_id = $1
      GROUP BY p.post_id, c.username
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ======================
   CREATE POST
====================== */
router.post("/", async (req, res) => {
  const { customer_id, post, hashtag } = req.body;

  try {
    // 1️⃣ customer_id tekshirish
    if (!customer_id || isNaN(customer_id)) {
      return res.status(400).json({
        message: "Invalid customer_id"
      });
    }

    // 2️⃣ post bo‘sh emas
    if (!post || post.trim() === "") {
      return res.status(400).json({
        message: "Post content is required"
      });
    }

    // 3️⃣ user mavjudmi
    const userCheck = await db.query(
      "SELECT customer_id FROM customers WHERE customer_id = $1",
      [customer_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 4️⃣ post yaratish
    const result = await db.query(
      `
      INSERT INTO posts (customer_id, post, hashtag)
      VALUES ($1, $2, $3)
      RETURNING post_id,
                post,
                hashtag,
                TO_CHAR(
                  created_at AT TIME ZONE 'Asia/Tashkent',
                  'YYYY-MM-DD HH24:MI:SS'
                ) AS created_at
      `,
      [customer_id, post.trim(), hashtag || null]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ======================
   UPDATE POST
====================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { post, hashtag } = req.body;

  try {
    // 1️⃣ id tekshirish
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid post id"
      });
    }

    // 2️⃣ post bo‘sh emas
    if (!post || post.trim() === "") {
      return res.status(400).json({
        message: "Post content is required"
      });
    }

    // 3️⃣ post mavjudmi
    const postCheck = await db.query(
      "SELECT post_id FROM posts WHERE post_id = $1",
      [id]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // 4️⃣ update
    const result = await db.query(
      `
      UPDATE posts
      SET post = $1,
          hashtag = $2
      WHERE post_id = $3
      RETURNING post_id,
                post,
                hashtag,
                TO_CHAR(
                  created_at AT TIME ZONE 'Asia/Tashkent',
                  'YYYY-MM-DD HH24:MI:SS'
                ) AS created_at
      `,
      [post.trim(), hashtag || null, id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ======================
   DELETE POST
====================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid post id"
      });
    }

    const postCheck = await db.query(
      "SELECT post_id FROM posts WHERE post_id = $1",
      [id]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    await db.query(
      "DELETE FROM posts WHERE post_id = $1",
      [id]
    );

    res.json({
      message: "Post deleted"
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;
