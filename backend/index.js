import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

dotenv.config();
const app = express();

// Config
const port = process.env.PORT || 3030;
const FRONTEND_URL = process.env.REACT;
const saltRounds = parseInt(process.env.SALT || "10");
const secret = process.env.SESSION_SECRET;

// PostgreSQL connection
const db = new pg.Client({ connectionString: process.env.DB });
db.connect()
  .then(() => console.log("Conectat la PostgreSQL"))
  .catch((err) => console.error("Eroare la conectare:", err));

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
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      if (result.rowCount === 0)
        return done(null, false, { message: "User not found" });

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Invalid password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query(
      "SELECT id, username, name, lvl FROM users WHERE id = $1",
      [id]
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Routes
app.get("/", (req, res) => res.send("main route"));

// Registration
app.post("/registration", async (req, res) => {
  try {
    const { name, user } = req.body;
    if (!name || !user) return res.status(400).send({ err: "Missing fields" });

    const answer = await db.query("SELECT * FROM users WHERE username = $1", [
      user,
    ]);
    if (answer.rowCount)
      return res.send({ success: false, err: "User already exists" });

    const token = crypto.randomBytes(20).toString("hex");
    const hash = await bcrypt.hash(token, saltRounds);
    await db.query(
      "INSERT INTO users(name, username, token, password) VALUES($1, $2, $3, $4)",
      [name, user, token, hash]
    );

    res.send({ success: true, name, user, token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, err: "Server error" });
  }
});

// Login
app.post("/login", (req, res, next) => {
  if (!req.body.token)
    return res.status(400).send({ success: false, message: "Token missing" });

  const [username, password] = req.body.token.split("|");

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.send({
        success: false,
        message: info?.message || "Login failed",
      });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.send({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          lvl: user.lvl,
        },
      });
    });
  })({ body: { username, password } }, res, next);
});

// Me
app.get("/me", (req, res) => {
  if (!req.isAuthenticated())
    return res.send({ success: false, message: "Not logged in" });
  res.send({ success: true, user: req.user });
});

// Logout
app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send({ success: false, err });
    res.send({ success: true, message: "Logged out" });
  });
});

// Admin routes
const adminCheck = (req, res) => !req.isAuthenticated() || req.user.lvl !== 99;

app.get("/admin/users", async (req, res) => {
  if (adminCheck(req, res))
    return res.status(403).send({ success: false, message: "Forbidden" });
  try {
    const result = await db.query(
      "SELECT id, name, username, lvl, created_at FROM users ORDER BY created_at DESC"
    );
    res.send({ success: true, users: result.rows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Server error", error: err.message });
  }
});

app.post("/admin/approve/:id", async (req, res) => {
  if (adminCheck(req, res))
    return res.status(403).send({ success: false, message: "Forbidden" });
  try {
    const userId = req.params.id;
    const result = await db.query("UPDATE users SET lvl = 1 WHERE id = $1", [
      userId,
    ]);
    if (result.rowCount === 0)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    res.send({ success: true, message: "User approved" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Server error", error: err.message });
  }
});

app.post("/admin/regenerate/:id", async (req, res) => {
  if (adminCheck(req, res))
    return res.status(403).send({ success: false, message: "Forbidden" });
  try {
    const userId = req.params.id;
    const token = crypto.randomBytes(20).toString("hex");
    const hash = await bcrypt.hash(token, saltRounds);
    const result = await db.query(
      "UPDATE users SET token = $1, password = $2 WHERE id = $3",
      [token, hash, userId]
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });

    const getuser = await db.query("SELECT username FROM users WHERE id = $1", [
      userId,
    ]);
    console.log("New token for user", getuser.rows[0].username, "is", token);

    res.send({
      success: true,
      message: "User regenerated",
      token,
      user: getuser.rows[0].username,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Server error", error: err.message });
  }
});

app.post("/admin/delete/:id", async (req, res) => {
  if (adminCheck(req, res))
    return res.status(403).send({ success: false, message: "Forbidden" });
  try {
    const userId = req.params.id;
    const result = await db.query("DELETE FROM users WHERE id = $1", [userId]);
    if (result.rowCount === 0)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    res.send({ success: true, message: "User deleted" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Server error", error: err.message });
  }
});

// Add Victimă (toate utilizatorii logați, lvl !== 0)
app.post("/addvictima", async (req, res) => {
  if (!req.isAuthenticated() || req.user.lvl === 0) {
    return res.status(403).send({ success: false, message: "Forbidden" });
  }

  const { loc, codqr, cod, nume, prenume, varsta, sex } = req.body;

  // Convertim la integer doar dacă există valoare, altfel null
  const codInt = cod ? parseInt(cod) : null;
  const varstaInt = varsta ? parseInt(varsta) : null;

  try {
    // 1. Inserare victimă
    const insertVictimaText = `
      INSERT INTO victime (codqr, cod, nume, prenume, varsta, sex)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const result = await db.query(insertVictimaText, [
      codqr || null,
      codInt,
      nume || null,
      prenume || null,
      varstaInt,
      sex || null,
    ]);
    const victimaId = result.rows[0].id;

    // 2. Inserare în tabela locului
    const allowedTables = ["focar", "prv", "pma", "evacuat"];
    if (!allowedTables.includes(loc?.toLowerCase())) {
      return res.status(400).send({ success: false, message: "Loc invalid" });
    }

    await db.query(
      `INSERT INTO ${loc.toLowerCase()} (victima_id) VALUES ($1)`,
      [victimaId]
    );

    res.send({ success: true, victimaId });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

app.get("/gedvictime/:loc", async (req, res) => {
  if (!req.isAuthenticated() || req.user.lvl === 0) {
    return res.status(403).send({ success: false, message: "Forbidden" });
  }

  const loc = req.params.loc.toLowerCase();
  const allowedTables = ["focar", "prv", "pma", "evacuat"];
  if (!allowedTables.includes(loc)) {
    return res.status(400).send({ success: false, message: "Loc invalid" });
  }

  try {
    // Obținem toate id-urile din tabela locului
    const idsResult = await db.query(`SELECT victima_id FROM ${loc}`);
    const victime = [];

    for (const row of idsResult.rows) {
      const victimaResult = await db.query(
        "SELECT * FROM victime WHERE id = $1",
        [row.victima_id]
      );
      if (victimaResult.rowCount > 0) {
        victime.push(victimaResult.rows[0]);
      }
    }

    res.send({ success: true, victime });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

// Start server
app.listen(port, () =>
  console.log("🚀 App started and listening on port " + port)
);
