'use client';

import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { useFormBuilder, FormComponentType, componentName } from './FormBuilderContext';
import { v4 as uuidv4 } from 'uuid';
import AIPromptInput from './AIPromptInput';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import AIChatHistory from './AIChatHistory';

interface ComponentOption {
  type: FormComponentType;
  label: string;
  icon: React.ReactNode;
  defaultProps: Record<string, any>;
  componentName: componentName;
}

const ComponentSelectionPanel: React.FC = () => {
  const { addComponent, addChatMessage, setComponents, components } = useFormBuilder();
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [isAIPromptSubmitting, setIsAIPromptSubmitting] = useState(false);

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

  const handleFollowupPrompt = async (prompt: string) => {
    
    setIsAIPromptSubmitting(true);
    
    try {
      // Call the API endpoint
      const response = await fetch('/api/ai-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          mode: 'update',
          existingForm: components
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Record failure in chat history
        addChatMessage(prompt, false);
        return;
      }
      // if(JSON.stringify(data)==JSON.stringify(components)){
      //   console.log('ai response is the same as the existing form, try another prompt');
      //   addChatMessage(prompt, false);
      //   return;
      // }

      // Update the form components with the response
      setComponents(data);
      
      // Record success in chat history
      addChatMessage(prompt, true, data);
    } catch (error) {
      console.error('Error generating form:', error);
      // Record failure in chat history
      addChatMessage(prompt, false);
    } finally {
      setIsAIPromptSubmitting(false);
    }
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
          className="w-full flex items-center h-12 justify-center gap-2 transition-colors p-3  rounded-lg "
          title="Describe the form you want to build with AI"
          style={{ background: 'linear-gradient(135deg, #3555FF 0%, #8313DB 100%)', border: 'none' }}
        >
          <div className="flex gap-2 text-white font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
              <path d="M20 13.5C20.0019 13.8058 19.909 14.1047 19.7341 14.3555C19.5591 14.6063 19.3107 14.7968 19.0231 14.9006L14.1875 16.6875L12.4062 21.5269C12.3008 21.8134 12.1099 22.0608 11.8595 22.2355C11.609 22.4101 11.311 22.5038 11.0056 22.5038C10.7003 22.5038 10.4022 22.4101 10.1518 22.2355C9.90133 22.0608 9.71048 21.8134 9.605 21.5269L7.8125 16.6875L2.97312 14.9062C2.68656 14.8008 2.43924 14.6099 2.26455 14.3595C2.08985 14.109 1.99619 13.811 1.99619 13.5056C1.99619 13.2003 2.08985 12.9022 2.26455 12.6518C2.43924 12.4013 2.68656 12.2105 2.97312 12.105L7.8125 10.3125L9.59375 5.47312C9.69923 5.18656 9.89008 4.93924 10.1405 4.76455C10.391 4.58985 10.689 4.49619 10.9944 4.49619C11.2997 4.49619 11.5978 4.58985 11.8482 4.76455C12.0987 4.93924 12.2895 5.18656 12.395 5.47312L14.1875 10.3125L19.0269 12.0938C19.3147 12.1986 19.5629 12.3901 19.7372 12.642C19.9115 12.8939 20.0033 13.1937 20 13.5ZM14.75 4.5H16.25V6C16.25 6.19891 16.329 6.38968 16.4697 6.53033C16.6103 6.67098 16.8011 6.75 17 6.75C17.1989 6.75 17.3897 6.67098 17.5303 6.53033C17.671 6.38968 17.75 6.19891 17.75 6V4.5H19.25C19.4489 4.5 19.6397 4.42098 19.7803 4.28033C19.921 4.13968 20 3.94891 20 3.75C20 3.55109 19.921 3.36032 19.7803 3.21967C19.6397 3.07902 19.4489 3 19.25 3H17.75V1.5C17.75 1.30109 17.671 1.11032 17.5303 0.96967C17.3897 0.829018 17.1989 0.75 17 0.75C16.8011 0.75 16.6103 0.829018 16.4697 0.96967C16.329 1.11032 16.25 1.30109 16.25 1.5V3H14.75C14.5511 3 14.3603 3.07902 14.2197 3.21967C14.079 3.36032 14 3.55109 14 3.75C14 3.94891 14.079 4.13968 14.2197 4.28033C14.3603 4.42098 14.5511 4.5 14.75 4.5ZM23 7.5H22.25V6.75C22.25 6.55109 22.171 6.36032 22.0303 6.21967C21.8897 6.07902 21.6989 6 21.5 6C21.3011 6 21.1103 6.07902 20.9697 6.21967C20.829 6.36032 20.75 6.55109 20.75 6.75V7.5H20C19.8011 7.5 19.6103 7.57902 19.4697 7.71967C19.329 7.86032 19.25 8.05109 19.25 8.25C19.25 8.44891 19.329 8.63968 19.4697 8.78033C19.6103 8.92098 19.8011 9 20 9H20.75V9.75C20.75 9.94891 20.829 10.1397 20.9697 10.2803C21.1103 10.421 21.3011 10.5 21.5 10.5C21.6989 10.5 21.8897 10.421 22.0303 10.2803C22.171 10.1397 22.25 9.94891 22.25 9.75V9H23C23.1989 9 23.3897 8.92098 23.5303 8.78033C23.671 8.63968 23.75 8.44891 23.75 8.25C23.75 8.05109 23.671 7.86032 23.5303 7.71967C23.3897 7.57902 23.1989 7.5 23 7.5Z" fill="white" />
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
          <div className="w-full max-w-xl">
            <AIPromptInput 
              onClose={() => setShowAIPrompt(false)} 
              onShowChatHistory={() => setShowChatHistory(true)}
            />
          </div>
        </div>
      )}

      {/* AI Chat History Panel */}
      {showChatHistory && (
        <AIChatHistory 
          onClose={() => setShowChatHistory(false)}
          onSubmitPrompt={handleFollowupPrompt}
          isSubmitting={isAIPromptSubmitting}
        />
      )}

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