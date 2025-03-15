'use client';

import React, { useState, useRef } from 'react';
import { useFormBuilder } from './FormBuilderContext';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Checkbox, RadioGroup, RadioButton } from '@progress/kendo-react-inputs';
import { v4 as uuidv4 } from 'uuid';
import InlineComponentModal from './InlineComponentModal';
import CustomizationModal from './CustomizationModal';
import { Plus, Edit, Trash, GripVertical } from 'lucide-react'

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
    if (componentType) {
      addNewComponentByType(componentType, dropRowIndex);
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

  const addNewComponentByType = (componentType: string, insertAtIndex?: number) => {
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
      ...defaultProps[componentType],
    };

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

  const renderComponent = (component: any) => {
    const { id, type, label, name, className, placeholder, required, options, width, height } = component;
    const style = {
      width:'100%',
      height:'auto',
    };

    switch (type) {
      case 'textField':
        return (
          <Input
            placeholder={placeholder}
            style={style}
            disabled
            name={name}
            className={className}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            placeholder={placeholder}
            style={style}
            disabled
            name={name}
            className={className}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            placeholder={placeholder}
            style={style}
            disabled
            name={name}
            className={className}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            label={label}
            disabled
            name={name}
            className={className}
          />
        );
      case 'radio':
        return (
          <div style={style} className={className}>
            {options?.map((option: any, index: number) => (
              <div key={index} className="k-radio-item">
                <input
                  type="radio"
                  className="k-radio"
                  id={`${id}-${index}`}
                  name={name || id}
                  disabled
                />
                <label className="k-radio-label" htmlFor={`${id}-${index}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <DropDownList
            data={options?.map((o: any) => o.value) || []}
            style={style}
            disabled
            name={name}
            className={className}
          />
        );
      case 'textarea':
        return (
          <Input
            type="textarea"
            placeholder={placeholder}
            style={{ ...style, minHeight: '80px' }}
            disabled
            name={name}
            className={className}
          />
        );
      case 'button':
        return (
          <div 
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
            style={{ ...style, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px 16px' }}
          >
            {label}
          </div>
        );
      default:
        return null;
    }
  };

  const getItemClassName = (rowIndex: number, colIndex: number) => {
    let className = "bg-[var(--card)] p-4 rounded-lg border mb-3 transition-all duration-200";

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
    let className = "flex items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-lg transition-all duration-200";

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
    <div
      className="p-4 h-full overflow-y-auto"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        Form Canvas
      </h2>

      {components.length === 0 ? (
        <div
          className={getEmptyAreaClassName()}
        >
          <p className="text-[var(--muted-foreground)]">Select a component from the sidebar</p>
        </div>
      ) : (
        <div className="space-y-4" style={{ minHeight: '100px' }}>
          {components.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-2 items-center"
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
                  style={{ width: '100%',minWidth: '200px' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="cursor-move p-1 select-none text-[var(--muted-foreground)]">
                      <GripVertical size={16} />
                    </div>
                    <div className="flex w-full ml-5">
                        <p className="text-[var(--foreground)]">{component.componentName}</p>
                      </div>
                    <div className="flex gap-2">
                      
                      <button
                        onClick={() => setSelectedComponentId(component.id)}
                        className="cursor-pointer rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] p-1.5 w-7 h-7 flex items-center justify-center hover:opacity-90 transition-opacity"
                        aria-label="Edit component"
                      >
                        <Edit size={14} />
                      </button>
                      
                      <button
                        onClick={() => removeComponent(component.id)}
                        className="cursor-pointer rounded-full bg-[var(--destructive)] text-[var(--destructive-foreground)] p-1.5 w-7 h-7 flex items-center justify-center hover:opacity-90 transition-opacity"
                        aria-label="Remove component"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  
                </div>
              ))}
              <button 
                className="rounded-full cursor-pointer bg-[var(--primary)] text-[var(--primary-foreground)] p-2 w-8 h-8 flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
                onClick={() => openInlineComponentModal(rowIndex)}
                aria-label="Add inline component"
              >
                <Plus size={16} />
              </button>
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