import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, TrendingUp, Clock, FileText, ArrowRight, Loader2, Cpu, Zap, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAPI } from '../../hooks/useAPI';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import HighlightedText from '../ui/HighlightedText';

export default function SummaryScreen({ data, onNext, onDataUpdate }) {
  const [summary, setSummary] = useState(null);
  const [visualization, setVisualization] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeywordHighlights, setShowKeywordHighlights] = useState(true);
  const { loading, error, generateSummary, generateVisualization, clearError } = useAPI();
  
  // ✅ REF PARA PREVENIR MÚLTIPLES LLAMADAS
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // ✅ PREVENIR MÚLTIPLES CARGAS
    if (data?.text && !hasLoadedRef.current && !isLoadingRef.current) {
      loadSummaryData();
    }
  }, [data]);

  const loadSummaryData = async () => {
    // ✅ CONTROL DE ESTADO PARA EVITAR LLAMADAS DUPLICADAS
    if (isLoadingRef.current || hasLoadedRef.current) {
      console.log('🚫 Evitando carga duplicada');
      return;
    }

    try {
      isLoadingRef.current = true;
      setIsGenerating(true);
      clearError();
      
      console.log('🚀 Iniciando carga de datos del resumen...');
      
      // ✅ GENERAR RESUMEN Y VISUALIZACIÓN EN SECUENCIA (NO PARALELO)
      console.log('📝 Generando resumen...');
      const summaryResponse = await generateSummary(data.text, 'medium');
      
      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
        console.log('✅ Resumen generado exitosamente');
      } else {
        throw new Error('Error generando resumen');
      }

      console.log('📊 Generando visualización...');
      const vizResponse = await generateVisualization(data.text);
      
      if (vizResponse.success) {
        setVisualization(vizResponse.data);
        console.log('✅ Visualización generada exitosamente');
      } else {
        throw new Error('Error generando visualización');
      }

      // ✅ ACTUALIZAR DATOS PARA EL SIGUIENTE COMPONENTE
      onDataUpdate({
        ...data,
        summary: summaryResponse.data,
        visualization: vizResponse.data
      });

      hasLoadedRef.current = true;
      console.log('🎯 Todos los datos cargados correctamente');

    } catch (err) {
      console.error('❌ Error loading summary data:', err);
    } finally {
      setIsGenerating(false);
      isLoadingRef.current = false;
    }
  };

  // ✅ EXTRAER PALABRAS CLAVE PARA RESALTAR
  const getKeywordsForHighlighting = () => {
    if (!data.key_concepts) return [];
    return data.key_concepts.map(concept => concept.concept);
  };

  // ✅ PREPARAR DATOS PARA VISUALIZACIÓN
  const prepareChartData = () => {
    if (!visualization?.data) return [];
    
    return visualization.data.map(item => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
      fullName: item.name,
      frecuencia: item.value,
      value: item.value
    }));
  };

  // ✅ COLORES PARA EL GRÁFICO
  const CHART_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  // ✅ MOSTRAR LOADING SOLO SI REALMENTE ESTÁ CARGANDO
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

  const chartData = prepareChartData();
  const keywords = getKeywordsForHighlighting();

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

      {/* Resumen Principal con Palabras Resaltadas */}
      {summary && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center text-lg">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              Resumen Generado por BART (Facebook AI)
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Modelo gratuito
              </span>
            </h3>
            
            {/* Toggle para resaltar palabras clave */}
            <button
              onClick={() => setShowKeywordHighlights(!showKeywordHighlights)}
              className={`flex items-center px-3 py-1 rounded-full text-xs transition-all ${
                showKeywordHighlights 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Eye className="h-3 w-3 mr-1" />
              {showKeywordHighlights ? 'Ocultar resaltado' : 'Resaltar conceptos'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                📚 {data.title}
                <span className="ml-auto text-xs text-blue-600">Procesado localmente</span>
              </h4>
              
              {/* Resumen con palabras resaltadas */}
              <div className="prose text-gray-700 leading-relaxed">
                {summary.summary.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <div key={index} className="mb-3 last:mb-0">
                      {showKeywordHighlights ? (
                        <HighlightedText 
                          text={paragraph.trim()}
                          keywords={keywords}
                        />
                      ) : (
                        <p>{paragraph.trim()}</p>
                      )}
                    </div>
                  )
                ))}
              </div>
              
              {/* Leyenda de conceptos resaltados */}
              {showKeywordHighlights && keywords.length > 0 && (
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">
                    🔍 <strong>Conceptos clave resaltados:</strong>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {keywords.slice(0, 8).map((keyword, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-yellow-200 text-yellow-900 px-2 py-1 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Visualización de Conceptos Mejorada */}
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
          <p className="text-sm text-green-600 mb-6">
            🔍 Generado con modelos de análisis gratuitos (spaCy + Transformers)
          </p>
          
          {/* Gráfico de Barras */}
          <div className="h-80 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                  interval={0}
                />
                <YAxis fontSize={11} />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} apariciones`, 
                    'Frecuencia'
                  ]}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.name === label);
                    return item ? item.fullName : label;
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="frecuencia" 
                  radius={[4, 4, 0, 0]}
                  fill="#3b82f6"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pastel Complementario */}
          {chartData.length <= 8 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  📊 Distribución Proporcional
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Análisis NLP
                  </span>
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="frecuencia"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={10}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} apariciones`, 'Frecuencia']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabla de datos */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  📋 Detalles de Conceptos
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded mr-2"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium" title={item.fullName}>
                          {item.fullName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                        {item.frecuencia}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conceptos Clave Mejorados */}
      {data.key_concepts && data.key_concepts.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center text-lg">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            Conceptos Clave Identificados
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              spaCy + NER
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.key_concepts.slice(0, 9).map((concept, index) => (
              <div 
                key={index} 
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800 text-sm">{concept.concept}</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {concept.frequency}x
                  </span>
                </div>
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(concept.relevance * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Relevancia: <span className="font-medium">{Math.round(concept.relevance * 100)}%</span> • 
                  <span className="text-green-600 ml-1">TF-IDF local</span>
                </p>
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
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-xl font-bold text-green-800">{data.analysis.complexity_level}</div>
              <div className="text-sm text-green-600">Nivel de complejidad</div>
              <div className="text-xs text-green-500 mt-1">Análisis local</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-xl font-bold text-blue-800">{data.analysis.sentence_count}</div>
              <div className="text-sm text-blue-600">Oraciones</div>
              <div className="text-xs text-blue-500 mt-1">spaCy NLP</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-xl font-bold text-purple-800">
                {Math.round(data.analysis.avg_words_per_sentence)}
              </div>
              <div className="text-sm text-purple-600">Palabras/oración</div>
              <div className="text-xs text-purple-500 mt-1">Análisis gratuito</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-xl font-bold text-orange-800">{data.analysis.reading_time}</div>
              <div className="text-sm text-orange-600">Min. lectura</div>
              <div className="text-xs text-orange-500 mt-1">Estimación local</div>
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
          disabled={loading || isGenerating}
          size="lg"
          className="shadow-lg"
        >
          {loading || isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
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