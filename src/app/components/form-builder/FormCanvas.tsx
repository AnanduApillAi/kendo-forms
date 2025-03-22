'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFormBuilder, FormComponentProps } from './FormBuilderContext';
import { Button } from '@progress/kendo-react-buttons';
import { v4 as uuidv4 } from 'uuid';
import InlineComponentModal from './InlineComponentModal';
import CustomizationModal from './CustomizationModal';
import { Plus, Edit, Trash, GripVertical, Upload, ChevronLeft, ChevronRight, Download, FileCode, Code, Copy, Check, MessageSquare, Save } from 'lucide-react'
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import Image from 'next/image';
import { EventBus } from './ComponentSelectionPanel';
import { Input, TextArea } from '@progress/kendo-react-inputs';
import { saveForm } from '../../utils/indexedDB';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';

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

  // Save functionality
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [saveToast, setSaveToast] = useState({ visible: false, message: '' });

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
      className += " opacity-50";
    } else {
      className += " opacity-100";
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

  // Handle save form to collection
  const handleSaveForm = async () => {
    if (!formName.trim()) {
      setSaveToast({
        visible: true,
        message: 'Please provide a form name'
      });
      return;
    }

    try {
      // Check for existing form ID from either localStorage or previous save
      const existingFormId = localStorage.getItem('editFormId') || localStorage.getItem('currentFormId');
      const formData = {
        ...(existingFormId ? { id: parseInt(existingFormId) } : {}),
        name: formName,
        description: formDescription,
        formState: components,
        dateCreated: existingFormId ? new Date(localStorage.getItem('dateCreated') || new Date().toISOString()) : new Date(),
        dateModified: new Date()
      };

      const savedForm = await saveForm(formData);
      
      // If this is a new form, store its ID for future saves
      if (!existingFormId && savedForm?.id) {
        localStorage.setItem('currentFormId', savedForm.id.toString());
        localStorage.setItem('dateCreated', new Date().toISOString());
      }

      // Only clear edit-related data if we were editing an existing form
      if (localStorage.getItem('editFormId')) {
        localStorage.removeItem('editFormId');
        localStorage.removeItem('editFormState');
        localStorage.removeItem('editFormName');
        localStorage.removeItem('editFormDescription');
        localStorage.removeItem('dateCreated');
      }

      setShowSaveModal(false);
      setSaveToast({
        visible: true,
        message: existingFormId ? 'Form updated successfully!' : 'Form saved to collection successfully!'
      });
      setFormName('');
      setFormDescription('');
    } catch (error) {
      console.error('Error saving form:', error);
      setSaveToast({
        visible: true,
        message: 'Failed to save form. Please try again.'
      });
    }
  };

  // Set initial form name and description from localStorage if editing
  useEffect(() => {
    const editFormName = localStorage.getItem('editFormName');
    const editFormDescription = localStorage.getItem('editFormDescription');
    if (editFormName) setFormName(editFormName);
    if (editFormDescription) setFormDescription(editFormDescription);
  }, []);

  // Hide the toast after 3 seconds
  useEffect(() => {
    if (saveToast.visible) {
      const timeout = setTimeout(() => {
        setSaveToast({ visible: false, message: '' });
      }, 300000);
      
      return () => clearTimeout(timeout);
    }
  }, [saveToast.visible]);

  return (
    <div className="p-5 h-full overflow-y-auto bg-[var(--background)]">
      {/* Notification */}
      {saveToast.visible && (
        <div className="fixed bottom-[5rem] left-1/2 transform -translate-x-1/2 z-50 ">
          <NotificationGroup>
            <Notification
              type={{ style: 'success', icon: true }}
              closable={true}
              onClose={() => setSaveToast({ visible: false, message: '' })}
            >
              <div className="py-2 px-4">{saveToast.message}</div>
            </Notification>
          </NotificationGroup>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        Form Canvas
      </h2>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center">
          {/* Save Button */}
          <Button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 bg-[var(--success)] text-white hover:opacity-90 transition-all px-3 py-2 rounded-md shadow-sm"
            title="Save Form"
          >
            <div className="flex items-center gap-2">
              <Save size={16} />
              <span>Save</span>
            </div>
          </Button>

        {/* Export Button */}
        <div className="relative" ref={exportButtonRef}>
          <Button
            onClick={toggleExportDropdown}
            className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all px-3 py-2 rounded-md shadow-sm"
            title="Export Form"
          >
              <div className="flex items-center gap-2">
            <Download size={16} />
            <span>Export</span>
              </div>
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
                  <div className="flex items-center gap-2">
                <Code size={16} className="text-[var(--primary)]" />
                <span>Export React Code</span>
                  </div>
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
      </div>

      {/* Save Form Modal */}
      {showSaveModal && (
        <Dialog
          title="Save Form to Collection"
          onClose={() => setShowSaveModal(false)}
          width={500}
        >
          <div className="p-5">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Form Name *</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.value as string)}
                placeholder="Enter form name"
                className="w-full"
                required
              />
      </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <TextArea
                value={formDescription}
                onChange={(e) => setFormDescription(e.value as string)}
                placeholder="Enter form description (optional)"
                className="w-full"
                rows={4}
              />
            </div>
          </div>

          <DialogActionsBar>
            <Button
              onClick={() => setShowSaveModal(false)}
              className="bg-[var(--secondary)] text-[var(--foreground)] px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveForm}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2"
              disabled={!formName.trim()}
            >
              Save to Collection
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}

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
              className={`border-2 w-auto min-w-[100%] border-dashed border-[#545966] rounded-lg min-h-[calc(100vh-10rem)] p-4 relative overflow-auto scrollbar-thin scrollbar-thumb-[var(--primary-light)] scrollbar-track-[var(--secondary)] ${snapshot.isDraggingOver ? 'bg-[var(--secondary)]' : ''}`}
              style={{
                // Add custom scrollbar styling
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--primary-light) var(--secondary)',
                maxHeight: 'calc(100vh - 10rem)',
                overflowY: 'auto'
              }}
          >
            {components.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-12">
                <div className="mb-4">
                  <Image 
                    src="/dragDrop.svg" 
                    alt="Drag & Drop" 
                    width={120} 
                    height={120} 
                  />
                </div>
                <p className="text-lg mb-2">Drag & drop components here or select from the sidebar</p>
                  <div className="text-center text-sm max-w-md opacity-80 mb-5 flex gap-2 mt-8">
                  <span className="flex items-center justify-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                      Need a form quickly?
                  </span>
                <Button
                  onClick={handleOpenAIChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition-all text-white font-medium shadow-md hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #3555FF 0%, #8313DB 100%)', border: 'none' }}
                >
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                          <path d="M20 13.5C20.0019 13.8058 19.909 14.1047 19.7341 14.3555C19.5591 14.6063 19.3107 14.7968 19.0231 14.9006L14.1875 16.6875L12.4062 21.5269C12.3008 21.8134 12.1099 22.0608 11.8595 22.2355C11.609 22.4101 11.311 22.5038 11.0056 22.5038C10.7003 22.5038 10.4022 22.4101 10.1518 22.2355C9.90133 22.0608 9.71048 21.8134 9.605 21.5269L7.8125 16.6875L2.97312 14.9062C2.68656 14.8008 2.43924 14.6099 2.26455 14.3595C2.08985 14.109 1.99619 13.811 1.99619 13.5056C1.99619 13.2003 2.08985 12.9022 2.26455 12.6518C2.43924 12.4013 2.68656 12.2105 2.97312 12.105L7.8125 10.3125L9.59375 5.47312C9.69923 5.18656 9.89008 4.93924 10.1405 4.76455C10.391 4.58985 10.689 4.49619 10.9944 4.49619C11.2997 4.49619 11.5978 4.58985 11.8482 4.76455C12.0987 4.93924 12.2895 5.18656 12.395 5.47312L14.1875 10.3125L19.0269 12.0938C19.3147 12.1986 19.5629 12.3901 19.7372 12.642C19.9115 12.8939 20.0033 13.1937 20 13.5ZM14.75 4.5H16.25V6C16.25 6.19891 16.329 6.38968 16.4697 6.53033C16.6103 6.67098 16.8011 6.75 17 6.75C17.1989 6.75 17.3897 6.67098 17.5303 6.53033C17.671 6.38968 17.75 6.19891 17.75 6V4.5H19.25C19.4489 4.5 19.6397 4.42098 19.7803 4.28033C19.921 4.13968 20 3.94891 20 3.75C20 3.55109 19.921 3.36032 19.7803 3.21967C19.6397 3.07902 19.4489 3 19.25 3H17.75V1.5C17.75 1.30109 17.671 1.11032 17.5303 0.96967C17.3897 0.829018 17.1989 0.75 17 0.75C16.8011 0.75 16.6103 0.829018 16.4697 0.96967C16.329 1.11032 16.25 1.30109 16.25 1.5V3H14.75C14.5511 3 14.3603 3.07902 14.2197 3.21967C14.079 3.36032 14 3.55109 14 3.75C14 3.94891 14.079 4.13968 14.2197 4.28033C14.3603 4.42098 14.5511 4.5 14.75 4.5ZM23 7.5H22.25V6.75C22.25 6.55109 22.171 6.36032 22.0303 6.21967C21.8897 6.07902 21.6989 6 21.5 6C21.3011 6 21.1103 6.07902 20.9697 6.21967C20.829 6.36032 20.75 6.55109 20.75 6.75V7.5H20C19.8011 7.5 19.6103 7.57902 19.4697 7.71967C19.329 7.86032 19.25 8.05109 19.25 8.25C19.25 8.44891 19.329 8.63968 19.4697 8.78033C19.6103 8.92098 19.8011 9 20 9H20.75V9.75C20.75 9.94891 20.829 10.1397 20.9697 10.2803C21.1103 10.421 21.3011 10.5 21.5 10.5C21.6989 10.5 21.8897 10.421 22.0303 10.2803C22.171 10.1397 22.25 9.94891 22.25 9.75V9H23C23.1989 9 23.3897 8.92098 23.5303 8.78033C23.671 8.63968 23.75 8.44891 23.75 8.25C23.75 8.05109 23.671 7.86032 23.5303 7.71967C23.3897 7.57902 23.1989 7.5 23 7.5Z" fill="white" />
                        </svg>
                  Build with AI
                      </div>
                </Button>
                  </div>

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
                          className={`flex flex-row gap-4 items-center justify-start rounded-lg relative group ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                            width: snapshot.isDragging ? 'fit-content' : 'max-content',
                            maxWidth: '100%',
                            minWidth: snapshot.isDragging ? 'auto' : '100%',
                            paddingLeft: '20px'
                          }}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="p-1 select-none text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4 absolute left-0 cursor-grab active:cursor-grabbing"
                          >
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
                              <div className="flex justify-between">
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

                              

                              {/* Arrow navigation positioned at bottom border */}
                              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                                {colIndex > 0 && (
                                  <Button
                                    onClick={() => reorderInlineComponents(rowIndex, colIndex, colIndex - 1)}
                                    className="cursor-pointer rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] p-1 w-6 h-6 flex items-center justify-center hover:bg-[var(--secondary-hover)] transition-all"
                                    aria-label="Move component left"
                                  >
                                    <ChevronLeft size={14} />
                                  </Button>
                                )}

                                {colIndex < row.length - 1 && (
                                  <Button
                                    onClick={() => reorderInlineComponents(rowIndex, colIndex, colIndex + 1)}
                                    className="cursor-pointer rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] p-1 w-6 h-6 flex items-center justify-center hover:bg-[var(--secondary-hover)] transition-all"
                                    aria-label="Move component right"
                                  >
                                    <ChevronRight size={14} />
                                  </Button>
                                )}
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
                <div className="flex items-center gap-2">
                {copied ? <Check size={18} className="text-[var(--success)]" /> : <Copy size={18} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
                </div>
              </Button>
              
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity px-4 py-2"
              >
                <div className="flex items-center gap-2">
                <Download size={18} />
                Download
                </div>
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