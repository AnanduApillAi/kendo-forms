'use client';

import React from 'react';
import { Dialog } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
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
      label: 'Text Field',
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
      },
    },
    {
      type: 'email' as FormComponentType,
      label: 'Email',
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
      },
    },
    {
      type: 'number' as FormComponentType,
      label: 'Number',
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
      },
    },
    {
      type: 'checkbox' as FormComponentType,
      label: 'Checkbox',
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
      type: 'radio' as FormComponentType,
      label: 'Radio Group',
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
      type: 'dropdown' as FormComponentType,
      label: 'Dropdown',
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
      },
    },
    {
      type: 'textarea' as FormComponentType,
      label: 'Text Area',
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
        height: '100px',
      },
    },
  ];

  const handleSelect = (option: any) => {
    onSelect({
      id: uuidv4(),
      type: option.type,
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
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--secondary)] transition-colors duration-200 rounded-md border border-[var(--border)]"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] flex items-center justify-center">
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