export const conditionalLogic = (fields, responses) => {
  return fields.flatMap((field) => {
    if (field.conditions && responses[field.label]) {
      const newFields = field.conditions[responses[field.label]] || [];
      return [field, ...conditionalLogic(newFields, responses)];
    }
    return [field];
  });
};
