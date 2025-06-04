// src/components/ui/HighlightedText.jsx
import React from 'react';

export default function HighlightedText({ text, keywords = [], className = "" }) {
  // Si no hay palabras clave, mostrar texto normal
  if (!keywords || keywords.length === 0) {
    return <div className={className}>{text}</div>;
  }

  // Crear un patrón regex que coincida con cualquiera de las palabras clave (case insensitive)
  const keywordPattern = keywords
    .map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escapar caracteres especiales
    .join('|');
  
  const regex = new RegExp(`\\b(${keywordPattern})\\b`, 'gi');

  // Dividir el texto en partes, manteniendo las coincidencias
  const parts = text.split(regex);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        // Verificar si esta parte es una palabra clave
        const isKeyword = keywords.some(keyword => 
          keyword.toLowerCase() === part.toLowerCase()
        );

        if (isKeyword) {
          return (
            <mark 
              key={index}
              className="bg-yellow-200 text-yellow-900 px-1 py-0.5 rounded font-medium"
              title={`Concepto clave: ${part}`}
            >
              {part}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}

// Variante para resaltar múltiples tipos de conceptos con diferentes colores
export function MultiHighlightedText({ 
  text, 
  conceptGroups = [], 
  className = "" 
}) {
  if (!conceptGroups || conceptGroups.length === 0) {
    return <div className={className}>{text}</div>;
  }

  let processedText = text;
  const highlights = [];

  // Colores para diferentes tipos de conceptos
  const colorClasses = [
    "bg-blue-200 text-blue-900",
    "bg-green-200 text-green-900", 
    "bg-purple-200 text-purple-900",
    "bg-orange-200 text-orange-900",
    "bg-pink-200 text-pink-900"
  ];

  // Procesar cada grupo de conceptos
  conceptGroups.forEach((group, groupIndex) => {
    const { keywords, label } = group;
    const colorClass = colorClasses[groupIndex % colorClasses.length];
    
    keywords.forEach(keyword => {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapedKeyword})\\b`, 'gi');
      
      processedText = processedText.replace(regex, (match) => {
        const id = `highlight-${groupIndex}-${highlights.length}`;
        highlights.push({
          id,
          text: match,
          label,
          colorClass
        });
        return `<mark data-id="${id}">${match}</mark>`;
      });
    });
  });

  // Convertir el texto procesado de vuelta a JSX
  const createHighlightedJSX = (htmlText) => {
    const parts = htmlText.split(/(<mark[^>]*>.*?<\/mark>)/g);
    
    return parts.map((part, index) => {
      const markMatch = part.match(/^<mark data-id="([^"]*)">(.*?)<\/mark>$/);
      
      if (markMatch) {
        const [, id, text] = markMatch;
        const highlight = highlights.find(h => h.id === id);
        
        if (highlight) {
          return (
            <mark 
              key={index}
              className={`${highlight.colorClass} px-1 py-0.5 rounded font-medium`}
              title={`${highlight.label}: ${highlight.text}`}
            >
              {text}
            </mark>
          );
        }
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={className}>
      {createHighlightedJSX(processedText)}
    </div>
  );
}