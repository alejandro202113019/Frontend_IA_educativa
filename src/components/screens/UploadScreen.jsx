import React, { useState } from 'react';
import { Upload, FileText, Type, Loader2 } from 'lucide-react';
import { useAPI } from '../../hooks/useAPI';
import { validateFile, getFileIcon, formatFileSize } from '../../utils/helpers';
import Button from '../ui/Button';
import ErrorAlert from '../ui/ErrorAlert';

export default function UploadScreen({ onNext, onDataLoaded }) {
  const [textContent, setTextContent] = useState('');
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { loading, error, uploadFile, uploadText, clearError } = useAPI();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = async (file) => {
    try {
      validateFile(file);
      setSelectedFile(file);
      await processFile(file);
    } catch (err) {
      clearError();
      alert(err.message);
    }
  };

  const processFile = async (file) => {
    try {
      clearError();
      const response = await uploadFile(file, title || file.name);
      
      if (response.success) {
        onDataLoaded(response.data);
        onNext();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  const handleTextSubmit = async () => {
    if (!textContent.trim()) {
      alert('Por favor ingresa algún contenido de texto');
      return;
    }

    try {
      clearError();
      const response = await uploadText(textContent, title || 'Texto ingresado manualmente');
      
      if (response.success) {
        onDataLoaded(response.data);
        onNext();
      }
    } catch (err) {
      console.error('Error uploading text:', err);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelection(e.target.files[0]);
    }
  };

  return (
    <div className="card p-8 fade-in">
      <div className="text-center mb-8">
        <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sube tu contenido educativo</h2>
        <p className="text-gray-600">Comienza tu experiencia de aprendizaje inteligente</p>
      </div>
      
      <ErrorAlert message={error} onClose={clearError} />
      
      {/* Campo de título */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título del contenido (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="Ej: Introducción a la Inteligencia Artificial"
          disabled={loading}
        />
      </div>

      {/* Área de drag and drop */}
      <div 
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all mb-6 ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <FileText className="h-12 w-12 text-gray-400 mx-auto" />
          
          {selectedFile ? (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">
                {getFileIcon(selectedFile.name)} {selectedFile.name}
              </p>
              <p className="text-sm text-green-600">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo'}
                </p>
                <p className="text-gray-500">o</p>
              </div>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading}
                />
                <Button 
                  variant="primary" 
                  size="lg"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Seleccionar archivo'}
                </Button>
              </label>
              
              <p className="text-sm text-gray-500">
                Formatos soportados: PDF, TXT, DOCX (máx. 10MB)
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Separador */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">O ingresa texto directamente</span>
        </div>
      </div>
      
      {/* Área de texto directo */}
      <div className="space-y-4">
        <div className="flex items-center mb-2">
          <Type className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-700">Contenido de texto</h3>
        </div>
        
        <textarea 
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="input-field resize-none"
          rows={6}
          placeholder="Escribe o pega tu contenido aquí... 

Ejemplo: La inteligencia artificial es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana..."
          disabled={loading}
        />
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{textContent.length} caracteres</span>
          <span>Mínimo 10 caracteres requeridos</span>
        </div>
      </div>
      
      {/* Botón de continuar */}
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleTextSubmit}
          disabled={!textContent.trim() || loading}
          loading={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            'Continuar con el análisis →'
          )}
        </Button>
      </div>
    </div>
  );
}