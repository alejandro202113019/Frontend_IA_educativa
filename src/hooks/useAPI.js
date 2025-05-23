import { useState, useCallback } from 'react';
import APIService from '../services/api';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAPI = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const uploadFile = useCallback((file, title) => 
    callAPI(APIService.uploadFile, file, title), [callAPI]);

  const uploadText = useCallback((content, title) => 
    callAPI(APIService.uploadText, content, title), [callAPI]);

  const generateSummary = useCallback((text, length) => 
    callAPI(APIService.generateSummary, text, length), [callAPI]);

  const generateVisualization = useCallback((text) => 
    callAPI(APIService.generateVisualization, text), [callAPI]);

  const generateQuiz = useCallback((text, numQuestions, difficulty) => 
    callAPI(APIService.generateQuiz, text, numQuestions, difficulty), [callAPI]);

  const submitQuiz = useCallback((sessionId, answers) => 
    callAPI(APIService.submitQuiz, sessionId, answers), [callAPI]);

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