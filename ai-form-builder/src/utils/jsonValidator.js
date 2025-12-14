import { formSchema } from "../schemas/zodSchema";

/**
 * validateSchema(schema)
 * - returns { valid: boolean, errors: array | null }
 * - errors is an array of { path: string, message: string, suggestion?: string }
 *
 * This file:
 * 1. Runs a lightweight structural pre-check to catch common, deterministic issues
 *    (missing/empty "options" on choice fields, non-object fields, etc).
 * 2. If structural check passes, runs Zod parse and converts Zod errors to friendly messages
 *    with improved heuristics for suggestions.
 */

const isOptionLike = (v) => Array.isArray(v) && v.length > 0;

const collectStructuralIssues = (schema) => {
  const issues = [];

  const visitFields = (fields, path = "fields") => {
    if (!Array.isArray(fields)) {
      issues.push({
        path,
        message: `"fields" must be an array of field objects.`,
        suggestion: `Use "fields": [ { "type":"text", "label":"...", "name":"..." }, ... ]`,
      });
      return;
    }

    fields.forEach((f, idx) => {
      const p = `${path}.${idx}`;

      if (!f || typeof f !== "object") {
        issues.push({
          path: p,
          message: "Field must be an object",
          suggestion: `Ensure field at ${p} is an object with keys like "type", "label", "name".`,
        });
        return;
      }

      const type = (f.type || "").toString().toLowerCase();

      // Choice fields require options (simple string-array is supported)
      if (["radio", "select", "checkbox"].includes(type)) {
        if (!("options" in f) || !isOptionLike(f.options)) {
          issues.push({
            path: `${p}.options`,
            message: `Missing or empty "options" for ${type} field`,
            suggestion: `Add an "options" array. Example: "options": ["Option 1", "Option 2"]`,
          });
        }
      }

      // Recursively validate conditional branches if present
      if (
        f.conditions &&
        typeof f.conditions === "object" &&
        !Array.isArray(f.conditions)
      ) {
        for (const [condKey, branch] of Object.entries(f.conditions)) {
          visitFields(
            Array.isArray(branch) ? branch : [],
            `${p}.conditions.${condKey}`
          );
        }
      }
    });
  };

  visitFields(Array.isArray(schema?.fields) ? schema.fields : [], "fields");
  return issues;
};

/* ---------- Zod error -> friendly message heuristics ---------- */
const mapZodErrorsToFriendly = (zodErrors) => {
  const errors = [];

  for (const e of zodErrors) {
    const pathArray = Array.isArray(e.path) ? e.path : [];
    const path = pathArray.join(".") || "";

    const raw = e.message || "";

    // The heuristics below attempt to cover several Zod message shapes and versions.
    // Use path analysis where possible, and fall back to substring tests on message.
    let suggestion = "";
    let message = raw;

    // If the error path ends with "options" — give a deterministic suggestion
    if (path.endsWith("options")) {
      message = message || 'Invalid or missing "options"';
      suggestion = `Add an "options" array (non-empty). Example: "options": ["Yes","No"]`;
    }
    // If the message mentions "options" and "non-empty" or "required"
    else if (
      /options/i.test(raw) &&
      /(non-?empty|required|must have|should be)/i.test(raw)
    ) {
      suggestion = `Add an "options" array with at least one value. Example: "options": ["A","B"]`;
    }
    // Conditions referencing non-existing option keys
    else if (
      /conditions key "?([^"]+)"? does not match|conditions.*not match/i.test(
        raw
      )
    ) {
      const m = raw.match(/conditions key "?([^"]+)"? does not match/i);
      const wrongKey = m ? m[1] : null;
      suggestion = wrongKey
        ? `Either add "${wrongKey}" to parent field.options or remove the conditions key. Example: "options": ["${wrongKey}", "Other"]`
        : `Ensure condition keys match parent options.`;
    }
    // Name / snake_case hints
    else if (
      /snake_case|snake case|must be.*snake/i.test(raw) ||
      /name.*must/i.test(raw)
    ) {
      const last = pathArray[pathArray.length - 1] || "";
      const snakeSuggested =
        last && typeof last === "string"
          ? last.replace(/[^\w]+/g, "_").toLowerCase()
          : "";
      suggestion = snakeSuggested
        ? `Use snake_case for "name". Example: "${snakeSuggested}"`
        : `Use snake_case (lowercase letters, digits, underscores).`;
    }
    // Expecting array of fields (conditions or fields)
    else if (
      /must be an array of field/i.test(raw) ||
      /array of field objects/i.test(raw) ||
      /expected array/i.test(raw)
    ) {
      suggestion = `Ensure this value is an array of field objects; e.g. "conditions": { "Yes": [{ "type":"text","label":"...","name":"..." }] }`;
    }
    // Generic fallback: if path exists give pointer
    else {
      message = raw || "Invalid value";
      suggestion = path
        ? `Check the field at path "${path}". The value does not match the expected structure.`
        : `Inspect the schema near the reported location and fix the issue.`;
    }

    errors.push({
      path,
      message,
      suggestion,
    });
  }

  return errors;
};

/* ---------- Main exported function ---------- */
export const validateSchema = (schema) => {
  // quick sanity: if schema is falsy, return helpful error
  if (!schema) {
    return {
      valid: false,
      errors: [
        {
          path: "",
          message: "No schema provided",
          suggestion: "Provide a schema object with a 'fields' array.",
        },
      ],
    };
  }

  // 1) Structural pre-check (fast, deterministic)
  const structural = collectStructuralIssues(schema);
  if (structural.length > 0) {
    return {
      valid: false,
      errors: structural.map((s) => ({
        path: s.path,
        message: s.message,
        suggestion: s.suggestion,
      })),
    };
  }

  // 2) Run Zod validation (catch any semantic issues)
  try {
    formSchema.parse(schema);
    return { valid: true, errors: null };
  } catch (err) {
    const zodErrors = err?.issues ?? [];
    // Map Zod errors into friendly messages with actionable suggestions
    const friendly = mapZodErrorsToFriendly(zodErrors);
    return { valid: false, errors: friendly };
  }
};
