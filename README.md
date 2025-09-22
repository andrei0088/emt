# EMT

A full-stack application for **emergency victim management**.  
The system allows registering victims, assigning them to specific categories (*focar*, *prv*, *pma*, *evacuat*), and managing them through different user roles.  

Built with **Express**, **Passport Local authentication**, **PostgreSQL**, and a **React + Vite frontend**.

---

## ✨ Features

- 🔑 Authentication & sessions with **Passport Local**
- 👥 User roles (`lvl`)  
  - `lvl = 0`: restricted (cannot add victims)  
  - `lvl > 0`: can register and manage victims
- 📝 Victims stored in a centralized `victime` table
- 📂 Victims automatically linked to category tables: `focar`, `prv`, `pma`, `evacuat`
- 📊 View victims grouped by category
- ⚡ CRUD operations (Add, Update in progress)

---

## ⚙️ Requirements

- **Node.js** (recommended: v18 or later)
- **PostgreSQL**
- **npm** or **yarn**

---

## 🔧 Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/andrei0088/emt.git
   cd emt/backend

reate a .env file inside the backend folder:

PORT=3030
REACT=http://localhost:5173
DB=postgres://user:password@localhost:5432/emt_db
SALT=10
SESSION_SECRET=your_secret_here


Prepare PostgreSQL database and tables:

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  username VARCHAR(255) UNIQUE,
  token TEXT,
  password TEXT,
  lvl INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE victime (
  id SERIAL PRIMARY KEY,
  codqr TEXT,
  cod INT,
  nume TEXT,
  prenume TEXT,
  varsta INT,
  sex TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE focar (victima_id INT REFERENCES victime(id));
CREATE TABLE prv (victima_id INT REFERENCES victime(id));
CREATE TABLE pma (victima_id INT REFERENCES victime(id));
CREATE TABLE evacuat (victima_id INT REFERENCES victime(id));


Install dependencies:

Backend:

cd backend
npm install


Frontend:

cd ../emt
npm install

▶️ Running the project

Start backend:

cd backend
npm run dev


Start frontend:

cd emt
npm run dev


Open the app in your browser at:

http://localhost:5173

🖥️ Usage

Register a new user (default lvl = 0) → cannot add victims

Admins (lvl > 0) can:

Add victims

Assign them to categories (focar, prv, pma, evacuat)

View tables with all victim properties

Use the Edit button to update entries (work in progress)

Victims are color-coded by triage code:

Code	Value	Color
0	Black	🖤 Black
1	Red	❤️ Red
2	Yellow	💛 Yellow
3	Green	💚 Green
4	White	🤍 White
📂 Project Structure
emt/
├─ backend/         # Express + Passport + PostgreSQL
│   ├─ index.js
│   ├─ routes/
│   └─ ...
└─ emt/             # React frontend (Vite)
    ├─ src/
    ├─ components/
    ├─ App.jsx
    └─ ...

🚧 Roadmap / To Do

✅ Add victims with null fields allowed

🔄 Update victims (Edit function)

🎨 Better frontend UI styling

🧪 Add automated tests

🚀 Deployment instructions (Heroku, Railway, or custom VPS)

