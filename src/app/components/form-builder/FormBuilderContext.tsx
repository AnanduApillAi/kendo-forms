'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Define types for form components
export type FormComponentType = 
  | 'textField' 
  | 'email' 
  | 'number' 
  | 'checkbox' 
  | 'radio' 
  | 'dropdown' 
  | 'textarea';

export type componentName = 'Text Field' | 'Email Field' | 'Number Field' | 'Checkbox' | 'Radio Button' | 'Dropdown' | 'Textarea';

export interface FormComponentProps {
  id: string;
  type: FormComponentType;
  label: string;
  name?: string;
  componentName: componentName;
  className?: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  width?: string;
  height?: string;
  borderStyle?: string;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  inline?: boolean;
  showLabel?: boolean;
}

interface FormBuilderContextType {
  components: FormComponentProps[][];
  addComponent: (component: FormComponentProps) => void;
  addInlineComponent: (component: FormComponentProps, rowIndex: number) => void;
  updateComponent: (id: string, updates: Partial<FormComponentProps>) => void;
  removeComponent: (id: string) => void;
  reorderComponents: (startIndex: number, endIndex: number) => void;
  reorderInlineComponents: (rowIndex: number, startIndex: number, endIndex: number) => void;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  exportAsJson: () => string;
  exportAsJsx: () => string;
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export const FormBuilderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<FormComponentProps[][]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const addComponent = (component: FormComponentProps) => {
    setComponents((prev) => [...prev, [component]]);
  };

  const addInlineComponent = (component: FormComponentProps, rowIndex: number) => {
    setComponents((prev) => {
      const newComponents = [...prev];
      if (rowIndex >= 0 && rowIndex < newComponents.length) {
        newComponents[rowIndex] = [...newComponents[rowIndex], component];
        // Update width of all components in the row
        newComponents[rowIndex] = newComponents[rowIndex].map(comp => ({
          ...comp,
          width: `${100 / newComponents[rowIndex].length}%`
        }));
      }
      return newComponents;
    });
  };

  const updateComponent = (id: string, updates: Partial<FormComponentProps>) => {
    setComponents((prev) =>
      prev.map(row =>
        row.map(component =>
          component.id === id ? { ...component, ...updates } : component
        )
      )
    );
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => {
      const newComponents = prev.map(row => row.filter(component => component.id !== id));
      // Remove empty rows
      return newComponents.filter(row => row.length > 0);
    });
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const reorderComponents = (startIndex: number, endIndex: number) => {
    setComponents((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const reorderInlineComponents = (rowIndex: number, startIndex: number, endIndex: number) => {
    setComponents((prev) => {
      const newComponents = [...prev];
      const row = [...newComponents[rowIndex]];
      const [removed] = row.splice(startIndex, 1);
      row.splice(endIndex, 0, removed);
      newComponents[rowIndex] = row;

      // Recalculate widths
      newComponents[rowIndex] = row.map(comp => ({
        ...comp,
        width: `${100 / row.length}%`
      }));

      return newComponents;
    });
  };

  const exportAsJson = () => {
    return JSON.stringify(components, null, 2);
  };

  const exportAsJsx = () => {
    let jsx = `import React from 'react';\n`;
    jsx += `import { Form, Field, FormElement } from '@progress/kendo-react-form';\n`;
    jsx += `import { Input } from '@progress/kendo-react-inputs';\n`;
    jsx += `import { Checkbox, RadioGroup, RadioButton } from '@progress/kendo-react-inputs';\n`;
    jsx += `import { DropDownList } from '@progress/kendo-react-dropdowns';\n`;
    jsx += `import { Button } from '@progress/kendo-react-buttons';\n\n`;
    
    jsx += `const GeneratedForm = () => {\n`;
    jsx += `  const handleSubmit = (dataItem) => console.log('Form submitted:', dataItem);\n\n`;
    jsx += `  return (\n`;
    jsx += `    <Form\n`;
    jsx += `      onSubmit={handleSubmit}\n`;
    jsx += `      render={(formRenderProps) => (\n`;
    jsx += `        <FormElement style={{ maxWidth: '650px' }}>\n`;
    
    components.forEach((row, rowIndex) => {
      jsx += `          <div key="${rowIndex}" className="flex gap-4">\n`;
      row.forEach((component) => {
        const { id, type, label, placeholder, required, options } = component;
        
        jsx += `            <Field\n`;
        jsx += `              key="${id}"\n`;
        jsx += `              id="${id}"\n`;
        jsx += `              name="${id}"\n`;
        jsx += `              label="${label}"\n`;
        jsx += `              ${required ? 'required={true}' : ''}\n`;
        
        switch (type) {
          case 'textField':
            jsx += `              component={Input}\n`;
            jsx += `              placeholder="${placeholder || ''}"\n`;
            break;
          case 'email':
            jsx += `              component={Input}\n`;
            jsx += `              type="email"\n`;
            jsx += `              placeholder="${placeholder || ''}"\n`;
            break;
          case 'number':
            jsx += `              component={Input}\n`;
            jsx += `              type="number"\n`;
            jsx += `              placeholder="${placeholder || ''}"\n`;
            break;
          case 'checkbox':
            jsx += `              component={Checkbox}\n`;
            break;
          case 'radio':
            jsx += `              component={RadioGroup}\n`;
            jsx += `              data={${JSON.stringify(options || [])}}\n`;
            jsx += `              layout="vertical"\n`;
            break;
          case 'dropdown':
            jsx += `              component={DropDownList}\n`;
            jsx += `              data={${JSON.stringify(options?.map(o => o.value) || [])}}\n`;
            break;
          case 'textarea':
            jsx += `              component={Input}\n`;
            jsx += `              type="textarea"\n`;
            jsx += `              placeholder="${placeholder || ''}"\n`;
            break;
        }
        
        jsx += `            />\n`;
      });
      jsx += `          </div>\n`;
    });
    
    jsx += `          <div className="k-form-buttons">\n`;
    jsx += `            <Button type="submit" themeColor="primary">Submit</Button>\n`;
    jsx += `          </div>\n`;
    jsx += `        </FormElement>\n`;
    jsx += `      )}\n`;
    jsx += `    />\n`;
    jsx += `  );\n`;
    jsx += `};\n\n`;
    jsx += `export default GeneratedForm;\n`;
    
    return jsx;
  };

  const value = useMemo(
    () => ({
      components,
      addComponent,
      addInlineComponent,
      updateComponent,
      removeComponent,
      reorderComponents,
      reorderInlineComponents,
      selectedComponentId,
      setSelectedComponentId,
      exportAsJson,
      exportAsJsx,
    }),
    [components, selectedComponentId]
  );

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
};

export const useFormBuilder = (): FormBuilderContextType => {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
}; 