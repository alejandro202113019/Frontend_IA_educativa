import { useState, useCallback } from 'react';
import APIService from '../services/api';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAPI = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction.call(APIService, ...args); // ← CAMBIO AQUÍ
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const uploadFile = useCallback((file, title) => 
    callAPI(APIService.uploadFile.bind(APIService), file, title), [callAPI]); // ← CAMBIO AQUÍ

  const uploadText = useCallback((content, title) => 
    callAPI(APIService.uploadText.bind(APIService), content, title), [callAPI]); // ← CAMBIO AQUÍ

  const generateSummary = useCallback((text, length) => 
    callAPI(APIService.generateSummary.bind(APIService), text, length), [callAPI]); // ← CAMBIO AQUÍ

  const generateVisualization = useCallback((text) => 
    callAPI(APIService.generateVisualization.bind(APIService), text), [callAPI]); // ← CAMBIO AQUÍ

  const generateQuiz = useCallback((text, numQuestions, difficulty) => 
    callAPI(APIService.generateQuiz.bind(APIService), text, numQuestions, difficulty), [callAPI]); // ← CAMBIO AQUÍ

  const submitQuiz = useCallback((sessionId, answers) => 
    callAPI(APIService.submitQuiz.bind(APIService), sessionId, answers), [callAPI]); // ← CAMBIO AQUÍ

  return {
    loading,
    error,
    uploadFile,
    uploadText,
    generateSummary,
    generateVisualization,
    generateQuiz,
    submitQuiz,
    clearError: () => setError(null)
  };
};