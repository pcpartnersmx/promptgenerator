
import { useState, useEffect } from 'react';
import { FiEdit3, FiPlus, FiTrash2, FiSave, FiX, FiCode, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
            <FiEdit3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-black">Editor de Template</h2>
            <p className="text-gray-600 text-sm">Personaliza tu template con variables dinámicas</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Volver</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiCode className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-700">Variables Disponibles</h3>
        </div>
        
        {/* Add new variable section */}
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <FiPlus className="w-4 h-4 text-green-500" />
            Agregar Nueva Variable
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              placeholder="nombre_variable"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && addVariable()}
            />
            <button
              onClick={addVariable}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>

        {/* Variables list */}
        <div className="flex flex-wrap gap-3 mb-4">
          {propAvailableVariables.map((variable) => (
            <div key={variable} className="flex items-center gap-1">
              {editingVariable === variable ? (
                <div className="flex items-center gap-1 bg-gray-100 p-2 rounded-lg border border-gray-300">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="p-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200"
                    title="Guardar"
                  >
                    <FiSave className="w-3 h-3" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors duration-200"
                    title="Cancelar"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleVariableClick(variable)}
                    className="group flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 hover:border-blue-400 text-blue-700 hover:text-blue-800 text-sm rounded-lg transition-all duration-200"
                  >
                    <FiCode className="w-3 h-3" />
                    {`{${variable}}`}
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditing(variable)}
                      className="p-1.5 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 hover:border-yellow-400 text-yellow-700 hover:text-yellow-800 rounded transition-all duration-200"
                      title="Editar"
                    >
                      <FiEdit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteVariable(variable)}
                      className="p-1.5 bg-red-100 hover:bg-red-200 border border-red-300 hover:border-red-400 text-red-700 hover:text-red-800 rounded transition-all duration-200"
                      title="Eliminar"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCode className="w-4 h-4" />
          <span>Haz clic en una variable para insertarla en el template</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <FiEdit3 className="w-4 h-4 text-blue-600" />
            Template del Prompt
          </label>
          <div className="relative">
            <textarea
              id="template-textarea"
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              placeholder="Escribe tu template aquí usando las variables disponibles..."
              className="w-full h-64 px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 font-mono text-sm leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {templateText.length} caracteres
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 border border-gray-400 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <FiArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button
            type="submit"
            className="group flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
          >
            <span>Generar Prompt</span>
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </form>
    </div>
  );
}
