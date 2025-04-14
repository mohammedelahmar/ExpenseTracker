# 💸 ExpenseTracker

A **FULL-STACK EXPENSE TRACKING APP** that helps users **manage their finances**, **categorize expenses**, and **track spending habits** effortlessly.

---

## 🗂️ Project Structure

This project is divided into two parts:

- 🧑‍💻 **Client** – React frontend application  
- 🔧 **Server** – Node.js backend API

---

## ✨ Features

- 🔐 User authentication and account management
- 💰 Expense tracking with smart categorization
- 📊 Financial reporting and insightful analytics
- 📱 Responsive design for mobile and desktop

---

## 🛠️ Technologies Used

### 🧑‍🎨 Frontend
- ⚛️ React
- 🎨 CSS / SCSS
- 🧠 Context API for state management

### 🔙 Backend
- 🟢 Node.js
- 🚂 Express
- 🍃 MongoDB (configured via `db.js` in `config` folder)
- 🛡️ JWT Authentication

---

## ⚙️ Installation & Setup

### ✅ Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/)

### 📦 Clone the Repository
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

### 🚀 Setup Server
```bash
cd server
npm install
cp .env.example .env   # Create and configure your environment variables
npm start
```

### 💻 Setup Client
```bash
cd ../client
npm install
cp .env.example .env   # Create and configure your environment variables
npm start
```

---

## 📚 API Documentation

The API includes the following endpoints:

- 🔐 Authentication routes (register, login, logout)
- 💸 Expense management (create, update, delete, list)
- 🏷️ Category management (create, update, delete, list)

---

## 🤝 Contributing

We welcome contributions from the community! 🧑‍💻

If you'd like to help:
1. Fork this repository
2. Create a new branch (`git checkout -b feature-xyz`)
3. Commit your changes (`git commit -am 'Add feature'`)
4. Push to the branch (`git push origin feature-xyz`)
5. Submit a Pull Request ✅

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

---

Made with 💖 by [Your Name](https://github.com/yourusername)

