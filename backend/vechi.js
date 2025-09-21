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

///

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

dotenv.config();
const app = express();

// Config .env
const port = process.env.PORT || 4000;
const FRONTEND_URL = process.env.REACT;
const saltRounds = parseInt(process.env.SALT) || 10;
const secret = process.env.SESSION_SECRET;

// PostgreSQL
const db = new pg.Client({
  connectionString: process.env.DB,
});
db.connect()
  .then(() => console.log("✅ Conectat la PostgreSQL"))
  .catch((err) => console.error("❌ Eroare la conectare:", err));

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session + Passport
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // ⚠️ pune true doar pe HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      if (result.rowCount === 0) {
        return done(null, false, { message: "User not found" });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return done(null, false, { message: "Invalid password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query(
      "SELECT id, username, name FROM users WHERE id = $1",
      [id]
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// ---------------------- ROUTES ----------------------

// Root
app.get("/", (req, res) => {
  res.send("Main route");
});

// Registration
app.post("/registration", async (req, res) => {
  const { name, username, password } = req.body;

  const existing = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  if (existing.rowCount > 0) {
    return res.send({ success: false, err: "User already exists" });
  }

  const hash = await bcrypt.hash(password, saltRounds);

  await db.query(
    "INSERT INTO users(name, username, password) VALUES($1, $2, $3)",
    [name, username, hash]
  );

  res.send({ success: true, name, username });
});

// Login
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login-fail" }),
  (req, res) => {
    res.send({ success: true, user: req.user });
  }
);

app.get("/login-fail", (req, res) => {
  res.send({ success: false, message: "Login failed" });
});

// Me (protected route)
app.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.send({ success: false, message: "Not logged in" });
  }
  res.send({ success: true, user: req.user });
});

// Logout
app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send({ success: false, err });
    res.send({ success: true, message: "Logged out" });
  });
});

// Start server
app.listen(port, () => {
  console.log("🚀 App started and listening on port: " + port);
});
