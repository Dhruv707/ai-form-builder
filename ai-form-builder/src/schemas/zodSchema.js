// src/schemas/zodSchema.js
import { z } from "zod";

/**
 * fieldSchema is recursive (uses z.lazy) so conditions can contain fields.
 * We add superRefine checks:
 * - options required for certain types
 * - conditions keys must exist in options
 * - name must be snake_case
 */
const fieldSchema = z.lazy(() => {
  const schema = z.object({
    type: z.enum([
      "text",
      "number",
      "radio",
      "checkbox",
      "select",
      "multiselect",
    ]),
    label: z.string(),
    name: z
      .string()
      .regex(
        /^[a-z0-9_]+$/,
        "name must be snake_case (lowercase letters, digits, underscores)"
      ),
    options: z.array(z.string()).optional(),
    required: z.boolean().optional(),
    conditions: z.object({}).catchall(z.array(fieldSchema)).optional(),
  });

  return schema.superRefine((val, ctx) => {
    // Ensure options exist for types that need them
    const typesRequiringOptions = new Set([
      "radio",
      "select",
      "multiselect",
      "checkbox",
    ]);
    if (typesRequiringOptions.has(val.type)) {
      if (!Array.isArray(val.options) || val.options.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: `field of type "${val.type}" requires a non-empty "options" array`,
          path: ["options"],
        });
      }
    }

    // If conditions provided, ensure keys exist in options and are arrays of fields
    if (val.conditions) {
      if (!val.options || !Array.isArray(val.options)) {
        ctx.addIssue({
          code: "custom",
          message: '"conditions" provided but "options" is missing or invalid',
          path: ["conditions"],
        });
      } else {
        for (const key of Object.keys(val.conditions)) {
          if (!val.options.includes(key)) {
            ctx.addIssue({
              code: "custom",
              message: `conditions key "${key}" does not match any option in parent field.options`,
              path: ["conditions", key],
            });
          }
          const branch = val.conditions[key];
          if (!Array.isArray(branch)) {
            ctx.addIssue({
              code: "custom",
              message: `conditions["${key}"] must be an array of field objects`,
              path: ["conditions", key],
            });
          }
        }
      }
    }
  });
});

/**
 * formSchema:
 * - title required
 * - fields must be an array of fieldSchema
 * - superRefine enforces that at least one field has conditions and at least one nested condition exists (depth >=2).
 */
const formSchema = z
  .object({
    title: z.string(),
    fields: z.array(fieldSchema),
  })
  .superRefine((val, ctx) => {
    const fields = val.fields || [];

    // check presence of at least one field having conditions
    let hasAnyCondition = false;
    let hasNestedCondition = false;

    // DFS through fields to detect nested conditions
    const stack = [...fields];
    while (stack.length) {
      const f = stack.pop();
      if (!f) continue;
      if (f.conditions && Object.keys(f.conditions).length > 0) {
        hasAnyCondition = true;
        // check each branch's fields for a field that itself has conditions
        for (const branch of Object.values(f.conditions)) {
          if (Array.isArray(branch)) {
            for (const bf of branch) {
              if (bf.conditions && Object.keys(bf.conditions).length > 0) {
                hasNestedCondition = true;
                break;
              }
              // push nested fields to check deeper
              stack.push(
                ...(bf.conditions ? Object.values(bf.conditions).flat() : [])
              );
              if (Array.isArray(bf)) {
                stack.push(...bf);
              }
            }
            if (hasNestedCondition) break;
          }
        }
      }
      if (hasNestedCondition) break;
    }

    if (!hasAnyCondition) {
      ctx.addIssue({
        code: "custom",
        message:
          "At least one field must include a 'conditions' object (conditional logic required).",
        path: ["fields"],
      });
    } else if (!hasNestedCondition) {
      ctx.addIssue({
        code: "custom",
        message:
          "At least one conditional branch must contain a field that itself has 'conditions' (nested/recursive conditions required).",
        path: ["fields"],
      });
    }
  });

export { formSchema };
