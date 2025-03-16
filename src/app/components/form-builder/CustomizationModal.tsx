'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { Input, Checkbox } from '@progress/kendo-react-inputs';
import { useFormBuilder, FormComponentProps } from './FormBuilderContext';
import { Plus, Trash } from 'lucide-react';

const CustomizationModal: React.FC = () => {
  const { components, selectedComponentId, setSelectedComponentId, updateComponent } = useFormBuilder();
  const [formData, setFormData] = useState<Partial<FormComponentProps>>({});

  // Find the selected component across all rows
  const selectedComponent = selectedComponentId 
    ? components.flatMap(row => row).find(c => c.id === selectedComponentId) 
    : null;

  useEffect(() => {
    if (selectedComponent) {
      setFormData({ ...selectedComponent });
    }
  }, [selectedComponent]);

  if (!selectedComponent) return null;

  const handleClose = () => {
    setSelectedComponentId(null);
  };

  const handleSave = () => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, formData);
      setSelectedComponentId(null);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'required' || name === 'showLabel' ? checked : value
    }));
  };

  const handleCheckboxChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionsChange = (options: { label: string; value: string }[]) => {
    setFormData(prev => ({
      ...prev,
      options
    }));
  };

  const renderBasicFields = () => {
    return (
      <div className="space-y-5">
        <div className="field-group">
          <Checkbox
            name="showLabel"
            label="Show Label"
            checked={formData.showLabel !== false}
            onChange={handleCheckboxChange}
            className="text-[var(--foreground)]"
          />
        </div>

        {formData.showLabel !== false && (
          <div className="field-group">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Label</label>
            <Input
              name="label"
              value={formData.label || ''}
              onChange={handleChange}
              style={{ width: '100%' }}
              className="border-[var(--border)] bg-[var(--background)] rounded-md p-2"
            />
          </div>
        )}
        
        <div className="field-group">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Name</label>
          <Input
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            style={{ width: '100%' }}
            className="border-[var(--border)] bg-[var(--background)] rounded-md p-2"
          />
        </div>
        
        <div className="field-group">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Class Name</label>
          <Input
            name="className"
            value={formData.className || ''}
            onChange={handleChange}
            style={{ width: '100%' }}
            className="border-[var(--border)] bg-[var(--background)] rounded-md p-2"
          />
        </div>
        
        {['textField', 'email', 'number', 'textarea'].includes(selectedComponent.type) && (
          <div className="field-group">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Placeholder</label>
            <Input
              name="placeholder"
              value={formData.placeholder || ''}
              onChange={handleChange}
              style={{ width: '100%' }}
              className="border-[var(--border)] bg-[var(--background)] rounded-md p-2"
            />
          </div>
        )}
        
        <div className="field-group">
          <Checkbox
            name="required"
            label="Required"
            checked={!!formData.required}
            onChange={handleCheckboxChange}
            className="text-[var(--foreground)]"
          />
        </div>
      </div>
    );
  };

  const renderOptionsField = () => {
    if (!['radio', 'dropdown'].includes(selectedComponent.type)) {
      return null;
    }

    const options = formData.options || [];
    
    return (
      <div className="field-group mt-6">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-3">Options</label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex gap-3">
              <Input
                value={option.label}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = { ...newOptions[index], label: e.value as string };
                  handleOptionsChange(newOptions);
                }}
                placeholder="Label"
                style={{ width: '50%' }}
                className="border-[var(--border)] bg-[var(--background)] rounded-md p-2"
              />
              <Input
                value={option.value}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = { ...newOptions[index], value: e.value as string };
                  handleOptionsChange(newOptions);
                }}
                placeholder="Value"
                style={{ width: '50%' }}
                className="border-[var(--border)] bg-[var(--background)] rounded-md p-2"
              />
              <Button
                onClick={() => {
                  const newOptions = options.filter((_, i) => i !== index);
                  handleOptionsChange(newOptions);
                }}
                className="flex items-center justify-center bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90 transition-opacity rounded-md"
              >
                <Trash size={16} />
              </Button>
            </div>
          ))}
          <Button
            onClick={() => {
              handleOptionsChange([...options, { label: 'New Option', value: `option${options.length + 1}` }]);
            }}
            className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity rounded-md mt-3 px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} />
              Add Option
            </div>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog 
      title={`Edit ${selectedComponent.componentName}`} 
      onClose={handleClose} 
      width={550}
      className="k-dialog-theme"
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="p-5">
          <h3 className="text-md font-semibold mb-4 text-[var(--foreground)] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Component Properties
          </h3>
          {renderBasicFields()}
          {renderOptionsField()}
        </div>
      </div>
      <DialogActionsBar>
        <Button 
          onClick={handleClose} 
          className="bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--secondary-hover)] transition-colors rounded-md px-4 py-2"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity rounded-md px-4 py-2"
        >
          Save Changes
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};

export default CustomizationModal; 