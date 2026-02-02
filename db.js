const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://vsgram:XfRNNDzioI8LaWK1AvUyqdnb3FBVgI2o@dpg-d60bj50gjchc7398rl8g-a.singapore-postgres.render.com/vsgram",
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
