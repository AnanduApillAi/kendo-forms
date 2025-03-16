'use client';

import React, { useState } from 'react';
import { useFormBuilder } from './FormBuilderContext';
import { Button } from '@progress/kendo-react-buttons';
import { v4 as uuidv4 } from 'uuid';
import InlineComponentModal from './InlineComponentModal';
import CustomizationModal from './CustomizationModal';
import { Plus, Edit, Trash, GripVertical } from 'lucide-react'
import AIPromptInput from './AIPromptInput';

const FormCanvas: React.FC = () => {
  const {
    components,
    removeComponent,
    reorderComponents,
    reorderInlineComponents,
    selectedComponentId,
    setSelectedComponentId,
    addComponent,
    addInlineComponent
  } = useFormBuilder();

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [dragOverColIndex, setDragOverColIndex] = useState<number | null>(null);
  const [isDraggedFromPanel, setIsDraggedFromPanel] = useState(false);
  const [showInlineModal, setShowInlineModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const handleDragStart = (e: React.DragEvent, rowIndex: number, colIndex: number) => {
    setDraggedItemIndex(rowIndex);
    setDraggedColIndex(colIndex);
    // Required for Firefox
    e.dataTransfer.setData('text/plain', `${rowIndex},${colIndex}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, rowIndex: number, colIndex: number) => {
    e.preventDefault();

    const isFromComponentPanel = e.dataTransfer.types.includes('componentType');
    setIsDraggedFromPanel(isFromComponentPanel);

    e.dataTransfer.dropEffect = isFromComponentPanel ? 'copy' : 'move';

    setDragOverItemIndex(rowIndex);
    setDragOverColIndex(colIndex);
  };

  const handleDragLeave = () => {
    setDragOverItemIndex(null);
    setDragOverColIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropRowIndex: number, dropColIndex: number) => {
    e.preventDefault();

    // Check if we're dropping a component from the sidebar
    const componentType = e.dataTransfer.getData('componentType');
    const componentName = e.dataTransfer.getData('componentName');
    if (componentType) {
      addNewComponentByType(componentType,componentName, dropRowIndex);
    } else if (draggedItemIndex !== null && draggedColIndex !== null) {
      // If it's the same row, reorder within the row
      if (draggedItemIndex === dropRowIndex) {
        reorderInlineComponents(draggedItemIndex, draggedColIndex, dropColIndex);
      } else if (draggedItemIndex !== dropRowIndex) {
        // If different rows, use the regular reorder
        reorderComponents(draggedItemIndex, dropRowIndex);
      }
    }

    setDraggedItemIndex(null);
    setDraggedColIndex(null);
    setDragOverItemIndex(null);
    setDragOverColIndex(null);
    setIsDraggedFromPanel(false);
  };

  const addNewComponentByType = (componentType: string,componentName: string, insertAtIndex?: number) => {
    // Default properties for each component type
    const defaultProps: Record<string, any> = {
      textField: {
        label: 'Text Field',
        name: 'textField',
        className: 'form-control',
        placeholder: 'Enter text...',
        required: false,
        width: '100%',
      },
      email: {
        label: 'Email',
        name: 'email',
        className: 'form-control',
        placeholder: 'Enter email...',
        required: false,
        width: '100%',
      },
      number: {
        label: 'Number',
        name: 'number',
        className: 'form-control',
        placeholder: 'Enter number...',
        required: false,
        width: '100%',
      },
      checkbox: {
        label: 'Checkbox',
        name: 'checkbox',
        className: 'form-check',
        required: false,
      },
      radio: {
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
      dropdown: {
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
      textarea: {
        label: 'Text Area',
        name: 'textarea',
        className: 'form-control',
        placeholder: 'Enter text...',
        required: false,
        width: '100%',
        height: '100px',
      }
    };

    const newComponent = {
      id: uuidv4(),
      type: componentType as any,
      componentName: componentName as any,
      ...defaultProps[componentType],
    };
    console.log(newComponent);

    // Add the component
    addComponent(newComponent);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDraggedColIndex(null);
    setDragOverItemIndex(null);
    setDragOverColIndex(null);
    setIsDraggedFromPanel(false);
  };


  const getItemClassName = (rowIndex: number, colIndex: number) => {
    let className = "bg-[var(--card)] p-5 rounded-lg border mb-3 transition-all duration-200";

    // Selected component
    const row = components[rowIndex];
    const component = row[colIndex];
    if (component.id === selectedComponentId) {
      className += " border-[var(--primary)] shadow-md";
    } else {
      className += " border-[var(--border)]";
    }

    // Dragging state
    if (draggedItemIndex === rowIndex && draggedColIndex === colIndex) {
      className += " opacity-50 cursor-grabbing";
    } else {
      className += " opacity-100 cursor-grab";
    }

    // Drag over state
    if (dragOverItemIndex === rowIndex && dragOverColIndex === colIndex) {
      className += " scale-[1.02] border-dashed border-[var(--primary)] shadow-md";
    }

    return className;
  };

  const getEmptyAreaClassName = () => {
    let className = "flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-lg transition-all duration-200";

    if (isDraggedFromPanel) {
      className += " bg-[var(--secondary)] border-[var(--primary)] scale-[1.02] shadow-md";
    }

    return className;
  };

  const openInlineComponentModal = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
    setShowInlineModal(true);
  };

  const handleInlineComponentSelect = (component: any) => {
    if (selectedRowIndex !== null) {
      addInlineComponent(component, selectedRowIndex);
    }
    setShowInlineModal(false);
    setSelectedRowIndex(null);
  };

  return (
    <div className="p-5 h-full overflow-y-auto bg-[var(--background)]">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        Form Canvas
      </h2>

      {/* Floating AI Button */}
      <div className="fixed bottom-6 right-[calc(33.33%+20px)] z-10">
        <Button
          onClick={() => setShowAIPrompt(true)}
          className="rounded-full w-12 h-12 flex items-center justify-center bg-[var(--primary)] text-white shadow-lg hover:bg-[var(--primary-dark)] transition-colors"
          title="Build with AI"
          style={{backgroundColor: 'var(--primary) !important', color: 'var(--primary-foreground) !important'}}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-6 h-6"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
          </svg>
        </Button>
      </div>

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="w-full max-w-md">
            <AIPromptInput onClose={() => setShowAIPrompt(false)} />
          </div>
        </div>
      )}

      {components.length === 0 ? (
        <div className={getEmptyAreaClassName()}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-[var(--muted-foreground)] mb-3">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <p className="text-[var(--muted-foreground)] text-center">Select a component from the sidebar</p>
        </div>
      ) : (
        <div className="space-y-4" style={{ minHeight: '100px' }}>
          {components.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-3 items-center"
            >
              {row.map((component, colIndex) => (
                <div
                  key={component.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                  onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                  onDragEnd={handleDragEnd}
                  className={getItemClassName(rowIndex, colIndex)}
                  style={{ width: '100%', minWidth: '300px' }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="cursor-move p-1 select-none text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                        <GripVertical size={16} />
                      </div>
                      <p className="font-medium text-[var(--foreground)]">{component.componentName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedComponentId(component.id)}
                        className="cursor-pointer rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] p-1.5 w-7 h-7 flex items-center justify-center hover:opacity-90 transition-opacity"
                        aria-label="Edit component"

                        style={{backgroundColor: 'var(--primary) !important', color: 'var(--primary-foreground) !important'}}
                      >
                        <Edit size={14} />
                      </Button>
                      
                      <Button
                        onClick={() => removeComponent(component.id)}
                        className="cursor-pointer rounded-full bg-[var(--destructive)] text-[var(--destructive-foreground)] p-1.5 w-7 h-7 flex items-center justify-center hover:opacity-90 transition-opacity"
                        aria-label="Remove component"
                        style={{backgroundColor: 'var(--destructive) !important', color: 'var(--destructive-foreground) !important'}}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>

                  
                </div>
              ))}
              <Button 
                className="rounded-full cursor-pointe text-white p-2 w-9 h-9 flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0 shadow-sm hover:shadow"
                onClick={() => openInlineComponentModal(rowIndex)}
                
                aria-label="Add inline component"
              >
                <Plus size={18} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showInlineModal && (
        <InlineComponentModal
          onClose={() => {
            setShowInlineModal(false);
            setSelectedRowIndex(null);
          }}
          onSelect={handleInlineComponentSelect}
        />
      )}
      <CustomizationModal />
    </div>
  );
};

export default FormCanvas; 