'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { TextArea } from '@progress/kendo-react-inputs';
import { useFormBuilder, FormComponentProps } from './FormBuilderContext';
import { History, Send, CheckCircle2 } from 'lucide-react';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';

interface AIChatContentProps {
  onSubmitPrompt: (prompt: string) => Promise<void>;
  isSubmitting: boolean;
}

const AIChatContent: React.FC<AIChatContentProps> = ({
  onSubmitPrompt,
  isSubmitting
}) => {
  const { chatHistory, restoreFormState, components } = useFormBuilder();
  const [newPrompt, setNewPrompt] = useState('');
  const [restoredMessageId, setRestoredMessageId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'warning' | 'error', message: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Ensure chat always scrolls to the bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Enable proper scrolling
  useEffect(() => {
    const updateHeight = () => {
      if (chatContainerRef.current && chatContainerRef.current.parentElement) {
        const containerHeight = chatContainerRef.current.parentElement.clientHeight - 74;
        chatContainerRef.current.style.height = `${containerHeight}px`;
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

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

  // Function to check if the current form state matches a message's form state
  const isCurrentState = (messageFormState: FormComponentProps[][]) => {
    // Fast comparison - check if the serialized states match
    return JSON.stringify(components) === JSON.stringify(messageFormState);
  };

  // Handle form restore
  const handleRestoreForm = (messageId: string) => {
    restoreFormState(messageId);
    setRestoredMessageId(messageId);
    setNotification({
      type: 'success',
      message: 'Form state restored successfully'
    });
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Get a list of messages that have valid form states to restore to
  // These will be messages with successful AI responses (result = true and formState exists)
  const restorableMessages = chatHistory.filter(message => 
    message.result === true && !!message.formState
  );

  // Clear the highlighted restored message when a new message is added
  useEffect(() => {
    if (chatHistory.length > 0 && restoredMessageId) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.id !== restoredMessageId) {
        setRestoredMessageId(null);
      }
    }
  }, [chatHistory, restoredMessageId]);

  return (
    <div className="flex flex-col h-[70vh] shadow-sm relative">
      {/* Notification area */}
      {notification && (
        <NotificationGroup style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 999 }}>
          <Notification
            type={{ style: notification.type, icon: true }}
            closable={true}
            onClose={() => setNotification(null)}
          >
            <span>{notification.message}</span>
          </Notification>
        </NotificationGroup>
      )}
      
      {/* Chat History */}
      <div 
        className="flex-grow p-4 pb-[74px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--primary-light)] scrollbar-track-transparent"
        ref={chatContainerRef}
        style={{
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--primary-light) transparent'
        }}
      >
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]">
            <div className="w-14 h-14 mb-3 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[var(--primary)]">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm text-center max-w-md">
              Describe the form you want to build or ask for changes
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {chatHistory.map((message, index) => {
              // Check if this message has a valid form state to restore
              const canRestore = message.result && !!message.formState;
              const isCurrent = canRestore && message.formState && isCurrentState(message.formState);
              
              return (
                <div 
                  key={message.id} 
                  className={`${restoredMessageId === message.id ? 'bg-[var(--primary-light)] bg-opacity-10 p-2 rounded-lg' : ''}`}
                >
                  {/* User Message */}
                  <div className="flex justify-end mb-2.5">
                    <div className="bg-[var(--primary)] text-[var(--primary-foreground)] p-2.5 rounded-lg text-sm max-w-[85%] shadow-sm">
                      <p>{message.prompt}</p>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col w-full">
                      {/* Display AI message with feedback */}
                      <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-lg text-sm shadow-sm max-w-[85%]">
                        {message.result ? (
                          <>
                            {message.message ? (
                              <p className="text-[var(--foreground)] text-sm whitespace-pre-line">{message.message}</p>
                            ) : (
                              <p className="text-[var(--foreground)] text-sm">Form updated successfully.</p>
                            )}
                          </>
                        ) : (
                          <p className="text-[var(--destructive)] text-sm">I couldn't process your request. Please try a different prompt.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Timestamp and restore controls */}
                  <div className="flex justify-between items-center mt-1 ml-1">
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    {canRestore && !isCurrent && (
                      <Button
                        onClick={() => handleRestoreForm(message.id)}
                        className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-sm bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
                        title="Restore this version"
                      >
                        <History size={10} />
                        <span className="text-[10px]">Restore</span>
                      </Button>
                    )}
                    {canRestore && isCurrent && (
                      <div className="flex items-center gap-0.5 text-xs px-2 py-0.5 text-[var(--primary)]">
                        <CheckCircle2 size={10} />
                        <span className="text-[10px] font-medium">Current</span>
                      </div>
                    )}
                  </div>
                  
                </div>
              );
            })}
            <div ref={bottomRef} className="h-2" />
          </div>
        )}
      </div>
      
      {/* Input form - positioned at the bottom with no gap */}
      <form 
        onSubmit={handleSubmitPrompt} 
        className=" bg-[var(--card)] absolute bottom-0 left-0 right-0 w-full"
      >
        <div className="flex items-end gap-2">
          <TextArea
            placeholder="Type a message..."
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.value as string)}
            className="w-full resize-none border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:shadow-sm transition-all"
            style={{ 
              height: '50px', 
              maxHeight: '100px',
              padding: '10px 12px',
              fontSize: '14px'
            }}
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitPrompt(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!newPrompt.trim() || isSubmitting}
            
            className={`rounded-full ${!newPrompt.trim() || isSubmitting ? 'bg-[var(--secondary)]' : 'bg-[var(--primary)]'} text-white hover:opacity-90 transition-opacity`}
            style={{ 
              minWidth: 'unset',
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isSubmitting ? (
              <span className="k-icon k-i-loading"></span>
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIChatContent; 