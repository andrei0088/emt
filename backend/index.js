import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

dotenv.config();
const app = express();
const port = process.env.PORT || 3030;
const FRONTEND_URL = process.env.REACT;
const saltRounds = parseInt(process.env.SALT || "10");
const secret = process.env.SESSION_SECRET;

// PostgreSQL
const db = new pg.Client({ connectionString: process.env.DB });
db.connect()
  .then(() => console.log("Conectat la PostgreSQL"))
  .catch((err) => console.error("Eroare la conectare:", err));

const PgSession = connectPgSimple(session);

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
    store: new PgSession({
      pool: db,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport
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

// Middleware admin
const adminCheck = (req, res) => !req.isAuthenticated() || req.user.lvl !== 99;

// Routes
app.get("/", (req, res) => res.send("main route"));

// Registration
app.post("/registration", async (req, res) => {
  try {
    const { name, user } = req.body;
    if (!name || !user) return res.status(400).send({ err: "Missing fields" });

    const exists = await db.query("SELECT * FROM users WHERE username = $1", [
      user,
    ]);
    if (exists.rowCount)
      return res.send({ success: false, err: "User already exists" });

    const token = crypto.randomBytes(20).toString("hex");
    const hash = await bcrypt.hash(token, saltRounds);
    await db.query(
      "INSERT INTO users(name, username, token, password) VALUES($1,$2,$3,$4)",
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

// -----------------
// Victime routes
// -----------------

// Add Victima
app.post("/addvictima", async (req, res) => {
  if (!req.isAuthenticated() || req.user.lvl === 0)
    return res.status(403).send({ success: false, message: "Forbidden" });

  const { loc, codqr, cod, nume, prenume, varsta, sex } = req.body;
  const codInt = cod ? parseInt(cod) : null;
  const varstaInt = varsta ? parseInt(varsta) : null;

  try {
    const insertVictima = await db.query(
      `INSERT INTO victime (codqr, cod, nume, prenume, varsta, sex)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [
        codqr || null,
        codInt,
        nume || null,
        prenume || null,
        varstaInt,
        sex || null,
      ]
    );
    const victimaId = insertVictima.rows[0].id;

    await db.query(`INSERT INTO loc_victima (victima_id, loc) VALUES ($1,$2)`, [
      victimaId,
      loc,
    ]);

    res.send({ success: true, victimaId });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

// Get victime by loc
app.get("/getvictime/:loc", async (req, res) => {
  if (!req.isAuthenticated() || req.user.lvl === 0)
    return res.status(403).send({ success: false, message: "Forbidden" });

  const loc = req.params.loc.toLowerCase();
  try {
    const result = await db.query(
      `SELECT v.*
       FROM victime v
       JOIN loc_victima l ON v.id = l.victima_id
       WHERE l.loc = $1`,
      [loc]
    );
    res.send({ success: true, victime: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

// Get victima by id
app.get("/victime/:id", async (req, res) => {
  const victimaId = req.params.id;
  try {
    const result = await db.query("SELECT * FROM victime WHERE id = $1", [
      victimaId,
    ]);
    const loc = await db.query(
      "SELECT loc FROM loc_victima WHERE victima_id = $1",
      [victimaId]
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .send({ success: false, message: "Victima nu a fost găsită." });
    result.rows[0].loc = loc.rows[0].loc;
    res.send({ success: true, victima: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

// Update victima
app.put("/victime/:id", async (req, res) => {
  const victimaId = req.params.id;
  const { cod, codqr, nume, prenume, varsta, sex, loc } = req.body;

  try {
    const result = await db.query(
      `UPDATE victime
       SET cod = $1, codqr = $2, nume = $3, prenume = $4, varsta = $5, sex = $6
       WHERE id = $7 RETURNING *`,
      [cod, codqr, nume, prenume, varsta, sex, victimaId]
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .send({ success: false, message: "Victima nu a fost găsită." });

    if (loc) {
      await db.query(
        `UPDATE loc_victima SET loc = $1, updated_at = NOW() WHERE victima_id = $2`,
        [loc.toLowerCase(), victimaId]
      );
    }

    res.send({ success: true, victima: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

// Start server
app.listen(port, () => console.log("🚀 App started on port " + port));
