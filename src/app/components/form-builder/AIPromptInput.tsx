'use client';

import React, { useState, useEffect } from 'react';
import { TextArea } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Notification } from '@progress/kendo-react-notification';
import { useFormBuilder } from './FormBuilderContext';

interface AIPromptInputProps {
  onClose: () => void;
}

const AIPromptInput: React.FC<AIPromptInputProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setComponents } = useFormBuilder();

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call the API endpoint
      const response = await fetch('/api/ai-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate form');
        return;
      }

      // Update the form components with the response
      setComponents(data);

      // Close the prompt input
      handleClose();
    } catch (error) {
      console.error('Error generating form:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Delay the actual closing to allow for animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-md transition-all duration-300 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
        }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-[var(--primary)]"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
          </svg>
          AI Form Builder
        </h3>
        <Button
          onClick={handleClose}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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

      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Describe the form you want to build, and AI will help create it for you.
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
            placeholder="E.g., Create a contact form with name, email, and message fields..."
            value={prompt}
            onChange={(e) => setPrompt(e.value as string)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as React.FormEvent);
              }
            }}
            className="w-full"
            style={{ height: '80px' }}
            autoFocus
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            themeColor="primary"
            disabled={!prompt.trim() || isLoading}
            className="flex items-center gap-2 "
          >
            <div className="flex gap-2 h-6 justify-center items-center">
              {isLoading ? (
                <>
                  <span className="k-icon k-i-loading"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M22 2 11 13" />
                    <path d="m22 2-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Generate Form
                </>
              )}
            </div>

          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIPromptInput; 