'use client';

import React, { useState, useRef } from 'react';
import { useFormBuilder, FormComponentProps } from './FormBuilderContext';
import { Button } from '@progress/kendo-react-buttons';
import { v4 as uuidv4 } from 'uuid';
import InlineComponentModal from './InlineComponentModal';
import CustomizationModal from './CustomizationModal';
import { Plus, Edit, Trash, GripVertical, Upload } from 'lucide-react'

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
    addInlineComponent,
    setComponents,
    addChatMessage
  } = useFormBuilder();

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [dragOverColIndex, setDragOverColIndex] = useState<number | null>(null);
  const [isDraggedFromPanel, setIsDraggedFromPanel] = useState(false);
  const [showInlineModal, setShowInlineModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);


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