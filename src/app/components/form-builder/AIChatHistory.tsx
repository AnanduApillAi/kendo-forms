'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { TextArea } from '@progress/kendo-react-inputs';
import { useFormBuilder, ChatMessage } from './FormBuilderContext';
import { ChevronUp, ChevronDown, X, MessageSquare, Send } from 'lucide-react';

interface AIChatHistoryProps {
  onClose: () => void;
  onSubmitPrompt: (prompt: string) => Promise<void>;
  isSubmitting: boolean;
}

const AIChatHistory: React.FC<AIChatHistoryProps> = ({
  onClose,
  onSubmitPrompt,
  isSubmitting
}) => {
  const { chatHistory } = useFormBuilder();
  const [isExpanded, setIsExpanded] = useState(true);
  const [newPrompt, setNewPrompt] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || isSubmitting) return;
    
    try {
      await onSubmitPrompt(newPrompt);
      setNewPrompt('');
      // Scroll to bottom after new message
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error submitting prompt:', error);
    }
  };

  // Format timestamp to a readable format
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  return (
    <div className="fixed bottom-0 right-6 w-80 bg-[var(--card)] border border-[var(--border)] rounded-t-lg shadow-lg z-50 overflow-hidden transition-all duration-300 ease-in-out"
         style={{ height: isExpanded ? '400px' : '48px', maxHeight: '50vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[var(--primary)] text-[var(--primary-foreground)] cursor-pointer"
           onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={18} />
          <h3 className="font-medium">AI Chat History</h3>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-[var(--primary-dark)] transition-colors"
            style={{ background: 'transparent', border: 'none' }}
          >
            <X size={16} color="white" />
          </Button>
        </div>
      </div>
      
      {/* Chat History */}
      {isExpanded && (
        <>
          <div className="p-3 overflow-y-auto" style={{ height: 'calc(100% - 110px)' }}>
            {chatHistory.length === 0 ? (
              <div className="text-center text-[var(--muted-foreground)] my-8">
                <p>No chat history yet</p>
                <p className="text-sm mt-2">Your conversations with AI will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((message, index) => (
                  <div key={message.id} className="flex flex-col">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="bg-[var(--primary-light)] text-[var(--primary)] p-2 rounded-lg text-sm max-w-[90%]">
                        <p>{message.prompt}</p>
                      </div>
                    </div>
                    <div className="self-end text-xs text-[var(--muted-foreground)]">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] self-start">
                      {message.result ? (
                        <span className="text-[var(--success)]">✓ Form updated</span>
                      ) : (
                        <span className="text-[var(--destructive)]">✗ Failed to process</span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSubmitPrompt} className="p-3 border-t border-[var(--border)] bg-[var(--background)]">
            <div className="flex items-end gap-2">
              <TextArea
                placeholder="Send a follow-up prompt..."
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.value as string)}
                className="w-full resize-none"
                style={{ height: '40px', maxHeight: '100px' }}
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={!newPrompt.trim() || isSubmitting}
                className="p-2 rounded-full bg-[var(--primary)] text-white"
                style={{ minWidth: 'unset', width: '36px', height: '36px' }}
              >
                {isSubmitting ? (
                  <span className="k-icon k-i-loading"></span>
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default AIChatHistory; 