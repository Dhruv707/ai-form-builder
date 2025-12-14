import { useState } from "react";

export const useLLM = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSchema = async (prompt) => {
    setLoading(true);
    try {
      const response = await fetch("/api/generateSchema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { generateSchema, loading, error };
};
