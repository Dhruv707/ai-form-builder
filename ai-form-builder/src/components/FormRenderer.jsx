import React, { useState, useEffect, forwardRef } from "react";
import { conditionalLogic } from "../utils/conditionalLogic";

const FormRenderer = forwardRef(({ schema, errorsByName = {} }, ref) => {
  const [responses, setResponses] = useState({});
  const [fields, setFields] = useState(schema?.fields || []);

  useEffect(() => {
    if (schema && schema.fields) {
      setFields(schema.fields);
      setResponses({});
    }
  }, [schema]);

  const handleChange = (name, value) => {
    const newResponses = { ...responses, [name]: value };
    setResponses(newResponses);

    const newFields = conditionalLogic(schema.fields, newResponses);
    setFields(newFields);
  };

  const branchMatchesResponse = (parentField, opt) => {
    const val = responses[parentField.name];
    if (val === undefined || val === null || val === "") return false;

    if (parentField.type === "radio" || parentField.type === "select") {
      return val === opt;
    }

    if (parentField.type === "checkbox" || parentField.type === "multiselect") {
      return Array.isArray(val) && val.includes(opt);
    }

    return false;
  };

  const renderField = (field) => {
    const value = responses[field.name];
    const inlineErrors = errorsByName[field.name] || [];

    return (
      <div className="form-field">
        <label className="field-label">
          {field.label}
          {field.required && <span className="required"> *</span>}
        </label>

        {field.type === "text" && (
          <input
            className="field-input"
            type="text"
            value={value ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        )}

        {field.type === "number" && (
          <input
            className="field-input"
            type="number"
            value={value ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        )}

        {field.type === "radio" && field.options && (
          <div className="radio-group">
            {field.options.map((option) => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={responses[field.name] === option}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === "checkbox" && field.options && (
          <div className="checkbox-group">
            {field.options.map((option) => {
              const checked =
                Array.isArray(responses[field.name]) &&
                responses[field.name].includes(option);
              return (
                <label key={option} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    checked={checked}
                    onChange={(e) => {
                      const prev = Array.isArray(responses[field.name])
                        ? responses[field.name].slice()
                        : [];
                      if (e.target.checked) prev.push(option);
                      else {
                        const idx = prev.indexOf(option);
                        if (idx >= 0) prev.splice(idx, 1);
                      }
                      handleChange(field.name, prev);
                    }}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        )}

        {field.type === "select" && field.options && (
          <select
            className="custom-select field-input"
            value={responses[field.name] ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
          >
            <option value="" disabled>
              Select...
            </option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {field.type === "multiselect" && field.options && (
          <select
            className="field-input"
            multiple
            value={responses[field.name] ?? []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(
                (o) => o.value
              );
              handleChange(field.name, selected);
            }}
          >
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {inlineErrors.length > 0 && (
          <div className="field-error">
            {inlineErrors.map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>
        )}

        {field.conditions &&
          Object.entries(field.conditions).map(([opt, branchFields]) => {
            if (!branchMatchesResponse(field, opt)) return null;

            return (
              <div key={opt} className="conditional-block">
                {branchFields.map((bf, idx) => (
                  <div
                    key={`${field.name}.conditions.${opt}.${idx}`}
                    style={{ marginTop: 8 }}
                  >
                    {renderField(bf)}
                  </div>
                ))}
              </div>
            );
          })}
      </div>
    );
  };

  if (!schema || !schema.fields) return null;

  return (
    <div className="panel-wrapper">
      <div className="form-panel dynamic-form preview-area">
        <h3 className="form-title">{schema.title}</h3>

        {fields.map((f, i) => (
          <div key={f.name || i}>{renderField(f)}</div>
        ))}

        {Array.isArray(errorsByName._global) &&
          errorsByName._global.length > 0 && (
            <div
              className="schema-error-box"
              style={{ marginTop: 12, color: "#c0392b" }}
            >
              <h4>General Schema Errors</h4>
              <ul>
                {errorsByName._global.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
});

export default FormRenderer;
