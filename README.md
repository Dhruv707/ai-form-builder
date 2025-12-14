# 🧠 AI Form Builder

An **AI-powered dynamic form builder** that converts plain English prompts into **JSON-based form schemas with nested conditional logic**, renders them live on the frontend, and allows validation, preview, and reuse.

This project was built as a **take‑home frontend assignment**, with real‑world architecture choices such as an LLM proxy backend, environment-based configuration, and deployment-ready setup.

---

## 🚀 Live Architecture Overview

```
User → Frontend (React / Vite)
     → Backend (Express on Render)
     → OpenAI API
```

* **Frontend**: Static site (Render)
* **Backend**: Node.js + Express Web Service (Render)
* **LLM**: OpenAI (JSON-only schema generation)

---

## ✨ Key Features

* 📝 **Natural language to form schema** using LLM
* 🧩 **Nested conditional logic** (recursive conditions, depth ≥ 2)
* 👀 **Live form preview** while editing schema
* ✅ **Client-side validation** (required fields, structure checks)
* ♻️ **Reusable templates** (save & reload schemas)
* 🌍 **Environment-based API configuration** (local + production)

---

## 🗂️ Project Structure

```
form-app/            # Firebase for authentication
├── client/          # React + Vite frontend
│   ├── src/          
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── vite.config.js
│
├── server/          # Express backend (LLM proxy)
│   ├── index.js
│   └── package.json
│
└── README.md
```

## 🧠 How It Works

1. **Admin enters a natural language prompt**
2. Prompt is sent to backend `/api/generateSchema`
3. Backend calls OpenAI with **strict JSON-only instructions**
4. AI returns a validated form schema
5. Frontend renders the form dynamically
6. Conditional fields appear based on user input

## 🧪 Health Check

Backend exposes:

```
GET /health
```

Returns:

```json
{ "status": "ok" }
```

---

## 📌 Design Decisions

* **Schema-first approach** → flexible, scalable
* **Recursive conditions** → real-world form complexity
* **LLM proxy backend** → security + control
* **Environment separation** → production-ready

---
## 🧑‍💻 Author

**Dhruv Khatri**
Frontend Engineer

---

## 📄 License

This project is created for evaluation and learning purposes.
