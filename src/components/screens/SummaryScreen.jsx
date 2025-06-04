import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Clock, FileText, ArrowRight, Loader2, Cpu, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAPI } from '../../hooks/useAPI';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

export default function SummaryScreen({ data, onNext, onDataUpdate }) {
  const [summary, setSummary] = useState(null);
  const [visualization, setVisualization] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const { loading, error, generateSummary, generateVisualization, clearError } = useAPI();

  useEffect(() => {
    if (data?.text) {
      loadSummaryData();
    }
  }, [data]);

  const loadSummaryData = async () => {
    try {
      setIsGenerating(true);
      
      // Generar resumen y visualización en paralelo
      const [summaryResponse, vizResponse] = await Promise.all([
        generateSummary(data.text, 'medium'),
        generateVisualization(data.text)
      ]);
      
      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }

      if (vizResponse.success) {
        setVisualization(vizResponse.data);
      }

      // Actualizar datos para el siguiente componente
      onDataUpdate({
        ...data,
        summary: summaryResponse.data,
        visualization: vizResponse.data
      });

    } catch (err) {
      console.error('Error loading summary data:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating || (loading && !summary)) {
    return (
      <div className="card p-8 fade-in">
        <LoadingSpinner 
          size="lg" 
          text="Analizando con modelos de IA gratuitos..." 
        />
        <div className="mt-6 space-y-2 text-center text-sm text-gray-600">
          <p>🤖 Procesando con BART (Facebook AI)</p>
          <p>📊 Analizando con RoBERTa (Cardiff NLP)</p>
          <p>📈 Creando visualizaciones con spaCy</p>
          <p className="text-green-600 font-medium">✅ 100% gratuito y privado</p>
        </div>
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center px-3 py-1 bg-green-50 rounded-full text-xs text-green-700">
            <Cpu className="h-3 w-3 mr-1" />
            Procesamiento local • Sin costos
          </div>
        </div>
      </div>
    );
  }

  const chartData = visualization?.data?.map(item => ({
    name: item.name,
    frecuencia: item.value,
    value: item.value
  })) || [];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <BookOpen className="h-6 w-6 text-blue-500 mr-2" />
              Análisis Completado con IA Gratuita
            </h2>
            <p className="text-gray-600">Procesado con BART, T5 y RoBERTa - Sin costo alguno</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-green-600">
                <Zap className="h-4 w-4 mr-1" />
                <span>Gratuito</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Cpu className="h-4 w-4 mr-1" />
                <span>Local</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {data.analysis?.word_count} palabras • {data.analysis?.reading_time} min lectura
            </p>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onClose={clearError} />

      {/* Resumen Principal */}
      {summary && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center text-lg">
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            Resumen Generado por BART (Facebook AI)
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Modelo gratuito
            </span>
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                📚 {data.title}
                <span className="ml-auto text-xs text-blue-600">Procesado localmente</span>
              </h4>
              <div className="prose text-gray-700 leading-relaxed">
                {summary.summary.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-3 last:mb-0">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary.word_count}</div>
                <div className="text-sm text-gray-600">Palabras analizadas</div>
                <div className="text-xs text-green-600 mt-1">BART + spaCy</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.key_concepts?.length || 0}</div>
                <div className="text-sm text-gray-600">Conceptos identificados</div>
                <div className="text-xs text-green-600 mt-1">RoBERTa + NLP</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{summary.reading_time}</div>
                <div className="text-sm text-gray-600">Minutos de lectura</div>
                <div className="text-xs text-green-600 mt-1">Estimación local</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualización de Conceptos */}
      {visualization && chartData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center text-lg">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            {visualization.title}
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Análisis local
            </span>
          </h3>
          <p className="text-gray-600 mb-2">{visualization.description}</p>
          <p className="text-sm text-green-600 mb-4">
            🔍 Generado con modelos de análisis gratuitos (spaCy + Transformers)
          </p>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Frecuencia']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="frecuencia" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Conceptos Clave */}
      {data.key_concepts && data.key_concepts.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center text-lg">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            Conceptos Clave Identificados
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              spaCy + NER
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.key_concepts.slice(0, 8).map((concept, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-800">{concept.concept}</h4>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {concept.frequency}x
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(concept.relevance * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Relevancia: {Math.round(concept.relevance * 100)}% • TF-IDF local
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información del Análisis */}
      {data.analysis && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4 text-lg flex items-center">
            📊 Análisis del Contenido
            <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              Procesamiento gratuito
            </span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{data.analysis.complexity_level}</div>
              <div className="text-sm text-gray-600">Nivel de complejidad</div>
              <div className="text-xs text-green-600 mt-1">Análisis local</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{data.analysis.sentence_count}</div>
              <div className="text-sm text-gray-600">Oraciones</div>
              <div className="text-xs text-green-600 mt-1">spaCy NLP</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">
                {Math.round(data.analysis.avg_words_per_sentence)}
              </div>
              <div className="text-sm text-gray-600">Palabras/oración</div>
              <div className="text-xs text-green-600 mt-1">Análisis gratuito</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{data.analysis.reading_time}</div>
              <div className="text-sm text-gray-600">Min. lectura</div>
              <div className="text-xs text-green-600 mt-1">Estimación local</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Información sobre modelos gratuitos */}
      <div className="card p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <h3 className="font-semibold mb-3 text-lg flex items-center text-green-800">
          <Cpu className="h-5 w-5 mr-2" />
          IA 100% Gratuita Utilizada
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-lg font-bold text-blue-600">BART</div>
            <div className="text-sm text-gray-600">Resúmenes de alta calidad</div>
            <div className="text-xs text-green-600 mt-1">Facebook AI Research</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-lg font-bold text-purple-600">RoBERTa</div>
            <div className="text-sm text-gray-600">Análisis de sentimientos</div>
            <div className="text-xs text-green-600 mt-1">Cardiff NLP</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-lg font-bold text-orange-600">spaCy</div>
            <div className="text-sm text-gray-600">Procesamiento de lenguaje</div>
            <div className="text-xs text-green-600 mt-1">Código abierto</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-green-700">
            🔒 Todos los datos se procesan localmente • Sin envío a servicios externos • Privacidad garantizada
          </p>
        </div>
      </div>
      
      {/* Botón de continuar */}
      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          disabled={loading}
          size="lg"
          className="shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              Crear Quiz con T5 (Gratuito)
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}