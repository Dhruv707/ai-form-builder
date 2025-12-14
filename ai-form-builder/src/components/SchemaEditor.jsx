// src/components/SchemaEditor.jsx
import { useEffect, useRef, useState } from "react";
import { validateSchema } from "../utils/jsonValidator";
import { downloadJSON } from "../utils/download";

const SchemaEditor = ({ schema, aiPrompt, onApplySchema, onValidationChange}) => {
  const textareaRef = useRef(null);
  const initialSchemaRef = useRef(null);
  const fileInputRef = useRef(null); // ✅ added

  const [textValue, setTextValue] = useState("");
  const [schemaErrors, setSchemaErrors] = useState([]);
  const [showAppliedMessage, setShowAppliedMessage] = useState(false);

  // keep initial AI schema only once
useEffect(() => {
  if (schema && Object.keys(schema).length > 0) {
    if (!initialSchemaRef.current) {
      initialSchemaRef.current = schema;
    }

    setTextValue(JSON.stringify(schema, null, 2));

    const res = validateSchema(schema);
    const errs = res.errors || [];

    setSchemaErrors(errs);
    onValidationChange?.(errs);
  } else {
    setTextValue("");
    setSchemaErrors([]);
    onValidationChange?.([]);
  }
}, [schema, onValidationChange]);




  const handleChange = (e) => {
    setTextValue(e.target.value);
  };

  // apply changes
  const handleSave = () => {
  try {
    const parsed = JSON.parse(textValue);
    const res = validateSchema(parsed);
    if (!res.valid) {
      setSchemaErrors(res.errors || []);
      onValidationChange?.(errs);
      return;
    }

    onApplySchema(parsed);
    setSchemaErrors([]);
    onValidationChange?.([]);

    setShowAppliedMessage(true);
    setTimeout(() => setShowAppliedMessage(false), 2000);
  } catch {
    const parseErr = [
      {
        path: "",
        message: "JSON parse error — fix JSON syntax",
        suggestion: "Check commas, brackets and object structure.",
      },
    ]
    setSchemaErrors(parseErr);
    onValidationChange?.(parseErr);
  }
};


  // reset to original AI schema
const handleReset = () => {
  const base = initialSchemaRef.current;

  if (!base || Object.keys(base).length === 0) {
    setTextValue("");
    setSchemaErrors([]);
    onValidationChange?.([]);
    onApplySchema(base);
  } else {
    setTextValue(JSON.stringify(base, null, 2));
    const res = validateSchema(base);
    const errs = res.errors || [];
    setSchemaErrors(errs);
    onValidationChange?.(errs);
    onApplySchema(base);
  }

  textareaRef.current?.focus();
};


  // ✅ import JSON from file
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      if (typeof content === "string") {
        setTextValue(content);
        handleChange({ target: { value: content } });
      }
    };
    reader.readAsText(file);

    // allow re-selecting the same file
    e.target.value = "";
  };

  // jump to path (simple + safe)
  const jumpToPath = (path) => {
    if (!textareaRef.current || !path) return;
    const idx = textareaRef.current.value.indexOf(path.split(".").pop());
    if (idx >= 0) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(idx, idx);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h4>Edit Schema (JSON)</h4>

      <textarea
        ref={textareaRef}
        rows={12}
        style={{ width: "100%", fontFamily: "monospace" }}
        value={textValue}
        onChange={handleChange}
      />

      {/* hidden file input for import */}
      <input
        type="file"
        accept=".json,application/json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Errors */}
      {schemaErrors.length > 0 && (
        <div className="schema-errors-panel" style={{ marginTop: 12 }}>
          <h4>Schema issues detected</h4>
          {schemaErrors.map((err, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{err.path || "(root)"}</strong>: {err.message}
              {err.suggestion && (
                <div style={{ marginTop: 4 }}>
                  <em>Suggestion:</em> {err.suggestion}
                </div>
              )}
              {err.path && (
                <button
                  className="secondary-btn small"
                  onClick={() => jumpToPath(err.path)}
                  style={{margin: "10px 0"}}
                >
                  Jump to JSON
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAppliedMessage && (
        <div className="alert-message">Changes applied</div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button onClick={handleSave} className="primary-btn">
          Save Changes
        </button>
        <button onClick={handleReset} className="primary-btn">
          Reset Editor
        </button>
        <button onClick={handleImport} className="primary-btn">
          Import JSON
        </button>
        {schema && (
          <button
            className="primary-btn"
            onClick={() => downloadJSON("schema.json", schema)}
          >
            Download Schema (JSON)
          </button>
        )}
      </div>
    </div>
  );
};

export default SchemaEditor;
