import { useState, useCallback, useRef } from 'react';
import APIService from '../services/api';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ REF PARA EVITAR LLAMADAS DUPLICADAS
  const activeRequests = useRef(new Set());

  const callAPI = useCallback(async (apiFunction, ...args) => {
    // ✅ CREAR IDENTIFICADOR ÚNICO PARA LA LLAMADA
    const requestId = `${apiFunction.name}_${JSON.stringify(args)}`;
    
    // ✅ VERIFICAR SI YA HAY UNA LLAMADA EN PROGRESO
    if (activeRequests.current.has(requestId)) {
      console.log(`🚫 Evitando llamada duplicada: ${requestId}`);
      return; // No hacer la llamada si ya está en progreso
    }

    // ✅ MARCAR COMO ACTIVA
    activeRequests.current.add(requestId);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🚀 Iniciando llamada API: ${requestId}`);
      const result = await apiFunction.call(APIService, ...args);
      console.log(`✅ Llamada completada: ${requestId}`);
      setLoading(false);
      return result;
    } catch (err) {
      console.error(`❌ Error en llamada: ${requestId}`, err);
      setError(err.message);
      setLoading(false);
      throw err;
    } finally {
      // ✅ LIMPIAR ESTADO ACTIVO
      activeRequests.current.delete(requestId);
    }
  }, []);

  const uploadFile = useCallback((file, title) => 
    callAPI(APIService.uploadFile.bind(APIService), file, title), [callAPI]);

  const uploadText = useCallback((content, title) => 
    callAPI(APIService.uploadText.bind(APIService), content, title), [callAPI]);

  const generateSummary = useCallback((text, length) => 
    callAPI(APIService.generateSummary.bind(APIService), text, length), [callAPI]);

  const generateVisualization = useCallback((text) => 
    callAPI(APIService.generateVisualization.bind(APIService), text), [callAPI]);

  const generateQuiz = useCallback((text, numQuestions, difficulty) => 
    callAPI(APIService.generateQuiz.bind(APIService), text, numQuestions, difficulty), [callAPI]);

  const submitQuiz = useCallback((sessionId, answers) => 
    callAPI(APIService.submitQuiz.bind(APIService), sessionId, answers), [callAPI]);

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