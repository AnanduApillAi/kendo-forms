'use client';

import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { useFormBuilder, FormComponentType, componentName } from './FormBuilderContext';
import { v4 as uuidv4 } from 'uuid';

interface ComponentOption {
  type: FormComponentType;
  label: string;
  icon: React.ReactNode;
  defaultProps: Record<string, any>;
  componentName: componentName;
}

const ComponentSelectionPanel: React.FC = () => {
  const { addComponent } = useFormBuilder();

  const componentOptions: ComponentOption[] = [
    {
      type: 'textField',
      label: 'Text Field',
      componentName: 'Text Field',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="15" y1="12" x2="3" y2="12"></line>
          <line x1="17" y1="18" x2="3" y2="18"></line>
        </svg>
      ),
      defaultProps: {
        label: 'Text Field',
        name: 'textField',
        className: 'form-control',
        placeholder: 'Enter text...',
        required: false,
        width: '100%',
      },
    },
    {
      type: 'email',
      label: 'Email',
      componentName: 'Email Field',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      ),
      defaultProps: {
        label: 'Email',
        name: 'email',
        className: 'form-control',
        placeholder: 'Enter email...',
        required: false,
        width: '100%',
      },
    },
    {
      type: 'number',
      label: 'Number',
      componentName: 'Number Field',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      defaultProps: {
        label: 'Number',
        name: 'number',
        className: 'form-control',
        placeholder: 'Enter number...',
        required: false,
        width: '100%',
      },
    },
    {
      type: 'checkbox',
      label: 'Checkbox',
      componentName: 'Checkbox',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      ),
      defaultProps: {
        label: 'Checkbox',
        name: 'checkbox',
        className: 'form-check',
        required: false,
      },
    },
    {
      type: 'radio',
      label: 'Radio Group',
      componentName: 'Radio Button',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
      defaultProps: {
        label: 'Radio Group',
        name: 'radioGroup',
        className: 'form-check-group',
        required: false,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
      },
    },
    {
      type: 'dropdown',
      label: 'Dropdown',
      componentName: 'Dropdown',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      ),
      defaultProps: {
        label: 'Dropdown',
        name: 'dropdown',
        className: 'form-select',
        required: false,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
        width: '100%',
      },
    },
    {
      type: 'textarea',
      label: 'Text Area',
      componentName: 'Textarea',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="8" y1="8" x2="16" y2="8"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
          <line x1="8" y1="16" x2="12" y2="16"></line>
        </svg>
      ),
      defaultProps: {
        label: 'Text Area',
        name: 'textarea',
        className: 'form-control',
        placeholder: 'Enter text...',
        required: false,
        width: '100%',
        height: '100px',
      },
    },
  ];

  const handleAddComponent = (option: ComponentOption) => {
    addComponent({
      id: uuidv4(),
      type: option.type,
      label: option.label,
      componentName: option.componentName,
      ...option.defaultProps,
    });
  };

  const handleDragStart = (e: React.DragEvent, option: ComponentOption) => {
    e.dataTransfer.setData('componentType', option.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="15" y1="3" x2="15" y2="21"></line>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="3" y1="15" x2="21" y2="15"></line>
        </svg>
        Components
      </h2>
      <div className="grid grid-cols-1 gap-2">
        {componentOptions.map((option) => (
          <div
            key={option.type}
            onClick={() => handleAddComponent(option)}
            draggable
            onDragStart={(e) => handleDragStart(e, option)}
            className="component-item flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--secondary)] transition-colors duration-200"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] flex items-center justify-center">
              {option.icon}
            </div>
            <span className="font-medium">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentSelectionPanel; 