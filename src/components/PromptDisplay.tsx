'use client';

import { useState, useEffect, useRef } from 'react';
import { FiCopy, FiCheck, FiFileText, FiRotateCcw, FiArrowLeft, FiZap, FiRefreshCw, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type PromptDisplayProps = {
  prompt: string;
  aiResponse?: string;
  responseMode?: 'PROMPT' | 'AI_RESPONSE';
  isStreamingAI?: boolean;
  onGenerate: () => void;
  onBack: () => void;
  onReset: () => void;
  onSwitchToResult?: () => void;
};

export default function PromptDisplay({ prompt, aiResponse: propAiResponse, responseMode, isStreamingAI = false, onGenerate, onBack, onReset, onSwitchToResult }: PromptDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localAiResponse, setLocalAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseCopied, setResponseCopied] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const mainResponseRef = useRef<HTMLDivElement>(null);

  // Use prop AI response if available, otherwise use local state
  const displayAiResponse = propAiResponse || localAiResponse;

  // Auto-scroll al final del texto cuando se actualiza la respuesta
  useEffect(() => {
    const scrollToBottom = (element: HTMLDivElement) => {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 10);
    };

    if (displayAiResponse) {
      // Scroll en el contenedor principal
      if (mainResponseRef.current) {
        scrollToBottom(mainResponseRef.current);
      }
      // Scroll en el modal
      if (responseRef.current) {
        scrollToBottom(responseRef.current);
      }
    }
  }, [displayAiResponse, isStreamingAI]);

  // Scroll suave durante el streaming
  useEffect(() => {
    if (isStreamingAI) {
      const scrollToBottomSmooth = (element: HTMLDivElement) => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      };

      const scrollBothContainers = () => {
        if (mainResponseRef.current) {
          scrollToBottomSmooth(mainResponseRef.current);
        }
        if (responseRef.current) {
          scrollToBottomSmooth(responseRef.current);
        }
      };
      
      // Scroll cada vez que se actualiza el contenido durante streaming
      const interval = setInterval(scrollBothContainers, 200);
      
      return () => clearInterval(interval);
    }
  }, [isStreamingAI]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(displayAiResponse);
      setResponseCopied(true);
      setTimeout(() => setResponseCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!prompt) return;
    
    // Para proyectos AI_RESPONSE, cambiar a la tab de resultado inmediatamente
    if (responseMode === 'AI_RESPONSE' && onSwitchToResult) {
      onSwitchToResult();
    }
    
    setIsLoading(true);
    setIsSearchingWeb(true);
    setIsModalOpen(true);
    setLocalAiResponse(''); // Limpiar respuesta anterior
    
    try {
      const response = await fetch('/api/openAi/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar respuesta con AI');
      }

      // Handle streaming text response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setLocalAiResponse(fullResponse);
          
          // Simular que la búsqueda web toma tiempo
          if (fullResponse.length > 100 && isSearchingWeb) {
            setTimeout(() => setIsSearchingWeb(false), 2000);
          }
        }
      }
      
      setIsLoading(false);
      setIsSearchingWeb(false);
    } catch (error) {
      console.error('Error:', error);
      setLocalAiResponse('Error al generar respuesta con AI. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
      setIsSearchingWeb(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            responseMode === 'AI_RESPONSE' 
              ? 'bg-primary/10 border border-primary/20' 
              : 'bg-sidebar-accent'
          }`}>
            {responseMode === 'AI_RESPONSE' ? (
              <FiZap className="w-6 h-6 text-primary" />
            ) : (
              <FiFileText className="w-6 h-6 text-sidebar-accent-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {responseMode === 'AI_RESPONSE' ? 'Respuesta Generada' : 'Prompt Generado'}
            </h2>
            <p className="text-muted-foreground">
              {responseMode === 'AI_RESPONSE' 
                ? 'Tu respuesta de IA está lista para usar' 
                : 'Tu prompt personalizado está listo para usar'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
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
              >
                <FiZap className="w-5 h-5 mr-2" />
                Generar Prompt
              </Button>
            </div>
          </div>
        )}

        {prompt && (
          <div className="flex-1 flex flex-col space-y-6">
            {/* Show Prompt Display Card only for PROMPT projects */}
            {responseMode !== 'AI_RESPONSE' && (
              <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                      <FiFileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Prompt Final</h3>
                      <p className="text-sm text-muted-foreground">Listo para copiar y usar</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant={copied ? "default" : "outline"}
                    size="sm"
                    className={copied ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}
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
                
                <div className="bg-muted/30 border border-border rounded-lg p-4 min-h-[200px]">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed font-mono text-sm">
                    {prompt}
                  </div>
                </div>
              </div>
            )}

            {/* AI Response Section - Show automatically for AI_RESPONSE projects */}
            {responseMode === 'AI_RESPONSE' && (displayAiResponse || isStreamingAI) && (
              <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                      <FiZap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Respuesta de IA</h3>
                      <p className="text-sm text-muted-foreground">
                        {isStreamingAI ? 'Generando...' : isSearchingWeb ? 'Buscando en internet...' : 'Generada automáticamente'}
                      </p>
                    </div>
                  </div>
                  {displayAiResponse && (
                    <Button
                      onClick={handleCopyResponse}
                      variant={responseCopied ? "default" : "outline"}
                      size="sm"
                      className={responseCopied ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}
                    >
                      {responseCopied ? (
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
                  )}
                </div>
                
                <div className="bg-muted/30 border border-border rounded-lg p-4 min-h-[200px]">
                  {isStreamingAI && !displayAiResponse ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">
                          {isSearchingWeb ? 'Buscando información en internet...' : 'Generando respuesta...'}
                        </p>
                        {isSearchingWeb && (
                          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-blue-600">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            <span className="ml-1">Conectando con fuentes web...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : displayAiResponse ? (
                    <div className="relative">
                      <div ref={mainResponseRef} className="whitespace-pre-wrap text-foreground leading-relaxed max-h-[350px] overflow-y-auto">
                        {displayAiResponse}
                        {isStreamingAI && (
                          <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                        )}
                      </div>
                      {isStreamingAI && (
                        <div className="flex items-center mt-4 text-xs text-muted-foreground">
                          <FiRefreshCw className="w-3 h-3 animate-spin mr-2" />
                          <span>Escribiendo en tiempo real...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-sm text-muted-foreground">No hay respuesta disponible</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* <Button
                onClick={onBack}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <FiEdit3 className="w-4 h-4 mr-2" />
                Editar Template
              </Button> */}
              {/* <Button
                onClick={onGenerate}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Regenerar
              </Button> */}
              <Button
                onClick={responseMode === 'AI_RESPONSE' ? onGenerate : handleGenerateWithAI}
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={!prompt || isLoading}
              >
                {isLoading ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FiZap className="w-4 h-4 mr-2" />
                    {responseMode === 'AI_RESPONSE' ? 'Regenerar con AI' : 'Generar con AI'}
                  </>
                )}
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <FiRotateCcw className="w-4 h-4 mr-2" />
                Nuevo Prompt
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AI Response Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiZap className="w-5 h-5 text-primary" />
              Respuesta Generada con AI
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 h-full">
            {/* Prompt Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Prompt enviado:</h4>
              <div className="bg-muted/30 border border-border rounded-lg p-3 max-h-32 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap text-foreground">{prompt}</p>
              </div>
            </div>

            {/* Response Section */}
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">Respuesta de AI:</h4>
                {displayAiResponse && !isLoading && (
                  <Button
                    onClick={handleCopyResponse}
                    variant={responseCopied ? "default" : "outline"}
                    size="sm"
                    className={responseCopied ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}
                  >
                    {responseCopied ? (
                      <>
                        <FiCheck className="w-4 h-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-4 h-4 mr-2" />
                        Copiar Respuesta
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div ref={responseRef} className="flex-1 bg-muted/30 border border-border rounded-lg p-4 overflow-y-auto">
                {isLoading && !displayAiResponse ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Iniciando generación...</p>
                    </div>
                  </div>
                ) : displayAiResponse ? (
                  <div className="relative">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-[250px] text-foreground">
                      {displayAiResponse}
                      {isLoading && (
                        <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                      )}
                    </div>
                    {isLoading && (
                      <div className="flex items-center mt-4 text-xs text-muted-foreground">
                        <FiRefreshCw className="w-3 h-3 animate-spin mr-2" />
                        <span>Escribiendo en tiempo real...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-muted-foreground">No hay respuesta disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                <FiX className="w-4 h-4 mr-2" />
                Cerrar
              </Button>
              {displayAiResponse && !isLoading && (
                <Button
                  onClick={handleCopyResponse}
                >
                  <FiCopy className="w-4 h-4 mr-2" />
                  Copiar Respuesta
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
