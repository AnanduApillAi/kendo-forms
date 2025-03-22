'use client';

import React, { useState, useEffect } from 'react';
import { FormBuilderProvider } from './FormBuilderContext';
import ComponentSelectionPanel from './ComponentSelectionPanel';
import FormCanvas from './FormCanvas';
import PreviewExportPanel from './PreviewExportPanel';
import { ThemeToggle } from '../ThemeToggle';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { useFormBuilder } from './FormBuilderContext';
import { Button } from '@progress/kendo-react-buttons';
import Link from 'next/link';

const FormBuilderContent: React.FC = () => {
  const { moveFormItem, addFormItemAtPosition, hasChatHistory, addChatMessage, setComponents } = useFormBuilder();
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [isAIPromptSubmitting, setIsAIPromptSubmitting] = useState(false);

  useEffect(() => {
    // Show chat history panel when chat history exists
    if (hasChatHistory && !showChatHistory) {
      setShowChatHistory(true);
    }
  }, [hasChatHistory, showChatHistory]);

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
          
          <h1 className="text-2xl font-bold">Form Builder</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/collections" passHref>
            <Button
              className="flex items-center gap-2 bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] transition-colors px-3 py-4 rounded-md"
              title="Form Collections"
            >
              <div className='flex gap-2 justify-center items-center'>
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
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Collections</span>
              </div>

            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex min-w-[70rem] overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="w-1/4 min-w-[150px] max-w-[250px] component-panel">
            <ComponentSelectionPanel />
          </div>

          <div className="flex-1 w-full overflow-auto">
            <FormCanvas />
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