"use client";
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/Button';
import { Text } from '@/components/Typography';

/**
 * Props:
 * - fields: Array de objetos { name, label, placeholder, type, required }
 * - apiUrl: String URL a la que se enviará el POST
 * - onSuccess: Callback al terminar con éxito
 * - buttonText: Texto del botón de envío
 * - extraData: Objeto con datos adicionales (ej. usuario_id) que no están en el form
 */
export default function DynamicForm({ 
  fields = [], 
  apiUrl, 
  onSuccess, 
  buttonText = "Enviar", 
  extraData = {},
  loadingExternal = false 
}) {
  // Generamos el estado inicial basado en los nombres de los campos
  const initialFormState = fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialFormState);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica de requeridos
    const missingFields = fields.filter(f => f.required && !formData[f.name]?.trim());
    if (missingFields.length > 0) {
      alert(`Por favor rellena: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...extraData }),
      });

      if (res.ok) {
        setFormData(initialFormState); // Limpiar form
        if (onSuccess) onSuccess();
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Error en el servidor');
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      alert(error.message);
    } finally {
      setEnviando(false);
    }
  };

  const isLoading = enviando || loadingExternal;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5">
      {fields.map((field) => (
        <div key={field.name}>
          <Text variant="muted" className="ml-1 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Text>
          
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              disabled={isLoading}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none text-sm font-medium disabled:opacity-50"
            />
          ) : (
            <input
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              disabled={isLoading}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
            />
          )}
        </div>
      ))}

      <Button 
        className="w-full py-4" 
        icon={Send} 
        loading={isLoading}
      >
        {buttonText}
      </Button>
    </form>
  );
}