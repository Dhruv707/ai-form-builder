import React, { useState } from "react";
import TemplateList from "./TemplateList.jsx";
import DynamicForm from "./DynamicForm.jsx";

const BUILTIN_TEMPLATES = [
  {
    id: "cardio",
    title: "Cardiology Intake",
    description: "Heart checkup, symptoms and medications",
    fields: [
      { type: "text", label: "Full name", name: "name", required: true },
      { type: "number", label: "Age", name: "age", required: true },
      {
        type: "radio",
        label: "Do you experience chest pain?",
        name: "chest_pain",
        options: ["Yes", "No"],
        required: true,
        conditions: {
          Yes: [
            { type: "text", label: "Pain description", name: "pain_desc", required: true },
            { type: "number", label: "Pain duration (minutes)", name: "pain_duration" }
          ],
          No: []
        }
      },
      { type: "text", label: "General comments", name: "comments" }
    ]
  },
  {
    id: "dental",
    title: "Dental Intake",
    description: "Tooth pain, last visit and insurance",
    fields: [
      { type: "text", label: "Full name", name: "name", required: true },
      { type: "number", label: "Age", name: "age", required: true },
      {
        type: "radio",
        label: "Do you have tooth pain?",
        name: "tooth_pain",
        options: ["Yes", "No"],
        required: true,
        conditions: {
          Yes: [
            { type: "text", label: "Area affected", name: "tooth_area" },
            { type: "number", label: "Pain intensity (1-10)", name: "pain_intensity" }
          ],
          No: []
        }
      },
      { type: "text", label: "Insurance provider", name: "insurance" }
    ]
  },
  {
    id: "general",
    title: "Patient Intake (General)",
    description: "General intake with diabetes-specific questions",
    fields: [
      { type: "text", label: "Full name", name: "name", required: true },
      { type: "number", label: "Age", name: "age", required: true },
      {
        type: "radio",
        label: "Are you diabetic?",
        name: "diabetic",
        options: ["Yes", "No"],
        required: true,
        conditions: {
          Yes: [
            { type: "number", label: "Duration (years)", name: "diabetes_duration", required: true },
            { type: "text", label: "Current medications", name: "medications" },
            {
              type: "radio",
              label: "Do you take insulin?",
              name: "takes_insulin",
              options: ["Yes", "No"],
              conditions: {
                Yes: [{ type: "number", label: "Daily units", name: "daily_units", required: true }],
                No: []
              }
            }
          ],
          No: []
        }
      },
      { type: "text", label: "General comments", name: "comments" }
    ]
  }
];

function TemplatePanel({ onClose, customTemplates = [],onFormCreated }) {
  const ALL_TEMPLATES = [...BUILTIN_TEMPLATES, ...customTemplates];

  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const activeTemplate = ALL_TEMPLATES.find((t) => t.id === activeTemplateId);

  return (
    <div className="templates-overlay">
      <div className="templates-panel">
        
        <div className="panel-header">
          <h2>Form Templates</h2>
          <button className="secondary-btn" onClick={onClose}>Close</button>
        </div>

        {!activeTemplate && (
          <TemplateList
            templates={ALL_TEMPLATES}
            onSelect={(id) => setActiveTemplateId(id)}
          />
        )}

        {activeTemplate && (
          <div className="form-area">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{activeTemplate.title}</h3>
              <button className="secondary-btn" style={{margin: "15px"}} onClick={() => setActiveTemplateId(null)}>
                Back
              </button>
            </div>

            <DynamicForm schema={{ title: activeTemplate.title, fields: activeTemplate.fields }} onFormCreated={onFormCreated} />
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplatePanel;
