'use client';

import React, { useState, useEffect } from 'react';
import { TextArea } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Notification } from '@progress/kendo-react-notification';
import { useFormBuilder } from './FormBuilderContext';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { Wand, Edit, Plus } from 'lucide-react';

interface AIPromptInputProps {
  onClose: () => void;
  onShowChatHistory?: () => void;
}

const AIPromptInput: React.FC<AIPromptInputProps> = ({ onClose, onShowChatHistory }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { components, setComponents, addChatMessage } = useFormBuilder();
  const [mode, setMode] = useState<'create' | 'update' | null>(null);
  const [selected, setSelected] = useState(0);
  
  const hasExistingForm = components.length > 0;

  useEffect(() => {
    // Set default mode based on existing form
    setMode(hasExistingForm ? null : 'create');
  }, [hasExistingForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !mode) return;

    setIsLoading(true);
    setError(null);
    let url = '/api/ai-form';
    
    try {
      // Call the API endpoint with mode parameter
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          mode,
          existingForm: mode === 'update' ? components : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate form');
        // Add to chat history even if it failed
        addChatMessage(prompt, false);
        return;
      }
      // if(JSON.stringify(data)==JSON.stringify(components)){
      //   addChatMessage(prompt, false);
      //   return;
      // }

      // Add successful prompt to chat history with AI response data
      // This must happen before updating the components to ensure we store the raw AI response
      addChatMessage(prompt, true, data);
      
      // Then update the form components with the response
      setComponents(data);

      // Show chat history panel if this is the first successful prompt
      if (onShowChatHistory) {
        onShowChatHistory();
      }

      // Close the prompt input
      handleClose();
    } catch (error) {
      console.error('Error generating form:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      // Add to chat history with failure status
      addChatMessage(prompt, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleModeSelect = (selectedMode: 'create' | 'update') => {
    setMode(selectedMode);
  };

  return (
    <div
      className={`p-5 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg transition-all duration-300`}
      style={{ maxWidth: '550px', width: '100%' }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold flex items-center gap-2 text-[var(--foreground)]">
          <Wand size={22} className="text-[var(--primary)]" />
          AI Form Builder
        </h3>
        <Button
          onClick={handleClose}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-transparent border-0"
          style={{ minWidth: 'unset', padding: '4px' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>
      </div>

      {hasExistingForm && mode === null && (
        <div className="my-6">
          <p className="text-center text-sm text-[var(--muted-foreground)] mb-4">
            You already have a form. What would you like to do?
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleModeSelect('create')}
              className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-all hover:shadow-md`}
            >
              <div className="bg-[var(--primary-light)] text-[var(--primary)] p-3 rounded-full">
                <Plus size={24} />
              </div>
              <div className="text-center">
                <h4 className="font-medium mb-1">Create New Form</h4>
                <p className="text-xs text-[var(--muted-foreground)]">Replace current form with a new AI-generated one</p>
              </div>
            </button>
            
            <button
              onClick={() => handleModeSelect('update')}
              className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-all hover:shadow-md`}
            >
              <div className="bg-[var(--primary-light)] text-[var(--primary)] p-3 rounded-full">
                <Edit size={24} />
              </div>
              <div className="text-center">
                <h4 className="font-medium mb-1">Update Existing</h4>
                <p className="text-xs text-[var(--muted-foreground)]">Enhance your current form with AI assistance</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {mode !== null && (
        <>
          

          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            {mode === 'create' 
              ? "Describe the form you want to build, and AI will create it for you." 
              : "Describe how you'd like to enhance your current form."}
          </p>

          {error && (
            <div className="mb-4">
              <Notification
                type={{ style: 'error', icon: true }}
                closable={true}
                onClose={() => setError(null)}
              >
                <span>{error}</span>
              </Notification>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <TextArea
                placeholder={mode === 'create' 
                  ? "E.g., Create a contact form with name, email, and message fields..." 
                  : "E.g., Add a phone number field and make the email required..."}
                value={prompt}
                onChange={(e) => setPrompt(e.value as string)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as React.FormEvent);
                  }
                }}
                className="w-full"
                style={{ height: '100px' }}
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-between items-center">
              {hasExistingForm && (
                <Button
                  type="button"
                  onClick={() => setMode(null)}
                  className="text-[var(--muted-foreground)]"
                  style={{ background: 'transparent', border: 'none' }}
                >
                  Back
                </Button>
              )}
              
              <Button
                type="submit"
                themeColor="primary"
                disabled={!prompt.trim() || isLoading}
                className="flex items-center gap-2 ml-auto"
              >
                <div className="flex gap-2 h-6 justify-center items-center">
                  {isLoading ? (
                    <>
                      <span className="k-icon k-i-loading"></span>
                      {mode === 'create' ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      <Wand size={16} />
                      {mode === 'create' ? "Create Form" : "Update Form"}
                    </>
                  )}
                </div>
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default AIPromptInput; 