import { useEffect, useState } from "react";
import AdminPortal from "./components/AdminPortal.jsx";
import { login, logout, subscribeToAuthChanges } from "./firebase/auth.js";
import { loadTemplates, saveTemplates } from "./utils/templatesStore.js";
import { loadForms, saveForms } from "./utils/formsStore.js";
import TemplatePanel from "./components/TemplatePanel.jsx";
import FormPanel from "./components/FormPanel.jsx";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState("public");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [templates, setTemplates] = useState([]);
  const [forms, setForms] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [publicMessage, setPublicMessage] = useState("");
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showFormPanel, setShowFormPanel] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuthChanges((u) => {
      setUser(u);
      setIsAdmin(!!u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const loadedTemplates = loadTemplates();
    setTemplates(loadedTemplates);
    const loadedForms = loadForms();
    setForms(loadedForms);
  }, []);

  const handleLogin = async () => {
    try {
      await login(email, password);
      setMode("admin");
    } catch (err) {
      setAdminMessage(err.code || "Login failed");
    }
  };

  const handleLogout = async () => {
    await logout();
    setEmail("");
    setPassword("");
    setAdminMessage("");
  };

  const handleTemplateCreated = (schema) => {
    const newTemplates = [...templates, schema];
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };
  const handleFormCreated = (form) => {
    const newForms = [...forms, form];
    setForms(newForms);
    saveForms(newForms);
  };

  return (
    <div className="app-root">
      <header className="top-bar">
        <div className="top-bar-left">
          <span className="logo-dot" />
          <span className="logo-text">AI Form Studio</span>
        </div>

        <div className="top-bar-right">
          <div className="toggle-group" role="tablist" aria-label="mode switch">
            <button
              className={`tab-btn ${mode === "public" ? "tab-active" : ""}`}
              onClick={() => setMode("public")}
            >
              Public
            </button>
            <button
              className={`tab-btn ${mode === "admin" ? "tab-active" : ""}`}
              onClick={() => {
                setMode("admin");
                setPublicMessage("");
              }}
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-area">
        {/* PUBLIC VIEW */}
        {mode === "public" && (
          <section className="center-panel">
            <h1 className="title">Choose how to create your form</h1>
            <div className="cards-wrapper">
              <div className="cards-row">
                {/* Blank Form */}
                <div
                  className="big-card clickable"
                  onClick={() => {
                    if (isAdmin) {
                      setPublicMessage("");
                    } else {
                      setPublicMessage(
                        "To create a new form, please login as admin."
                      );
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="icon-circle plus">+</div>
                  <h2 className="card-title">Blank Form</h2>
                  <p className="card-subtitle">
                    Create from scratch with an empty form.
                  </p>
                </div>

                {/* Form Templates → show panel */}
                <div
                  className="big-card clickable"
                  onClick={() => setShowTemplatePanel(true)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="icon-circle sheet">≡</div>
                  <h2 className="card-title">Form Templates</h2>
                  <p className="card-subtitle">Choose templates for form</p>
                </div>
                <div
                  className="big-card clickable"
                  onClick={() => setShowFormPanel(true)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="icon-circle sheet">≡</div>
                  <h2 className="card-title">Forms</h2>
                  <p className="card-subtitle">View submitted forms</p>
                </div>
              </div>
              {publicMessage && (
                <div className="alert-message">{publicMessage}</div>
              )}
            </div>

            {/* Show template panel (modal-like panel) */}
            {showTemplatePanel && (
              <TemplatePanel
                onClose={() => setShowTemplatePanel(false)}
                customTemplates={templates}
                onFormCreated={handleFormCreated}
              />
            )}
            {showFormPanel && (
              <FormPanel
                onClose={() => setShowFormPanel(false)}
                submissions={forms}
                onFormCreated={handleFormCreated}
              />
            )}
          </section>
        )}

        {/* ADMIN VIEW */}
        {mode === "admin" && (
          <section className="admin-panel">
            {!user && (
              <div className="login-wrapper">
                <div className="login-card-clean">
                  <h2 className="login-title">Admin Login</h2>
                  <p className="login-subtitle">
                    Sign in to create and manage AI-powered form templates.
                  </p>

                  <div className="login-field">
                    <label>Email</label>
                    <input
                      className="field-input"
                      placeholder="Admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="login-field">
                    <label>Password</label>
                    <input
                      className="field-input"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button
                    className="primary-btn login-btn"
                    onClick={handleLogin}
                  >
                    Login
                  </button>

                  {adminMessage && (
                    <p
                      className="info-text alert-message"
                      style={{ marginTop: "10px" }}
                    >
                      {adminMessage}
                    </p>
                  )}
                </div>
              </div>
            )}

            {user && (
              <div className="admin-content">
                <div className="admin-header-row">
                  <div>
                    <h2 className="title">Welcome, Admin</h2>
                    <p className="card-subtitle">
                      You can generate new schemas and they will appear as
                      templates for public users.
                    </p>
                  </div>

                  <button className="secondary-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>

                <div className="admin-main-card">
                  <h3 className="section-title">Create or edit templates</h3>
                  <AdminPortal
                    templates={templates}
                    forms={forms}
                    onTemplateCreated={handleTemplateCreated}
                    onFormCreated={handleFormCreated}
                  />
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
