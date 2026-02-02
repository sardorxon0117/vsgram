const express = require("express");
const cors = require("cors");

const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");
const likesRoutes = require("./routes/likes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/likes", likesRoutes);

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
