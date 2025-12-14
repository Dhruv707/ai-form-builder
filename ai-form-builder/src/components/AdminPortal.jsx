// src/components/AdminPortal.jsx
import { useState } from "react";
import { useLLM } from "../hooks/useLLM";
import LivePreview from "./LivePreview";
import SchemaEditor from "./SchemaEditor";
import TemplatePanel from "./TemplatePanel";
import FormPanel from "./FormPanel";

const AdminPortal = ({ onTemplateCreated, onFormCreated, templates, forms }) => {
  const [prompt, setPrompt] = useState("");
  const [schema, setSchema] = useState(null);
  const [schemaErrors, setSchemaErrors] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showForms, setShowForms] = useState(false);

  const { generateSchema, loading, error } = useLLM();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setSchemaErrors([]);
    const newSchema = await generateSchema(prompt);
    if (newSchema) {
      setSchema(newSchema);
    }
  };

  const handleSchemaApply = (newSchema) => {
    setSchema(newSchema);
  };

const handleSaveTemplate = () => {
    if (!schema || schemaErrors.length > 0) return;
    const title = window.prompt("Enter a title for this template:");
    if (!title) return;

    onTemplateCreated?.({
      id: "custom_" + Date.now(),
      title,
      description: "Custom template",
      fields: schema.fields,
    });

    alert("Template saved!");
  };

const canSaveTemplate =
  schema &&
  Object.keys(schema).length > 0 &&
  schemaErrors.length === 0;

  return (
    <div className="admin-container">
      <div className="admin-heading">
      <h2 className="admin-title">Admin Portal</h2>
      <div>
      <button
          className="primary-btn small"
          style={{ margin: "18px" }}
          onClick={() => setShowTemplates(true)}
        >
          Templates
      </button>
      <button
          className="primary-btn small"
          style={{ margin: "18px" }}
          onClick={() => setShowForms(true)}
        >
          Forms
      </button>
      </div>
      </div>
      <textarea
        rows={4}
        className="admin-textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder='E.g. "Create a patient intake form with diabetes-related conditional questions."'
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="primary-btn"
        style={{ marginTop: 12 }}
      >
        {loading ? "Generating..." : "Generate Schema"}
      </button>

      {error && <p className="error-text">Error: {error}</p>}

      {/* Schema editor should ALWAYS be visible */}
      <SchemaEditor
        schema={schema}
        aiPrompt={prompt}
        onApplySchema={handleSchemaApply}
        onValidationChange={setSchemaErrors}
      />

      {/* Live preview only when schema exists */}
      {/* Live preview only when schema exists */}
{schema && (
  <>
    <LivePreview schema={schema} errorsByName={{}} />

    <div style={{ marginTop: 16 }}>
      <button
        className="primary-btn"
        disabled={!canSaveTemplate}
        onClick={() => handleSaveTemplate()}
      >
        Add to Templates
      </button>
    </div>
  </>
)}


      {showTemplates && (
        <TemplatePanel
          onClose={() => setShowTemplates(false)}
          customTemplates={templates}
          onFormCreated={onFormCreated}
        />
      )}
      {showForms && (
        <FormPanel
          onClose={() => setShowForms(false)}
          submissions={forms}
          onFormCreated={onFormCreated}
        />
      )}
    </div>
  );
};

export default AdminPortal;
