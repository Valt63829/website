import { useState, useEffect } from "react";

export const useModel = () => {
  const [model, setModelState] = useState("openai");

  useEffect(() => {
    const savedModel = localStorage.getItem("selectedModel");

    if (savedModel) {
      setModelState(savedModel);
    }
  }, []);

  const setModel = (newModel) => {
    setModelState(newModel);
    localStorage.setItem("selectedModel", newModel);
  };

  return {
    model,
    setModel,
  };
};