# EMT

A full-stack application for **emergency victim management**.  
The system allows registering victims, assigning them to specific categories (_Focar_, _PRV_, _PMA_, _Evacuare_), and managing them through different user roles.

Built with **Express**, **Passport Local authentication**, **PostgreSQL**, and a **React + Vite frontend**.

---

## ✨ Features

- 🔑 Authentication & sessions with **Passport Local**
- 👥 User roles (`lvl`)
  - `lvl = 0`: restricted (cannot add victims)
  - `lvl > 0`: can register and manage victims
- 📝 Victims stored in a centralized `victime` table
- 📂 Victims automatically linked to category via `loc_victima` table (`Focar`, `PRV`, `PMA`, `Evacuare`)
- 📊 View victims grouped by category
- ⚡ CRUD operations (Add, Edit, Update)
- 🛡️ Admin panel for user management (approve, delete, regenerate token)
- 🎨 Modern UI with React, Vite, and TailwindCSS

---

## ⚙️ Requirements

- **Node.js** (recommended: v18 or later)
- **PostgreSQL**
- **npm** or **yarn**

---

## 📦 Project Structure

```
backend/         # Express + Passport + PostgreSQL API
    index.js
    package.json
    .env
emt/             # React frontend (Vite)
    src/
    components/
    App.jsx
    package.json
    .env
README.md        # This file
```

---

## 🔧 Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/andrei0088/emt.git
   ```

2. **Configure environment variables:**

   Create a `.env` file in the `backend` folder:

   ```
   PORT=3030
   REACT=http://localhost:5173
   DB=postgres://user:password@localhost:5432/emt_db
   SALT=10
   SESSION_SECRET=your_secret_here
   ```

   And in the `emt` folder:

   ```
   VITE_API_URL=http://localhost:3030
   FRONTEND_URL=http://localhost:5173
   ```

3. **Prepare PostgreSQL database and tables:**

   ```sql
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

   CREATE TABLE loc_victima (
     victima_id INT REFERENCES victime(id),
     loc TEXT,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Install dependencies:**

   - Backend:

     ```bash
     cd backend
     npm install
     ```

   - Frontend:

     ```bash
     cd ../emt
     npm install
     ```

---

## ▶️ Running the project

- **Start backend:**

  ```bash
  cd backend
  npm run dev
  ```

- **Start frontend:**

  ```bash
  cd emt
  npm run dev
  ```

Open the app in your browser at: [http://localhost:5173](http://localhost:5173)

---

## 🖥️ Usage

- Register a new user (default `lvl = 0`) → cannot add victims
- Admins (`lvl > 0`) can:
  - Add victims
  - Assign them to categories (Focar, PRV, PMA, Evacuare)
  - View tables with all victim properties
  - Edit victim entries
  - Manage users from the Admin panel

Victims are color-coded by triage code:

| Code | Value  | Color     |
| ---- | ------ | --------- |
| 5    | Black  | 🖤 Black  |
| 1    | Red    | ❤️ Red    |
| 2    | Yellow | 💛 Yellow |
| 3    | Green  | 💚 Green  |
| 4    | White  | 🤍 White  |

---

## 🚧 Roadmap / To Do

- ✅ Add victims with null fields allowed
- 🔄 Update victims (Edit function)
- 🎨 Better frontend UI styling
- 🧪 Add automated tests
- 🚀 Deployment instructions (Heroku, Railway, or custom VPS)

---

## 📄 License

MIT

---

## 👨‍💻 Author

Andrei D
