
import { useState, useEffect } from 'react';

type TemplateEditorProps = {
  template: string;
  onSubmit: (template: string) => void;
  onBack: () => void;
  availableVariables: string[];
  onAddVariable: (variableName: string) => void;
  onDeleteVariable: (variableName: string) => void;
  onUpdateVariable: (oldName: string, newName: string) => void;
};

export default function TemplateEditor({ 
  template, 
  onSubmit, 
  onBack, 
  availableVariables: propAvailableVariables, 
  onAddVariable, 
  onDeleteVariable, 
  onUpdateVariable 
}: TemplateEditorProps) {
  const [templateText, setTemplateText] = useState(template);
  const [newVariable, setNewVariable] = useState('');
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    setTemplateText(template);
  }, [template]);

  const handleVariableClick = (variable: string) => {
    const textarea = document.getElementById('template-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const variablePattern = `{${variable}}`;
      const newText = templateText.substring(0, start) + variablePattern + templateText.substring(end);
      setTemplateText(newText);
      
      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variablePattern.length, start + variablePattern.length);
      }, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(templateText);
  };

  const addVariable = () => {
    if (newVariable.trim() && !propAvailableVariables.includes(newVariable.trim())) {
      onAddVariable(newVariable.trim());
      setNewVariable('');
    }
  };

  const deleteVariable = (variable: string) => {
    onDeleteVariable(variable);
    // Remove all instances of the variable from template
    const variablePattern = `{${variable}}`;
    setTemplateText(templateText.replace(new RegExp(variablePattern.replace(/[{}]/g, '\\$&'), 'g'), ''));
  };

  const startEditing = (variable: string) => {
    setEditingVariable(variable);
    setEditValue(variable);
  };

  const saveEdit = () => {
    if (editValue.trim() && editingVariable) {
      onUpdateVariable(editingVariable, editValue.trim());
      setEditingVariable(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingVariable(null);
    setEditValue('');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Editor de Template</h2>
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          ← Volver
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-300 mb-3">Variables Disponibles</h3>
        
        {/* Add new variable section */}
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Agregar Nueva Variable
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              placeholder="nombre_variable"
              className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addVariable()}
            />
            <button
              onClick={addVariable}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors duration-200"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Variables list */}
        <div className="flex flex-wrap gap-2 mb-3">
          {propAvailableVariables.map((variable) => (
            <div key={variable} className="flex items-center gap-1">
              {editingVariable === variable ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleVariableClick(variable)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors duration-200"
                  >
                    {`{${variable}}`}
                  </button>
                  <button
                    onClick={() => startEditing(variable)}
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteVariable(variable)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400">
          Haz clic en una variable para insertarla • ✏️ editar • 🗑️ eliminar
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Template del Prompt
          </label>
          <textarea
            id="template-textarea"
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            placeholder="Escribe tu template aquí usando las variables disponibles..."
            className="w-full h-64 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Volver
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Generar Prompt
          </button>
        </div>
      </form>
    </div>
  );
}
