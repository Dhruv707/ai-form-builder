// src/components/TemplateCard.jsx
import React from "react";

export default function TemplateCard({ title, description, onOpen = () => {} }) {
  return (
    <div className="template-card-large" style={{ marginBottom: 20 }}>
      <div className="template-thumb" />

      {/* stack title + button + description */}
      <div className="template-content" style={{ flex: 1, display: "flex", flexDirection: "column" ,borderBottom: "1px solid #95939375" }}>
        
        {/* Title + Open button row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <h4 style={{ margin: 0 }}>{title}</h4>

          <button className="primary-btn small" onClick={onOpen}>
            Open
          </button>
        </div>

        {/* Description slightly lower */}
        {description && (
          <p className="muted" style={{ marginTop: 8 }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
