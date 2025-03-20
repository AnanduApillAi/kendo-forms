'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { TextArea } from '@progress/kendo-react-inputs';
import { useFormBuilder, ChatMessage, FormComponentProps } from './FormBuilderContext';
import { ChevronUp, ChevronDown, X, MessageSquare, Send, History, CheckCircle2 } from 'lucide-react';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';

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
  const { chatHistory, restoreFormState, components } = useFormBuilder();
  const [isExpanded, setIsExpanded] = useState(true);
  const [newPrompt, setNewPrompt] = useState('');
  const [restoredMessageId, setRestoredMessageId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'warning' | 'error', message: string } | null>(null);
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
          {restorableMessages.length > 0 && (
            <span className="text-xs bg-[var(--accent)] text-[var(--accent-foreground)] px-2 py-0.5 rounded-full">
              {restorableMessages.length} {restorableMessages.length === 1 ? 'version' : 'versions'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          
        </div>
      </div>
      
      {/* Notification area */}
      {notification && (
        <NotificationGroup style={{ position: 'absolute', top: '50px', right: '10px', zIndex: 999 }}>
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
                {chatHistory.map((message, index) => {
                  // Check if this is not the first message and the previous message had a successful result
                  const canRestore = message.result && !!message.formState;
                  const isFirst = index === 0 && message.result;
                  const isCurrent = canRestore && message.formState && isCurrentState(message.formState);
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex flex-col p-2 rounded-lg ${restoredMessageId === message.id ? 'bg-[var(--primary-light)] bg-opacity-20' : ''}`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <div className="bg-[var(--primary-light)] text-[var(--primary)] p-2 rounded-lg text-sm max-w-[80%] relative">
                          <p>{message.prompt}</p>
                        </div>
                      </div>
                      
                      {/* AI Response and Status */}
                      <div className="flex flex-col">
                        <div className="bg-[var(--card)] border border-[var(--border)] p-2 rounded-lg text-sm relative">
                          {message.result ? (
                            <>
                              {message.message ? (
                                <p className="text-[var(--foreground)] text-sm whitespace-pre-line pr-14">{message.message}</p>
                              ) : (
                                <p className="text-[var(--foreground)] text-sm pr-14">Form updated successfully.</p>
                              )}
                              
                              {/* Show restore/current version button inside message */}
                              {canRestore && (
                                <div className="absolute bottom-2 right-2">
                                  {isCurrent ? (
                                    <div className="flex items-center gap-1 text-xs py-1 px-2 bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] rounded-md" title="Current version">
                                      <CheckCircle2 size={12} />
                                      <span className="font-medium">Current</span>
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() => handleRestoreForm(message.id)}
                                      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
                                      style={{ minWidth: 'unset' }}
                                      title="Restore this form state"
                                    >
                                      <History size={12} />
                                      <span>Restore</span>
                                    </Button>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-[var(--destructive)] text-sm">Failed to process your request.</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {formatTimestamp(message.timestamp)}
                        </div>
                        <div className="text-xs">
                          {message.result ? (
                            <span className="text-[var(--success)]">✓ Form updated</span>
                          ) : (
                            <span className="text-[var(--destructive)]">✗ Failed to process</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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