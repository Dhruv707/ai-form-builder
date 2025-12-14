import React, { useState, useRef, useEffect } from "react";
import { downloadJSON, downloadCSV } from "../utils/download";

function renderInput(field, value, onChange) {
  if (field.type === "text") {
    return (
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        placeholder={field.label}
      />
    );
  }

  if (field.type === "radio") {
    return (
      <div className="radio-group">
        {field.options?.map((opt) => (
          <label key={opt} className="radio-option">
            <input
              type="radio"
              name={field.name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            <span style={{ marginLeft: 6 }}>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
  );
}

export default function DynamicForm({ schema, onFormCreated, initialValues }) {
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const setValue = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null }));
  };

  useEffect(() => {
    if (initialValues) {
      setFormState(initialValues);
      setErrors({});
    }
  }, [initialValues]);

  // ---- VALIDATION ----
  const validateField = (field) => {
    const value = formState[field.name];

    if (
      field.required &&
      (value === "" || value === undefined || value === null)
    ) {
      return `${field.label} is required`;
    }
    return null;
  };

  const collectErrors = () => {
    const newErrors = {};

    const visit = (fields) => {
      (fields || []).forEach((field) => {
        const err = validateField(field);
        if (err) newErrors[field.name] = err;

        if (field.type === "radio" && field.conditions) {
          const selected = formState[field.name];
          if (selected && field.conditions[selected]) {
            visit(field.conditions[selected]);
          }
        }
      });
    };

    visit(schema.fields);
    return newErrors;
  };

  const validateAll = () => {
    const newErrors = collectErrors();
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormComplete = () => {
    const newErrors = collectErrors();
    return Object.keys(newErrors).length === 0;
  };

  const exportJSON = () => {
    if (!validateAll()) return;
    downloadJSON("form-response.json", formState);
  };

  const exportCSV = () => {
    if (!validateAll()) return;
    downloadCSV("form-response.csv", [formState]);
  };

  const handleSaveForm = () => {
    if (!schema) return;
    if (!validateAll()) return;

    const formName = window.prompt("Enter form title:");
    if (!formName) return;

    const userName = window.prompt("Enter user name:");
    if (!userName) return;
    onFormCreated?.({
      id: "submission_" + Date.now(),
      formName,
      userName,
      schema,
      values: formState,
    });

    setFormState({});
    setErrors({});
    alert("Form saved!");
  };

  const renderFields = (fields) =>
    (fields || []).map((field) => {
      const value = formState[field.name];
      const err = errors[field.name];

      return (
        <div key={field.name} className="form-field">
          <label className="field-label">
            {field.label}
            {field.required && <span className="required"> *</span>}
          </label>

          <div className="field-input">
            {renderInput(field, value, (v) => setValue(field.name, v))}
          </div>

          {err && <div className="field-error">{err}</div>}

          {field.type === "radio" &&
            field.conditions &&
            field.conditions[value] &&
            field.conditions[value].length > 0 && (
              <div className="conditional-block">
                {renderFields(field.conditions[value])}
              </div>
            )}
        </div>
      );
    });

  return (
    <div className="panel-wrapper">
      <div className="form-panel dynamic-form">
        <div ref={formRef}>{renderFields(schema.fields)}</div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button className="primary-btn" onClick={exportJSON}>
            Export Response (JSON)
          </button>

          <button className="secondary-btn" onClick={exportCSV}>
            Export Response (CSV)
          </button>

          <button
            className="secondary-btn"
            onClick={() => {
              setFormState({});
              setErrors({});
            }}
          >
            Reset
          </button>
          <button
            className="secondary-btn"
            onClick={() => {
              handleSaveForm();
            }}
            disabled={!isFormComplete()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
