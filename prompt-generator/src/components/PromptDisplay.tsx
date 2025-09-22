'use client';

import { useState } from 'react';

type PromptDisplayProps = {
  prompt: string;
  onGenerate: () => void;
  onBack: () => void;
  onReset: () => void;
};

export default function PromptDisplay({ prompt, onGenerate, onBack, onReset }: PromptDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Prompt Generado</h2>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Volver
          </button>
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ↻ Reiniciar
          </button>
        </div>
      </div>

      {!prompt && (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Haz clic en "Generar Prompt" para crear tu prompt personalizado</p>
          <button
            onClick={onGenerate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Generar Prompt
          </button>
        </div>
      )}

      {prompt && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-300">Prompt Final</h3>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  copied
                    ? 'bg-green-600 text-white focus:ring-green-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                }`}
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="whitespace-pre-wrap text-gray-100 leading-relaxed">
              {prompt}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Editar Template
            </button>
            <button
              onClick={onGenerate}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Regenerar
            </button>
            <button
              onClick={onReset}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Nuevo Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
