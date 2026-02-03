const express = require("express");
const router = express.Router();
const db = require("../db");

/* ======================
   LIKE POST
====================== */
router.post("/", async (req, res) => {
  const { post_id, customer_id } = req.body;

  try {
    // 1️⃣ ID validation
    if (!post_id || isNaN(post_id) || !customer_id || isNaN(customer_id)) {
      return res.status(400).json({
        message: "Invalid post_id or customer_id"
      });
    }

    // 2️⃣ Post mavjudmi
    const postCheck = await db.query(
      "SELECT post_id FROM posts WHERE post_id = $1",
      [post_id]
    );
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // 3️⃣ User mavjudmi
    const userCheck = await db.query(
      "SELECT customer_id FROM customers WHERE customer_id = $1",
      [customer_id]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 4️⃣ Like qo‘shish
    await db.query(
      "INSERT INTO likes (post_id, customer_id) VALUES ($1, $2)",
      [post_id, customer_id]
    );

    res.status(201).json({
      message: "Liked"
    });

  } catch (err) {
    // 5️⃣ Duplicate like
    if (err.code === "23505") {
      return res.status(400).json({
        message: "Already liked"
      });
    }

    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ======================
   UNLIKE POST
====================== */
router.delete("/", async (req, res) => {
  const { post_id, customer_id } = req.body;

  try {
    // 1️⃣ ID validation
    if (!post_id || isNaN(post_id) || !customer_id || isNaN(customer_id)) {
      return res.status(400).json({
        message: "Invalid post_id or customer_id"
      });
    }

    // 2️⃣ Post mavjudmi
    const postCheck = await db.query(
      "SELECT post_id FROM posts WHERE post_id = $1",
      [post_id]
    );
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // 3️⃣ User mavjudmi
    const userCheck = await db.query(
      "SELECT customer_id FROM customers WHERE customer_id = $1",
      [customer_id]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 4️⃣ Like mavjudmi
    const likeCheck = await db.query(
      "SELECT like_id FROM likes WHERE post_id = $1 AND customer_id = $2",
      [post_id, customer_id]
    );
    if (likeCheck.rows.length === 0) {
      return res.status(400).json({
        message: "Like not found"
      });
    }

    // 5️⃣ Like o‘chirish
    await db.query(
      "DELETE FROM likes WHERE post_id = $1 AND customer_id = $2",
      [post_id, customer_id]
    );

    res.json({
      message: "Unliked"
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;
