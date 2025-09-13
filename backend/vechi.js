import express from "express";
import dotenv from "dotenv";
import pg from "pg";
import crypto from "crypto";
import bcrypt from "bcrypt";
import cors from "cors";

const saltRounds = 10;

dotenv.config();

const app = express();
const port = process.env.PORT || 3030;

// URL frontend din .env
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// CORS middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// conectare la PostgreSQL
const db = new pg.Client({
  connectionString: process.env.DB,
});

db.connect()
  .then(() => console.log("Conectat la PostgreSQL"))
  .catch((err) => console.error("Eroare la conectare:", err));

// test
app.get("/", (req, res) => {
  res.send("Serverul a pornit și ascultă");
});

// token din body
app.post("/login", async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).send({ message: "Token lipsă" });

  try {
    const result = await db.query("SELECT * FROM users");

    for (let user of result.rows) {
      const match = await bcrypt.compare(token, user.password);
      if (match) {
        return res.send({
          message: "Login reușit ✅",
          user: { name: user.name },
        });
      }
    }

    res.status(401).send({ message: "Token invalid ❌" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Eroare la login" });
  }
});

app.post("/register", (req, res) => {
  const { name } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  bcrypt.hash(token, saltRounds, async (err, hash) => {
    if (err) {
      console.log("hash error:" + err);
    } else {
      await db.query(
        "INSERT INTO users(name, username, password) VALUES($1, $2, $3)",
        [name, token, hash]
      );
      res.send({ success: true, name, token });
    }
  });
});

app.get("/me", (req, res) => {});

// start server
app.listen(port, () => {
  console.log("App start și ascultă pe port: " + port);
});
