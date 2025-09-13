import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";
import pg from "pg";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();

//  .env
const port = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const saltRounds = parseInt(process.env.SALT);

// Global data

// Connect to PostgreSQL
const db = new pg.Client({
  connectionString: process.env.DB,
});
db.connect()
  .then(() => console.log("Conectat la PostgreSQL"))
  .catch((err) => console.error("Eroare la conectare:", err));

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

// Get the main route
app.get("/", (req, res) => {
  res.send("main route");
});

// Registration route
app.post("/registration", (req, res) => {
  const { name, user } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  bcrypt.hash(token, saltRounds, async (err, hash) => {
    if (err) {
      console.log("hash error:" + err);
    } else {
      const answer = await db.query("SELECT * FROM users WHERE username = $1", [
        user,
      ]);
      if (answer.rowCount) {
        res.send({
          success: false,
          err: "User allrady exist",
        });
      } else {
        await db.query(
          "INSERT INTO users(name, username, tocken, password) VALUES($1, $2, $3, $4)",
          [name, user, token, hash]
        );
        res.send({ success: true, name, user, token });
      }
    }
  });
});

// Login route
app.post("/login", async (req, res) => {
  if (!req.body.token)
    return res.status(400).send({ message: "Token missing" });
  const sent = req.body.token.split("|");
  const user = sent[0];
  const token = sent[1];
  const answer = await db.query("SELECT * FROM users WHERE username = $1", [
    user,
  ]);
  if (answer.rowCount) {
    if (await bcrypt.compare(token, answer.rows[0].password)) {
      res.send({ message: answer });
    } else {
      res.send({
        success: false,
        err: "ERR: 001 Login error! QR code not found! ",
      });
    }
  } else {
    res.send({
      success: false,
      err: "ERR 002 Login error! QR code not found! ",
    });
  }
});

// Session route
app.get("/me", (req, res) => {
  res.send("session validate route");
});

// App is starting
app.listen(port, () => {
  console.log("App started and listening: " + port);
});
