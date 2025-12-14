import React, { useState } from "react";
import TemplateList from "./TemplateList.jsx";
import DynamicForm from "./DynamicForm.jsx";

export default function FormPanel({ onClose, submissions = [], onFormCreated }) {
  const [activeFormId, setActiveFormId] = useState(null);
  const activeForm = submissions.find((s) => s.id === activeFormId);
  const listItems = submissions.map((s) => ({
    ...s,
    title: s.formName,
    description: `Submitted by ${s.userName}`,
  }));

  return (
    <div className="templates-overlay">
      <div className="templates-panel">
        <div className="panel-header">
          <h2>Submitted Forms</h2>
          <button className="secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {!activeForm && (
          <TemplateList
            templates={listItems}
            onSelect={(id) => setActiveFormId(id)}
          />
        )}

        {activeForm && (
          <div className="form-area">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{activeForm.formName}</h3>
              <button
                className="secondary-btn"
                style={{ margin: "15px" }}
                onClick={() => setActiveFormId(null)}
              >
                Back
              </button>
            </div>

            <DynamicForm
              schema={activeForm.schema}
              initialValues={activeForm.values}
              onFormCreated={onFormCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
}
