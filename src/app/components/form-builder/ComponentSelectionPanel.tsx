'use client';

import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { useFormBuilder, FormComponentType, componentName } from './FormBuilderContext';
import { v4 as uuidv4 } from 'uuid';
import AIPromptInput from './AIPromptInput';

interface ComponentOption {
  type: FormComponentType;
  label: string;
  icon: React.ReactNode;
  defaultProps: Record<string, any>;
  componentName: componentName;
}

const ComponentSelectionPanel: React.FC = () => {
  const { addComponent } = useFormBuilder();
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const componentOptions: ComponentOption[] = [
    {
      type: 'textField',
      label: 'Text Field',
      componentName: 'Text Field',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="7" y1="9" x2="17" y2="9" />
          <line x1="7" y1="13" x2="17" y2="13" />
          <line x1="7" y1="17" x2="13" y2="17" />
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
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M9 12h6" />
          <path d="M12 9v6" />
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
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="m9 12 2 2 4-4" />
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
          <circle cx="12" cy="6" r="4" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="18" r="4" />
          <circle cx="6" cy="12" r="1" fill="currentColor" />
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
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m8 10 4 4 4-4" />
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
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 7h10" />
          <path d="M7 11h10" />
          <path d="M7 15h6" />
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
    <div className="p-4 h-full overflow-y-auto bg-[var(--card)] border-r border-[var(--border)]">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h6" />
          <path d="M8 11h8" />
          <path d="M8 15h6" />
        </svg>
        Components
      </h2>

      {/* AI Prompt Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowAIPrompt(true)}
          className="w-full flex items-center h-12 justify-center gap-2 bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors p-3  rounded-lg border border-[var(--primary-border)]"
          title="Describe the form you want to build with AI"
        >
          <div className="flex gap-2">
            
          
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
          </svg>
          Build with AI

          </div>
        </Button>
        <p className="text-xs text-[var(--text-secondary)] mt-2 text-start">
          Not sure what to build? Let AI help you create a form.
        </p>
      </div>

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="w-full max-w-md">
            <AIPromptInput onClose={() => setShowAIPrompt(false)} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {componentOptions.map((option) => (
          <div
            key={option.type}
            onClick={() => handleAddComponent(option)}
            draggable
            onDragStart={(e) => handleDragStart(e, option)}
            className="component-item flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--secondary)] transition-colors duration-200 rounded-lg border border-[var(--border)] shadow-sm hover:shadow"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center">
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