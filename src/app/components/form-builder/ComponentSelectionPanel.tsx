'use client';

import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { useFormBuilder, FormComponentType, componentName } from './FormBuilderContext';
import { v4 as uuidv4 } from 'uuid';
import { Draggable, Droppable } from '@hello-pangea/dnd';

// Create a simple pub/sub event system for cross-component communication
// This allows us to trigger the tab change without creating a complex state management system
export const EventBus = {
  events: {} as Record<string, Function[]>,
  
  subscribe(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  
  publish(event: string, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
};

interface ComponentOption {
  type: FormComponentType;
  label: string;
  icon: React.ReactNode;
  defaultProps: Record<string, any>;
  componentName: componentName;
}

const ComponentSelectionPanel: React.FC = () => {
  const { addComponent, setComponents, components } = useFormBuilder();

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
    e.dataTransfer.setData('componentName', option.componentName);
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

      <Droppable droppableId="component-panel" type="COMPONENT_ITEMS" isDropDisabled={true}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`grid grid-cols-1 gap-3 ${snapshot.isDraggingOver ? 'bg-[var(--accent-light)]' : ''}`}
          >
            {componentOptions.map((option, index) => (
              <Draggable
                key={option.type}
                draggableId={option.type}
                index={index}
              >
                {(provided, snapshot) => {
                  // Create a clone that stays in place while dragging
                  return (
                    <>
                      <div
                        onClick={() => handleAddComponent(option)}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 rounded-2xl  hover:bg-[var(--secondary-hover)] cursor-pointer transition-colors relative
                        ${snapshot.isDragging ? 'bg-[var(--secondary-hover)]' : ''}
                        
                      `}

                        style={{
                          ...provided.draggableProps.style,
                          
                          opacity: snapshot.isDragging ? 0.5 : 1
                        }}
                      >
                        <div className="flex items-center gap-3">

                          {option.icon}
                          <span>{option.label}</span>
                        </div>
                      </div>
                      {snapshot.isDragging && (
                        <div className="p-4 bg-[var(--secondary-hover)] rounded-2xl">
                          <div className="flex items-center gap-3">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default ComponentSelectionPanel; 