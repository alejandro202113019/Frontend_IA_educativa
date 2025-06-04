import React from 'react';
import { FileText, BarChart3, HelpCircle, Sparkles, Cpu } from 'lucide-react';

export default function Header({ activeScreen }) {
  const steps = [
    { id: 'upload', label: 'Subir contenido', icon: FileText },
    { id: 'summary', label: 'Resumen y análisis', icon: BarChart3 },
    { id: 'quiz', label: 'Quiz interactivo', icon: HelpCircle }
  ];

  return (
    <div className="card p-6 mb-6 fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="h-8 w-8 text-blue-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">IA Educativa</h1>
          <Cpu className="h-6 w-6 text-green-500 ml-2" title="Modelos gratuitos" />
        </div>
        <p className="text-gray-600">
          Transformando contenido con IA gratuita y de código abierto
        </p>
        <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            BART (Resúmenes)
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            T5 (Quiz)
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
            RoBERTa (Análisis)
          </span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeScreen === step.id;
            const isCompleted = steps.findIndex(s => s.id === activeScreen) > index;
            
            return (
              <div
                key={step.id}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                <span className="font-medium">{step.label}</span>
                {isCompleted && <span className="ml-2 text-green-600">✓</span>}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}