# User Management SPA

This is a **Single Page Application (SPA)** built with **Vanilla JavaScript** that manages users (add, edit, delete) with different roles: **admin** and **visitor**.

## 📂 Project Structure

```
├── index.html
├── script.js
├── /views
│   ├── users.html
│   ├── newUser.html
│   ├── editUser.html
│   └── login.html
├── /img
│   └── randomGuy.jpg
├── db.json (JSON Server for mock backend)
```

## 🚀 Features

- Role-based access control (admin or visitor).
- Client-side routing without page reloads.
- Add new users with validations.
- Edit existing user data.
- Delete users (admin only).
- Session persistence using `localStorage`.
- SPA navigation with history management.
- Login and guest access simulation.
- Uses `fetch` API for CRUD with a local JSON Server.

## 👨‍💻 Technologies

- JavaScript (ES6+)
- HTML/CSS
- [JSON Server](https://github.com/typicode/json-server) (mock backend)

## ⚙️ How to Run

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install JSON Server globally (if you don't have it)

```bash
npm install -g json-server
```

### 3. Start JSON Server

```bash
json-server --watch db.json --port 3000
```

### 4. Start the frontend (Vite or use Live Server)

If you're using Vite:

```bash
npm install
npm run dev
```

Or, you can open `index.html` directly using the **Live Server** extension in VSCode.

## 🧪 Dummy Admins Example

Make sure `db.json` contains something like:

```json
{
  "admins": [
    { "user": "admin", "password": "1234" }
  ],
  "users": []
}
```

## 🔐 Roles

- **Admin**:
  - Full access to create, edit, delete users.
  - Can see all action buttons.
- **Visitor**:
  - Read-only access to user list.
  - Cannot edit or delete.

## 📌 Notes

- You must **login first** as admin or visitor to access the app.
- All routing is handled via `navigate()` without reloading the page.
- If you're redirected to the login page unexpectedly, check `localStorage`.

---

Made with 💻 by Sharon Ortiz
