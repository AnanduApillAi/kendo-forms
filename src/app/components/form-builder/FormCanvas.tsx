'use client';

import React, { useState } from 'react';
import { useFormBuilder } from './FormBuilderContext';
import { Button } from '@progress/kendo-react-buttons';
import { v4 as uuidv4 } from 'uuid';
import InlineComponentModal from './InlineComponentModal';
import CustomizationModal from './CustomizationModal';
import { Plus, Edit, Trash, GripVertical, Upload } from 'lucide-react'
import AIPromptInput from './AIPromptInput';

import { Draggable, Droppable } from '@hello-pangea/dnd';
import Image from 'next/image';

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
      addNewComponentByType(componentType, componentName, dropRowIndex);
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

  const addNewComponentByType = (componentType: string, componentName: string, insertAtIndex?: number) => {
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
    let className = "bg-[var(--card)] px-4 py-2 rounded-lg border mb-3";

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
    let className = "flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-lg ";

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
      <div className="fixed bottom-6 right-[calc(33.33%+20px)] z-10"
      >
        <Button
          onClick={() => setShowAIPrompt(true)}
          className="rounded-full w-12 h-12 flex items-center justify-center bg-[var(--primary)] text-white shadow-lg hover:bg-[var(--primary-dark)] transition-colors"
          title="Build with AI"
          style={{ background: 'linear-gradient(135deg, #3555FF 0%, #8313DB 100%)', border: 'none' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path d="M20 13.5C20.0019 13.8058 19.909 14.1047 19.7341 14.3555C19.5591 14.6063 19.3107 14.7968 19.0231 14.9006L14.1875 16.6875L12.4062 21.5269C12.3008 21.8134 12.1099 22.0608 11.8595 22.2355C11.609 22.4101 11.311 22.5038 11.0056 22.5038C10.7003 22.5038 10.4022 22.4101 10.1518 22.2355C9.90133 22.0608 9.71048 21.8134 9.605 21.5269L7.8125 16.6875L2.97312 14.9062C2.68656 14.8008 2.43924 14.6099 2.26455 14.3595C2.08985 14.109 1.99619 13.811 1.99619 13.5056C1.99619 13.2003 2.08985 12.9022 2.26455 12.6518C2.43924 12.4013 2.68656 12.2105 2.97312 12.105L7.8125 10.3125L9.59375 5.47312C9.69923 5.18656 9.89008 4.93924 10.1405 4.76455C10.391 4.58985 10.689 4.49619 10.9944 4.49619C11.2997 4.49619 11.5978 4.58985 11.8482 4.76455C12.0987 4.93924 12.2895 5.18656 12.395 5.47312L14.1875 10.3125L19.0269 12.0938C19.3147 12.1986 19.5629 12.3901 19.7372 12.642C19.9115 12.8939 20.0033 13.1937 20 13.5ZM14.75 4.5H16.25V6C16.25 6.19891 16.329 6.38968 16.4697 6.53033C16.6103 6.67098 16.8011 6.75 17 6.75C17.1989 6.75 17.3897 6.67098 17.5303 6.53033C17.671 6.38968 17.75 6.19891 17.75 6V4.5H19.25C19.4489 4.5 19.6397 4.42098 19.7803 4.28033C19.921 4.13968 20 3.94891 20 3.75C20 3.55109 19.921 3.36032 19.7803 3.21967C19.6397 3.07902 19.4489 3 19.25 3H17.75V1.5C17.75 1.30109 17.671 1.11032 17.5303 0.96967C17.3897 0.829018 17.1989 0.75 17 0.75C16.8011 0.75 16.6103 0.829018 16.4697 0.96967C16.329 1.11032 16.25 1.30109 16.25 1.5V3H14.75C14.5511 3 14.3603 3.07902 14.2197 3.21967C14.079 3.36032 14 3.55109 14 3.75C14 3.94891 14.079 4.13968 14.2197 4.28033C14.3603 4.42098 14.5511 4.5 14.75 4.5ZM23 7.5H22.25V6.75C22.25 6.55109 22.171 6.36032 22.0303 6.21967C21.8897 6.07902 21.6989 6 21.5 6C21.3011 6 21.1103 6.07902 20.9697 6.21967C20.829 6.36032 20.75 6.55109 20.75 6.75V7.5H20C19.8011 7.5 19.6103 7.57902 19.4697 7.71967C19.329 7.86032 19.25 8.05109 19.25 8.25C19.25 8.44891 19.329 8.63968 19.4697 8.78033C19.6103 8.92098 19.8011 9 20 9H20.75V9.75C20.75 9.94891 20.829 10.1397 20.9697 10.2803C21.1103 10.421 21.3011 10.5 21.5 10.5C21.6989 10.5 21.8897 10.421 22.0303 10.2803C22.171 10.1397 22.25 9.94891 22.25 9.75V9H23C23.1989 9 23.3897 8.92098 23.5303 8.78033C23.671 8.63968 23.75 8.44891 23.75 8.25C23.75 8.05109 23.671 7.86032 23.5303 7.71967C23.3897 7.57902 23.1989 7.5 23 7.5Z" fill="white" />
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

      <Droppable droppableId="form-canvas" type="COMPONENT_ITEMS" >
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`border-2 w-fit min-w-[100%] border-dashed border-[#545966] rounded-lg min-h-[calc(100vh-10rem)] p-4 relative ${snapshot.isDraggingOver ? 'bg-[var(--secondary-hover)]' : ''
              }`}
          >
            {components.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-40">
                <div className="mb-4">
                  <Plus size={60} />
                </div>
                <p>Drag & drop components here or select from the sidebar</p>
              </div>
            ) : (
              <div className="space-y-4 w-full" style={{ minHeight: '100px' }}>
                {components.map((row, rowIndex) => (
                  <Draggable
                    key={rowIndex}
                    draggableId={rowIndex.toString()}
                    index={rowIndex}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={` flex flex-row gap-4 items-center justify-center w-fit rounded-lg  relative group ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <div className="cursor-move p-1 select-none text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4 -mr-4">
                          <GripVertical size={16} />
                        </div>
                        {row.map((component, colIndex) => (
                          <div
                            key={component.id}
                            className={getItemClassName(rowIndex, colIndex)}
                            style={{
                              width: '100%',
                              minWidth: '300px',
                              position: 'relative',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              padding: '16px',
                              background: 'var(--card)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">

                                <p className="font-medium text-[var(--foreground)]">{component.componentName}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => setSelectedComponentId(component.id)}
                                  className="cursor-pointer rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] p-1.5 w-8 h-8 flex items-center justify-center hover:opacity-90 transition-all hover:scale-105"
                                  aria-label="Edit component"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-[var(--muted-foreground)]"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </Button>

                                <Button
                                  onClick={() => removeComponent(component.id)}
                                  className="cursor-pointer rounded-full bg-[var(--destructive)] text-[var(--destructive-foreground)] p-1.5 w-8 h-8 flex items-center justify-center hover:opacity-90 transition-all hover:scale-105"
                                  aria-label="Remove component"
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </div>

                            {/* Bottom Reordering Controls - only show if row has multiple columns */}
                            {row.length > 1 && (
                              <div className="absolute bottom-0 left-0 right-0 flex justify-center -mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1 bg-[var(--card)] rounded-full p-1.5 shadow-lg border border-[var(--border)]">
                                  {/* Left button - only show if not the first column */}
                                  {colIndex > 0 && (
                                    <Button
                                      onClick={() => {
                                        reorderInlineComponents(rowIndex, colIndex, colIndex - 1);
                                      }}
                                      className="cursor-pointer rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] p-1 w-7 h-7 flex items-center justify-center hover:opacity-90 transition-all transform hover:scale-110"
                                      aria-label="Move left"
                                      title="Move left"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m15 18-6-6 6-6" />
                                      </svg>
                                    </Button>
                                  )}

                                  {/* Right button - only show if not the last column */}
                                  {colIndex < row.length - 1 && (
                                    <Button
                                      onClick={() => {
                                        reorderInlineComponents(rowIndex, colIndex, colIndex + 1);
                                      }}
                                      className="cursor-pointer rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] p-1 w-7 h-7 flex items-center justify-center hover:opacity-90 transition-all transform hover:scale-110"
                                      aria-label="Move right"
                                      title="Move right"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m9 18 6-6-6-6" />
                                      </svg>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
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
                    )}
                  </Draggable>
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

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