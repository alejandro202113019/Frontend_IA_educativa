import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-800">{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-3 text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}