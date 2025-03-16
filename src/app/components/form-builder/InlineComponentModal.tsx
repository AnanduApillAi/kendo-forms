'use client';

import React from 'react';
import { Dialog } from '@progress/kendo-react-dialogs';
import { v4 as uuidv4 } from 'uuid';
import { FormComponentType } from './FormBuilderContext';

interface InlineComponentModalProps {
  onClose: () => void;
  onSelect: (component: any) => void;
}

const InlineComponentModal: React.FC<InlineComponentModalProps> = ({ onClose, onSelect }) => {
  const componentOptions = [
    {
      type: 'textField' as FormComponentType,
      componentName: 'Text Field',
      label: 'Text Field',
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
      },
    },
    {
      type: 'email' as FormComponentType,
      componentName: 'Email Field',
      label: 'Email',
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
      },
    },
    {
      type: 'number' as FormComponentType,
      componentName: 'Number Field',
      label: 'Number',
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
      },
    },
    {
      type: 'checkbox' as FormComponentType,
      componentName: 'Checkbox',
      label: 'Checkbox',
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
      type: 'radio' as FormComponentType,
      componentName: 'Radio Group',
      label: 'Radio Group',
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
      type: 'dropdown' as FormComponentType,
      componentName: 'Dropdown',
      label: 'Dropdown',
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
      },
    },
    {
      type: 'textarea' as FormComponentType,
      componentName: 'Text Area',
      label: 'Text Area',
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
        height: '100px',
      },
    },
  ];

  const handleSelect = (option: any) => {
    onSelect({
      id: uuidv4(),
      type: option.type,
      componentName: option.componentName,
      label: option.label,
      ...option.defaultProps,
    });
    onClose();
  };

  return (
    <Dialog 
      title="Add Inline Component" 
      onClose={onClose}
      className="k-dialog-theme"
    >
      <div className="grid grid-cols-2 gap-4 p-4">
        {componentOptions.map((option) => (
          <div
            key={option.type}
            onClick={() => handleSelect(option)}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--secondary)] transition-colors duration-200 rounded-lg border border-[var(--border)] shadow-sm hover:shadow"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center">
              {option.icon}
            </div>
            <span className="font-medium text-[var(--foreground)]">{option.label}</span>
          </div>
        ))}
      </div>
    </Dialog>
  );
};

export default InlineComponentModal; 