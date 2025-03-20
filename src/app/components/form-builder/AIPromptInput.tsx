'use client';

import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { TextArea } from '@progress/kendo-react-inputs';
import { Notification } from '@progress/kendo-react-notification';
import { useFormBuilder } from './FormBuilderContext';
import { Wand, Edit, Plus, MessageSquare } from 'lucide-react';

interface AIPromptInputProps {
  onClose: () => void;
  onShowChatHistory: () => void;
}

const AIPromptInput: React.FC<AIPromptInputProps> = ({ onClose, onShowChatHistory }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { components, setComponents, addChatMessage, chatHistory } = useFormBuilder();
  const [mode, setMode] = useState<'create' | 'update' | null>(null);
  const [selected, setSelected] = useState(0);
  
  const hasExistingForm = components.length > 0;
  
  const handleClose = () => {
    onClose();
  };
  
  const handleModeSelect = (selectedMode: 'create' | 'update') => {
    setMode(selectedMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API endpoint
      const response = await fetch('/api/ai-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          mode: mode,
          existingForm: mode === 'update' ? components : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate form');
        addChatMessage(prompt, false);
        return;
      }

      const data = await response.json();
      
      // Update the form components with the response
      setComponents(data);
      
      // Record success in chat history
      addChatMessage(prompt, true, data);
      
      // Close the prompt dialog
      onClose();
    } catch (error) {
      console.error('Error generating form:', error);
      setError('An unexpected error occurred');
      // Record failure in chat history
      addChatMessage(prompt, false);
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center gap-2">
          {/* Updated Chat History button with tooltip indicating it navigates to the AI Chat tab */}
          {chatHistory.length > 0 && (
            <Button
              onClick={onShowChatHistory}
              className="flex items-center gap-1 text-[var(--primary)] bg-[var(--primary-light)] p-1.5 px-3 rounded-md hover:bg-[var(--primary)] hover:text-white transition-colors"
              style={{ minWidth: 'unset', border: 'none' }}
              title="View chat history in the AI Chat tab"
            >
              <MessageSquare size={16} />
              <span className="text-sm">History</span>
            </Button>
          )}
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