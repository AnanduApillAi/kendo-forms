'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { Input, Checkbox } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
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
      <div className="space-y-4 ">
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
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Label</label>
            <Input
              name="label"
              value={formData.label || ''}
              onChange={handleChange}
              style={{ width: '100%' }}
              className="border-[var(--border)] bg-[var(--background)]"
            />
          </div>
        )}
        
        <div className="field-group">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Name</label>
          <Input
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            style={{ width: '100%' }}
            className="border-[var(--border)] bg-[var(--background)]"
          />
        </div>
        
        <div className="field-group">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Class Name</label>
          <Input
            name="className"
            value={formData.className || ''}
            onChange={handleChange}
            style={{ width: '100%' }}
            className="border-[var(--border)] bg-[var(--background)]"
          />
        </div>
        
        {['textField', 'email', 'number', 'textarea'].includes(selectedComponent.type) && (
          <div className="field-group">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Placeholder</label>
            <Input
              name="placeholder"
              value={formData.placeholder || ''}
              onChange={handleChange}
              style={{ width: '100%' }}
              className="border-[var(--border)] bg-[var(--background)]"
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
      <div className="field-group mt-4">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Options</label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option.label}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = { ...newOptions[index], label: e.value as string };
                  handleOptionsChange(newOptions);
                }}
                placeholder="Label"
                style={{ width: '50%' }}
                className="border-[var(--border)] bg-[var(--background)]"
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
                className="border-[var(--border)] bg-[var(--background)]"
              />
              <Button
                onClick={() => {
                  const newOptions = options.filter((_, i) => i !== index);
                  handleOptionsChange(newOptions);
                }}
                className="flex items-center justify-center bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90 transition-opacity"
              >
                <Trash size={16} />
              </Button>
            </div>
          ))}
          <Button
            onClick={() => {
              handleOptionsChange([...options, { label: 'New Option', value: `option${options.length + 1}` }]);
            }}
            className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Add Option
          </Button>
        </div>
      </div>
    );
  };

  return (
    
    <Dialog 
      title={`Edit ${selectedComponent.type}`} 
      onClose={handleClose} 
      width={500}
      className="k-dialog-theme"
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4">
          <h3 className="text-md font-semibold mb-2 text-[var(--foreground)]">Basic Properties</h3>
          {renderBasicFields()}
          {renderOptionsField()}
        </div>
      </div>
      <DialogActionsBar>
        <Button 
          onClick={handleClose} 
          className="bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--secondary-hover)] transition-colors"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
        >
          Save
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};

export default CustomizationModal; 