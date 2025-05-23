import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, Target, Lightbulb } from 'lucide-react';
import { useAPI } from '../../hooks/useAPI';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

export default function QuizScreen({ data, onNext }) {
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const { loading, error, generateQuiz, submitQuiz, clearError } = useAPI();

  useEffect(() => {
    if (data?.text && !quizStarted) {
      loadQuiz();
    }
  }, [data, quizStarted]);

  const loadQuiz = async () => {
    try {
      clearError();
      const response = await generateQuiz(data.text, 5, 'medium');
      if (response.success) {
        setQuestions(response.data.questions);
        setSessionId(response.data.session_id);
        setQuizStarted(true);
      }
    } catch (err) {
      console.error('Error loading quiz:', err);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    try {
      clearError();
      const answers = Object.entries(selectedAnswers).map(([questionIndex, selectedOption]) => ({
        question_id: parseInt(questionIndex) + 1,
        selected_answer: selectedOption
      }));

      const response = await submitQuiz(sessionId, answers);
      if (response.success) {
        setResults(response.data);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🎉';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '📚';
    return '💪';
  };

  if (loading && questions.length === 0) {
    return (
      <div className="card p-8 fade-in">
        <LoadingSpinner 
          size="lg" 
          text="Generando quiz personalizado basado en tu contenido..." 
        />
        <div className="mt-6 space-y-2 text-center text-sm text-gray-600">
          <p>🧠 Analizando conceptos clave</p>
          <p>❓ Creando preguntas educativas</p>
          <p>🎯 Ajustando nivel de dificultad</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header del Quiz */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Brain className="h-6 w-6 text-blue-500 mr-2" />
              Quiz Interactivo
            </h2>
            <p className="text-gray-600">
              {showResults 
                ? 'Resultados de tu evaluación' 
                : `Pregunta ${Object.keys(selectedAnswers).length} de ${questions.length} respondidas`
              }
            </p>
          </div>
          {!showResults && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Progreso</div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ErrorAlert message={error} onClose={clearError} />

      {showResults && results ? (
        <div className="space-y-6">
          {/* Resultados */}
          <div className="card p-8 text-center">
            <div className="text-6xl mb-4">{getScoreEmoji(results.percentage)}</div>
            <h3 className="text-2xl font-bold mb-2">¡Quiz Completado!</h3>
            <div className={`text-4xl font-bold mb-4 ${getScoreColor(results.percentage)}`}>
              {results.score} de {results.total_questions}
            </div>
            <div className="text-lg text-gray-600 mb-6">
              {results.percentage}% de respuestas correctas
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="font-bold text-green-700">{results.score}</div>
                <div className="text-sm text-green-600">Correctas</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="font-bold text-red-700">{results.total_questions - results.score}</div>
                <div className="text-sm text-red-600">Incorrectas</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="font-bold text-blue-700">{results.percentage}%</div>
                <div className="text-sm text-blue-600">Puntuación</div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg text-left">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Retroalimentación Personalizada
              </h4>
              <p className="text-gray-700 leading-relaxed">{results.feedback}</p>
            </div>
          </div>

          {/* Sugerencias de Mejora */}
          {results.improvement_suggestions && results.improvement_suggestions.length > 0 && (
            <div className="card p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                Sugerencias para Mejorar
              </h4>
              <ul className="space-y-3">
                {results.improvement_suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Revisión de Preguntas */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-lg">📋 Revisión Detallada</h4>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="card p-6">
                <h5 className="font-medium mb-4 text-gray-800">
                  {qIndex + 1}. {q.question}
                </h5>
                <div className="space-y-3">
                  {q.options.map((option, oIndex) => (
                    <div 
                      key={oIndex} 
                      className={`p-4 rounded-lg border ${
                        oIndex === q.correct_answer 
                          ? 'bg-green-50 border-green-300' 
                          : selectedAnswers[qIndex] === oIndex && oIndex !== q.correct_answer
                            ? 'bg-red-50 border-red-300'
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-block w-6 h-6 rounded-full text-center text-sm font-medium mr-3 ${
                            oIndex === q.correct_answer 
                              ? 'bg-green-500 text-white' 
                              : selectedAnswers[qIndex] === oIndex && oIndex !== q.correct_answer
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + oIndex)}
                          </span>
                          <span className={
                            oIndex === q.correct_answer 
                              ? 'text-green-800 font-medium' 
                              : selectedAnswers[qIndex] === oIndex && oIndex !== q.correct_answer
                                ? 'text-red-800'
                                : 'text-gray-700'
                          }>
                            {option}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {oIndex === q.correct_answer && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {selectedAnswers[qIndex] === oIndex && oIndex !== q.correct_answer && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      {oIndex === q.correct_answer && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-green-700 text-sm">
                            <strong>Explicación:</strong> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button onClick={onNext} size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Analizar Nuevo Contenido
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preguntas del Quiz */}
          {questions.length > 0 && (
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-800 flex-1">
                      <span className="inline-block w-8 h-8 bg-blue-500 text-white rounded-full text-center text-sm font-bold mr-3">
                        {qIndex + 1}
                      </span>
                      {q.question}
                    </h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-4">
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 ml-11">
                    {q.options.map((option, oIndex) => (
                      <label 
                        key={oIndex} 
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                          selectedAnswers[qIndex] === oIndex 
                            ? 'bg-blue-50 border-2 border-blue-300 shadow-sm' 
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={oIndex}
                          checked={selectedAnswers[qIndex] === oIndex}
                          onChange={() => handleAnswerSelect(qIndex, oIndex)}
                          className="sr-only"
                        />
                        <span className={`inline-block w-6 h-6 rounded-full border-2 text-center text-sm font-medium mr-3 ${
                          selectedAnswers[qIndex] === oIndex 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <span className={selectedAnswers[qIndex] === oIndex ? 'text-blue-800 font-medium' : 'text-gray-700'}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Botón de enviar */}
          <div className="card p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {Object.keys(selectedAnswers).length === questions.length 
                  ? '✅ Todas las preguntas respondidas' 
                  : `📝 ${questions.length - Object.keys(selectedAnswers).length} preguntas pendientes`
                }
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length !== questions.length || loading}
                loading={loading}
                size="lg"
              >
                {loading ? 'Evaluando respuestas...' : 'Finalizar Quiz'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}