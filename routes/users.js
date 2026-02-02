const express = require("express");
const router = express.Router();
const db = require("../db");

/* ======================
   REGISTER
====================== */
router.post("/register", async (req, res) => {
  const { username, email, password, bio } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO customers (username, email, password, bio)
       VALUES ($1,$2,$3,$4)
       RETURNING customer_id, username, email, password, bio`,
      [username, email, password, bio]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await db.query(
    `SELECT customer_id, username, email, password, bio
     FROM customers
     WHERE username = $1 AND password = $2`,
    [username, password]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json(result.rows[0]);
});

/* ======================
   GET FULL PROFILE
====================== */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT customer_id, username, email, password, bio
     FROM customers
     WHERE customer_id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(result.rows[0]);
});

router.get("/", async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT customer_id, username, email, password, bio
     FROM customers`
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(result.rows[0]);
});

/* ======================
   UPDATE FULL PROFILE (PASSWORD INCLUDED)
====================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, password, bio } = req.body;

  try {
    const result = await db.query(
      `UPDATE customers
       SET username = $1,
           email = $2,
           password = $3,
           bio = $4
       WHERE customer_id = $5
       RETURNING customer_id, username, email, password, bio`,
      [username, email, password, bio, id]
    );

    // 🔴 Agar id noto‘g‘ri bo‘lsa
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 🟢 Hammasi joyida bo‘lsa
    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

router.delete("/del/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `delete from customers
      where customer_id = $1
      returning*`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    res.status(200).json({
        message: "Muvaffaqqiyatli o'chirildi:",
        deleteCustomer: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});


module.exports = router;
