'use client';

import { useState } from 'react';
import FormComponent from '../components/FormComponent';
import TemplateEditor from '../components/TemplateEditor';
import PromptDisplay from '../components/PromptDisplay';

type FormData = {
  [key: string]: string;
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'form' | 'template' | 'result'>('form');
  const [availableVariables, setAvailableVariables] = useState([
    'producto',
    'publicoObjetivo',
    'objetivo',
    'tono',
    'restricciones'
  ]);
  const [formData, setFormData] = useState<FormData>(() => {
    const initialData: FormData = {};
    availableVariables.forEach(variable => {
      initialData[variable] = '';
    });
    return initialData;
  });
  const [template, setTemplate] = useState(`Eres un experto en marketing digital especializado en {producto}.

Tu objetivo es crear contenido que resuene con {publicoObjetivo} para lograr {objetivo}.

Tono: {tono}

Restricciones: {restricciones}

Por favor, proporciona una estrategia detallada y creativa.`);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentStep('template');
  };

  const handleTemplateSubmit = (templateText: string) => {
    setTemplate(templateText);
    setCurrentStep('result');
  };

  const addVariable = (variableName: string) => {
    if (variableName.trim() && !availableVariables.includes(variableName.trim())) {
      const newVariable = variableName.trim();
      setAvailableVariables([...availableVariables, newVariable]);
      setFormData({...formData, [newVariable]: ''});
    }
  };

  const deleteVariable = (variableName: string) => {
    const updatedVariables = availableVariables.filter(v => v !== variableName);
    setAvailableVariables(updatedVariables);
    
    // Remove from formData
    const {[variableName]: removed, ...restFormData} = formData;
    setFormData(restFormData);
    
    // Remove from template
    const variablePattern = `{${variableName}}`;
    setTemplate(template.replace(new RegExp(variablePattern.replace(/[{}]/g, '\\$&'), 'g'), ''));
  };

  const updateVariable = (oldName: string, newName: string) => {
    if (newName.trim() && (newName.trim() === oldName || !availableVariables.includes(newName.trim()))) {
      const updatedVariables = availableVariables.map(v => v === oldName ? newName.trim() : v);
      setAvailableVariables(updatedVariables);
      
      // Update in formData
      const {[oldName]: value, ...restFormData} = formData;
      setFormData({...restFormData, [newName.trim()]: value});
      
      // Update in template
      const oldPattern = `{${oldName}}`;
      const newPattern = `{${newName.trim()}}`;
      setTemplate(template.replace(new RegExp(oldPattern.replace(/[{}]/g, '\\$&'), 'g'), newPattern));
    }
  };

  const generatePrompt = () => {
    let prompt = template;
    availableVariables.forEach(variable => {
      const variablePattern = `{${variable}}`;
      const value = formData[variable] || '';
      prompt = prompt.replace(new RegExp(variablePattern.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    setGeneratedPrompt(prompt);
  };

  const resetApp = () => {
    setCurrentStep('form');
    const resetData: FormData = {};
    availableVariables.forEach(variable => {
      resetData[variable] = '';
    });
    setFormData(resetData);
    setGeneratedPrompt('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Form → Prompt Builder</h1>
          <p className="text-gray-400 text-center">Crea prompts personalizados con formularios dinámicos</p>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentStep('form')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Preguntas
            </button>
            <button
              onClick={() => setCurrentStep('template')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Editor de Template
            </button>
            <button
              onClick={() => setCurrentStep('result')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Prompt Display
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {currentStep === 'form' && (
            <FormComponent 
              onSubmit={handleFormSubmit}
              availableVariables={availableVariables}
              formData={formData}
            />
          )}
          
          {currentStep === 'template' && (
            <TemplateEditor 
              template={template}
              onSubmit={handleTemplateSubmit}
              onBack={() => setCurrentStep('form')}
              availableVariables={availableVariables}
              onAddVariable={addVariable}
              onDeleteVariable={deleteVariable}
              onUpdateVariable={updateVariable}
            />
          )}
          
          {currentStep === 'result' && (
            <PromptDisplay 
              prompt={generatedPrompt}
              onGenerate={generatePrompt}
              onBack={() => setCurrentStep('template')}
              onReset={resetApp}
            />
          )}
        </div>
      </div>
    </div>
  );
}