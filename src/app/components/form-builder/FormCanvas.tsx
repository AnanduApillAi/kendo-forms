'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFormBuilder, FormComponentProps } from './FormBuilderContext';
import { Button } from '@progress/kendo-react-buttons';
import { v4 as uuidv4 } from 'uuid';
import InlineComponentModal from './InlineComponentModal';
import CustomizationModal from './CustomizationModal';
import { Plus, Edit, Trash, GripVertical, Upload, ChevronLeft, ChevronRight, Download, FileCode, Code, Copy, Check, MessageSquare } from 'lucide-react'
import { Dialog } from '@progress/kendo-react-dialogs';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import Image from 'next/image';
import { EventBus } from './ComponentSelectionPanel';

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
    addChatMessage,
    exportAsJson,
    exportAsJsx
  } = useFormBuilder();

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [dragOverColIndex, setDragOverColIndex] = useState<number | null>(null);
  const [isDraggedFromPanel, setIsDraggedFromPanel] = useState(false);
  const [showInlineModal, setShowInlineModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  
  // Export functionality
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'jsx'>('json');
  const [copied, setCopied] = useState(false);
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Check for horizontal overflow and update scroll indicators
  const checkForOverflow = () => {
    if (canvasRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = canvasRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };
  
  // Add event listeners for scroll events
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('scroll', checkForOverflow);
      window.addEventListener('resize', checkForOverflow);
      
      // Initial check
      checkForOverflow();
    }
    
    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('scroll', checkForOverflow);
      }
      window.removeEventListener('resize', checkForOverflow);
    };
  }, [components]);

  // Handle click outside for export dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current && 
        !exportDropdownRef.current.contains(event.target as Node) &&
        exportButtonRef.current &&
        !exportButtonRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle scroll button clicks
  const handleScroll = (direction: 'left' | 'right') => {
    if (canvasRef.current) {
      const scrollAmount = 300; // Adjust as needed
      const currentScroll = canvasRef.current.scrollLeft;
      
      canvasRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
    
    // Check for overflow after drop
    setTimeout(checkForOverflow, 100);
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
    
    // Check for overflow after adding component
    setTimeout(checkForOverflow, 100);
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
    
    // Check for overflow after adding inline component
    setTimeout(checkForOverflow, 100);
  };

  // Export functionality handlers
  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  const handleExportOptionClick = (format: 'json' | 'jsx') => {
    setExportFormat(format);
    setShowExportDropdown(false);
    setShowExportModal(true);
  };

  const handleCopyToClipboard = () => {
    const exportContent = exportFormat === 'json' ? exportAsJson() : exportAsJsx();
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const exportContent = exportFormat === 'json' ? exportAsJson() : exportAsJsx();
    const fileName = exportFormat === 'json' ? 'form-schema.json' : 'form-component.jsx';
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getExportContent = () => {
    return exportFormat === 'json' ? exportAsJson() : exportAsJsx();
  };

  // Handle opening AI Chat tab
  const handleOpenAIChat = () => {
    EventBus.publish('SWITCH_TAB', 'aiChat');
  };

  return (
    <div className="p-5 h-full overflow-y-auto bg-[var(--background)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        Form Canvas
      </h2>

        {/* Export Button */}
        <div className="relative" ref={exportButtonRef}>
          <Button
            onClick={toggleExportDropdown}
            className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all px-3 py-2 rounded-md shadow-sm"
            title="Export Form"
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
          
          {/* Export Dropdown */}
          {showExportDropdown && (
            <div 
              ref={exportDropdownRef}
              className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] shadow-lg rounded-md z-50 py-1 animate-fadeIn"
            >
              <button 
                onClick={() => handleExportOptionClick('jsx')}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[var(--secondary)] transition-colors"
              >
                <Code size={16} className="text-[var(--primary)]" />
                <span>Export React Code</span>
              </button>
              <button 
                onClick={() => handleExportOptionClick('json')}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[var(--secondary)] transition-colors"
              >
                <FileCode size={16} className="text-[var(--primary)]" />
                <span>Export JSON Schema</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scroll buttons for horizontal scrolling */}
      <div className="relative">
        {showLeftScroll && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-[var(--card)] border border-[var(--border)] rounded-full p-1 shadow-md hover:bg-[var(--secondary)] transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {showRightScroll && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-[var(--card)] border border-[var(--border)] rounded-full p-1 shadow-md hover:bg-[var(--secondary)] transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}

      <Droppable droppableId="form-canvas" type="COMPONENT_ITEMS" >
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
              ref={(el) => {
                provided.innerRef(el);
                canvasRef.current = el;
              }}
              className={`border-2 w-auto min-w-[100%] border-dashed border-[#545966] rounded-lg min-h-[calc(100vh-10rem)] p-4 relative overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--primary-light)] scrollbar-track-[var(--secondary)] ${
                snapshot.isDraggingOver ? 'bg-[var(--secondary-hover)]' : ''
              }`}
              style={{
                // Add custom scrollbar styling
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--primary-light) var(--secondary)',
              }}
          >
            {components.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-40">
                <div className="mb-4">
                  <Image 
                    src="/dragDrop.svg" 
                    alt="Drag & Drop" 
                    width={120} 
                    height={120} 
                  />
                </div>
                <p className="text-lg mb-2">Drag & drop components here or select from the sidebar</p>
                <p className="text-center text-sm max-w-md opacity-80 mb-5">
                  <span className="flex items-center justify-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Have questions? Need a form quickly?
                  </span>
                  Try using our AI assistant to build your form in seconds!
                </p>
                <Button
                  onClick={handleOpenAIChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition-all text-white font-medium shadow-md hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #3555FF 0%, #8313DB 100%)', border: 'none' }}
                >
                  <MessageSquare size={18} />
                  Build with AI
                </Button>
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
                          className={`flex flex-row gap-4 items-center justify-center rounded-lg relative group ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                            width: 'max-content',
                            minWidth: '100%'
                          }}
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
                                maxWidth: row.length > 1 ? '400px' : '100%',
                              position: 'relative',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              padding: '16px',
                              background: 'var(--card)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s ease',
                            }}
                          >
                              <div className="flex flex-col">
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
                                    className="cursor-pointer text-[var(--destructive)] border border-[var(--destructive)] bg-transparent w-8 h-8 p-1.5 rounded-full flex items-center justify-center hover:bg-[var(--destructive)] hover:text-white transition-all hover:scale-105"
                                    aria-label="Delete component"
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
                                      className="current-stroke"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                      <line x1="10" y1="11" x2="10" y2="17" />
                                      <line x1="14" y1="11" x2="14" y2="17" />
                                    </svg>
                                </Button>
                              </div>
                            </div>

                              <div className="mt-2 py-1 px-3">
                                <div
                                  className="border border-dashed border-[var(--border)] rounded-md w-full h-8 flex justify-center items-center text-[var(--muted-foreground)] text-sm opacity-50"
                                ></div>
                                <div className="p-2 text-center text-xs">
                                  <span className="text-[var(--muted-foreground)]">{component.label}</span>
                                </div>
                              </div>
                          </div>
                        ))}

                          <button
                          onClick={() => openInlineComponentModal(rowIndex)}
                            className="h-8 px-2 py-1 border-2 border-dashed border-[var(--muted-foreground)] rounded mb-4 opacity-30 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]"
                        >
                            <Plus size={14} />
                            <span className="text-xs">Add inline</span>
                          </button>
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
      </div>

      {showInlineModal && (
        <InlineComponentModal
          onClose={() => setShowInlineModal(false)}
          onSelect={handleInlineComponentSelect}
        />
      )}

      {selectedComponentId && <CustomizationModal />}

      {/* Export Code Modal */}
      {showExportModal && (
        <Dialog 
          title={
            <div className="flex items-center justify-between w-full pr-5">
              <div className="flex items-center gap-2">
                {exportFormat === 'json' ? (
                  <FileCode size={20} className="text-[var(--primary)]" />
                ) : (
                  <Code size={20} className="text-[var(--primary)]" />
                )}
                <span className="text-lg font-semibold">
                  {exportFormat === 'json' ? 'JSON Schema' : 'React Component Code'}
                </span>
              </div>
            </div>
          }
          onClose={() => setShowExportModal(false)}
          width={800}
          height="90vh"
          className="k-dialog-lg bg-[var(--background)]"
        >
          <div className="p-4 h-full flex flex-col">
            <div className="mb-4 flex gap-3 justify-end">
              <Button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2 bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] transition-colors px-4 py-2"
              >
                {copied ? <Check size={18} className="text-[var(--success)]" /> : <Copy size={18} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity px-4 py-2"
              >
                <Download size={18} />
                Download
              </Button>
            </div>
            
            <div className="flex-grow overflow-hidden border border-[var(--border)] rounded-lg">
              <pre className="p-4 overflow-auto h-full bg-[var(--card)] text-sm font-mono">
                {getExportContent()}
              </pre>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default FormCanvas; 