'use client';

import { useState } from 'react';
import { FiCopy, FiCheck, FiFileText, FiRotateCcw, FiArrowLeft, FiZap, FiRefreshCw } from 'react-icons/fi';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
            <FiFileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-black">Prompt Generado</h2>
            <p className="text-gray-600 text-sm">Tu prompt personalizado está listo para usar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <FiRotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {!prompt && (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-blue-200">
              <FiZap className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-6">Haz clic en "Generar Prompt" para crear tu prompt personalizado</p>
          </div>
          <button
            onClick={onGenerate}
            className="group flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
          >
            <FiZap className="w-5 h-5" />
            <span>Generar Prompt</span>
          </button>
        </div>
      )}

      {prompt && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiFileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-black">Prompt Final</h3>
              </div>
              <button
                onClick={handleCopy}
                className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white shadow-lg ${
                  copied
                    ? 'bg-green-500 text-white focus:ring-green-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 hover:shadow-xl'
                }`}
              >
                {copied ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="whitespace-pre-wrap text-black leading-relaxed font-mono text-sm">
                {prompt}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 border border-gray-400 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Editar Template</span>
            </button>
            <button
              onClick={onGenerate}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
            >
              <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Regenerar</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg hover:shadow-xl"
            >
              <FiRotateCcw className="w-4 h-4" />
              <span>Nuevo Prompt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
