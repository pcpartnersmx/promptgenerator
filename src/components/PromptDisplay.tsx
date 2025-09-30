'use client';

import { useState } from 'react';
import { FiCopy, FiCheck, FiFileText, FiRotateCcw, FiArrowLeft, FiZap, FiRefreshCw, FiEdit3 } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

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
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sidebar-accent rounded-xl">
            <FiFileText className="w-6 h-6 text-sidebar-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-sidebar-foreground">Prompt Generado</h2>
            <p className="text-muted-foreground">Tu prompt personalizado está listo para usar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <FiRotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        {!prompt && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="p-4 bg-sidebar-accent/50 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-sidebar-border">
                  <FiZap className="w-10 h-10 text-sidebar-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-sidebar-foreground mb-3">
                  Genera tu prompt
                </h3>
                <p className="text-muted-foreground mb-8">
                  Haz clic en &quot;Generar Prompt&quot; para crear tu prompt personalizado usando las variables configuradas
                </p>
              </div>
              <Button
                onClick={onGenerate}
                size="lg"
                className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FiZap className="w-5 h-5 mr-2" />
                Generar Prompt
              </Button>
            </div>
          </div>
        )}

        {prompt && (
          <div className="flex-1 flex flex-col space-y-6">
            {/* Prompt Display Card */}
            <div className="flex-1 bg-background border border-sidebar-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sidebar-accent rounded-lg">
                    <FiFileText className="w-5 h-5 text-sidebar-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-sidebar-foreground">Prompt Final</h3>
                    <p className="text-sm text-muted-foreground">Listo para copiar y usar</p>
                  </div>
                </div>
                <Button
                  onClick={handleCopy}
                  variant={copied ? "default" : "outline"}
                  size="sm"
                  className={`${
                    copied
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                      : 'border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-sidebar-accent/30 border border-sidebar-border rounded-lg p-4 min-h-[200px]">
                <div className="whitespace-pre-wrap text-sidebar-foreground leading-relaxed font-mono text-sm">
                  {prompt}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                size="lg"
                className="flex-1 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <FiEdit3 className="w-4 h-4 mr-2" />
                Editar Template
              </Button>
              <Button
                onClick={onGenerate}
                variant="outline"
                size="lg"
                className="flex-1 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Regenerar
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
                className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-red-600"
              >
                <FiRotateCcw className="w-4 h-4 mr-2" />
                Nuevo Prompt
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
