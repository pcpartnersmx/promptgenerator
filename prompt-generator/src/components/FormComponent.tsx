'use client';

import { useState, useEffect } from 'react';

type FormData = {
  [key: string]: string;
};

type FormComponentProps = {
  onSubmit: (data: FormData) => void;
  availableVariables: string[];
  formData: FormData;
};

export default function FormComponent({ onSubmit, availableVariables, formData: propFormData }: FormComponentProps) {
  const [formData, setFormData] = useState<FormData>(propFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    setFormData(propFormData);
  }, [propFormData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    // Validate required fields (first 4 are required by default)
    const requiredFields = availableVariables.slice(0, 4);
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        const fieldLabels: { [key: string]: string } = {
          'producto': 'El producto es requerido',
          'publicoObjetivo': 'El público objetivo es requerido',
          'objetivo': 'El objetivo es requerido',
          'tono': 'El tono es requerido'
        };
        newErrors[field] = fieldLabels[field] || `El campo ${field} es requerido`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getFieldConfig = (variable: string) => {
    const fieldLabels: { [key: string]: string } = {
      'producto': 'Producto/Servicio',
      'publicoObjetivo': 'Público Objetivo',
      'objetivo': 'Objetivo',
      'tono': 'Tono',
      'restricciones': 'Restricciones'
    };

    const fieldPlaceholders: { [key: string]: string } = {
      'producto': 'Ej: Aplicación móvil de fitness',
      'publicoObjetivo': 'Ej: Personas de 25-40 años interesadas en salud',
      'objetivo': 'Ej: Aumentar las descargas en un 50%',
      'tono': 'Ej: Profesional, motivacional, casual',
      'restricciones': 'Ej: Máximo 500 palabras, evitar jerga técnica'
    };

    return {
      key: variable,
      label: fieldLabels[variable] || variable.charAt(0).toUpperCase() + variable.slice(1),
      placeholder: fieldPlaceholders[variable] || `Ingresa ${variable}`,
      required: availableVariables.indexOf(variable) < 4 // First 4 are required
    };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Configuración del Prompt</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {availableVariables.map((variable) => {
          const field = getFieldConfig(variable);
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <input
                type="text"
                value={formData[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors[field.key] ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors[field.key] && (
                <p className="mt-1 text-sm text-red-400">{errors[field.key]}</p>
              )}
            </div>
          );
        })}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Continuar al Editor de Template
          </button>
        </div>
      </form>
    </div>
  );
}
