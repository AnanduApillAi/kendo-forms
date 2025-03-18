'use client';

import React from 'react';
import { FormBuilderProvider } from './FormBuilderContext';
import ComponentSelectionPanel from './ComponentSelectionPanel';
import FormCanvas from './FormCanvas';
import PreviewExportPanel from './PreviewExportPanel';
import { ThemeToggle } from '../ThemeToggle';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { useFormBuilder } from './FormBuilderContext';
const FormBuilderContent: React.FC = () => {
  const { moveFormItem , addFormItemAtPosition} = useFormBuilder();
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // If there's no destination, the item was dropped outside the droppable areas
    if (!destination) return;
    
    // Check if dragging from component panel to canvas
    if (source.droppableId === 'component-panel' && destination.droppableId === 'form-canvas') {
      // Use the draggableId directly as the component type
      const componentType = result.draggableId;
      addFormItemAtPosition(componentType, destination.index);
    }
    
    // Check if reordering within the form canvas
    if (source.droppableId === 'form-canvas' && destination.droppableId === 'form-canvas') {
      moveFormItem(source.index, destination.index);
    }
  };


  return (

      <div className="form-builder-container h-screen flex flex-col overflow-scroll">

          <header className="bg-[var(--header-bg)] border-b border-[var(--header-border)] p-4 shadow-sm flex justify-between items-center sticky top-0 z-50 w-full min-w-[70rem]">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-[var(--primary)]"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="10" y1="13" x2="14" y2="13"></line>
                <line x1="10" y1="17" x2="14" y2="17"></line>
                <line x1="10" y1="9" x2="10" y2="9.01"></line>
              </svg>
              <h1 className="text-2xl font-bold">Form Builder</h1>
            </div>
            <ThemeToggle />
          </header>


        <div className="flex-1 flex min-w-[70rem]">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="w-1/4 min-w-[150px] max-w-[250px] component-panel">
            <ComponentSelectionPanel />
          </div>
          
          <div className="flex-1 w-full overflow-scroll">
            <FormCanvas/>
          </div>
          </DragDropContext>
          
          <div className="w-1/3 min-w-[300px] max-w-[650px] preview-export-panel">
            <PreviewExportPanel />
          </div>
        </div>
      </div>
  );
};

const FormBuilder = () => {
  return (
    <FormBuilderProvider>
      <FormBuilderContent />
    </FormBuilderProvider>
  );
};

export default FormBuilder; 