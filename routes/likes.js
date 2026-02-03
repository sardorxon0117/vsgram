const express = require("express");
const router = express.Router();
const db = require("../db");

// Like
router.post("/", async (req, res) => {
  const { post_id, customer_id } = req.body;

  try {
    // 1️⃣ Post bormi?
    const postCheck = await db.query(
      "SELECT post_id FROM posts WHERE post_id = $1",
      [post_id]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // 2️⃣ User bormi?
    const userCheck = await db.query(
      "SELECT customer_id FROM customers WHERE customer_id = $1",
      [customer_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 3️⃣ Like qo‘shish
    await db.query(
      "INSERT INTO likes (post_id, customer_id) VALUES ($1,$2)",
      [post_id, customer_id]
    );

    res.json({ message: "Liked" });

  } catch (err) {
    // 4️⃣ Agar oldin like bosilgan bo‘lsa
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


// Unlike
router.delete("/", async (req, res) => {
  const { post_id, customer_id } = req.body;

  await db.query(
    "DELETE FROM likes WHERE post_id=$1 AND customer_id=$2",
    [post_id, customer_id]
  );

  res.json({ message: "Unliked" });
});

module.exports = router;
