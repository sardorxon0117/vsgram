const express = require("express");
const router = express.Router();
const db = require("../db");

// Like
router.post("/", async (req, res) => {
  const { post_id, customer_id } = req.body;

  try {
    await db.query(
      "INSERT INTO likes (post_id, customer_id) VALUES ($1,$2)",
      [post_id, customer_id]
    );
    res.json({ message: "Liked" });
  } catch (err) {
    res.status(400).json({ message: "Already liked" });
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
