'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { getAllForms, deleteForm, FormCollection } from '../utils/indexedDB';
import { ArrowLeft, Trash, Copy, Code, Edit, Eye, Download, Calendar, Clock } from 'lucide-react';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { ThemeToggle } from '../components/ThemeToggle';
import { Label } from '@progress/kendo-react-labels';


const CollectionsPage: React.FC = () => {
  const router = useRouter();
  const [forms, setForms] = useState<FormCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormCollection | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formToDelete, setFormToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const formsData = await getAllForms();
      setForms(formsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load forms:', err);
      setError('Failed to load forms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setFormToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteForm = async () => {
    if (formToDelete !== null) {
      try {
        await deleteForm(formToDelete);
        await loadForms(); // Reload the forms after deletion
        setNotification({
          message: 'Form deleted successfully',
          type: 'success'
        });
      } catch (err) {
        console.error('Failed to delete form:', err);
        setNotification({
          message: 'Failed to delete form',
          type: 'error'
        });
      } finally {
        setShowDeleteConfirm(false);
        setFormToDelete(null);
      }
    }
  };

  const handleEditForm = (form: FormCollection) => {
    // Store the form state in localStorage to be loaded by the form builder
    localStorage.setItem('editFormState', JSON.stringify(form.formState));
    localStorage.setItem('editFormId', form.id?.toString() || '');
    localStorage.setItem('editFormName', form.name || '');
    localStorage.setItem('editFormDescription', form.description || '');
    router.push('/');
  };

  const handlePreviewClick = (form: FormCollection) => {
    setSelectedForm(form);
    setShowPreviewModal(true);
  };

  const handleCopyCode = (form: FormCollection) => {
    // Generate JSX or JSON code for the form and copy to clipboard
    const jsonString = JSON.stringify(form.formState, null, 2);
    navigator.clipboard.writeText(jsonString);
    setNotification({
      message: 'Form code copied to clipboard',
      type: 'success'
    });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Format date for better display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Count the number of components in a form
  const countComponents = (formState: any[]) => {
    return formState.reduce((count, row) => count + row.length, 0);
  };

  // Memoize the form cards
  const formCards = useMemo(() => {
    return forms.map((form) => (
      <div
        key={form.id}
        className="border border-[var(--border)] rounded-lg shadow-sm bg-[var(--card)] overflow-hidden hover:shadow-md transition-all duration-300 group hover:border-[var(--primary-light)] hover:translate-y-[-2px]"
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)] group-hover:text-[var(--primary)]">{form.name}</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-5 line-clamp-2 min-h-[40px]">
            {form.description || 'No description provided'}
          </p>

          <div className="flex flex-col gap-3 text-sm mb-6">
            <div className="flex items-center text-[var(--muted-foreground)]">
              <Calendar size={14} className="mr-2 text-[var(--primary-light)]" />
              <span>Created: {formatDate(form.dateCreated)}</span>
            </div>
            <div className="flex items-center text-[var(--muted-foreground)]">
              <Clock size={14} className="mr-2 text-[var(--primary-light)]" />
              <span>Modified: {formatDate(form.dateModified)}</span>
            </div>
            <div className="flex items-center text-[var(--muted-foreground)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[var(--primary-light)]">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span>Components: {countComponents(form.formState)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleEditForm(form)}
              className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] py-2 rounded-md text-sm hover:bg-opacity-90 transition-all shadow-sm hover:shadow"
            >
              <div className="flex items-center gap-2">
                <Edit size={14} />
                <span>Edit</span>
              </div>
            </Button>

            <Button
              onClick={() => handlePreviewClick(form)}
              className="flex items-center justify-center gap-2 bg-[var(--secondary)] text-[var(--foreground)] py-2 rounded-md text-sm hover:bg-[var(--secondary-hover)] transition-all shadow-sm hover:shadow"
            >
              <div className="flex items-center gap-2">
                <Eye size={14} />
                <span>Preview</span>
              </div>
            </Button>

            <Button
              onClick={() => handleCopyCode(form)}
              className="flex items-center justify-center gap-2 bg-[var(--accent-subtle)] text-[var(--accent)] py-2 rounded-md text-sm hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all shadow-sm hover:shadow"
            > 
              <div className="flex items-center gap-2">
                <Copy size={14} />
                <span>Copy Code</span>
              </div>
            </Button>

            <Button
              onClick={() => form.id && handleDeleteClick(form.id)}
              className="flex items-center justify-center gap-2 bg-transparent text-[var(--destructive)] border border-[var(--destructive)] border-opacity-30 py-2 rounded-md text-sm hover:bg-[var(--destructive)] hover:text-white hover:border-opacity-100 transition-colors shadow-sm hover:shadow"
            >
              <div className="flex items-center gap-2">
                <Trash size={14} />
                <span>Delete</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    ));
  }, [forms]); // Only re-render when forms array changes

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--header-bg)] border-b border-[var(--header-border)] px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Form Collections</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Notification */}
      {notification && (
        <NotificationGroup
          style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}
        >
          <Notification
            type={{ style: notification.type, icon: true }}
            closable={true}
            onClose={() => setNotification(null)}
          >
            <span>{notification.message}</span>
          </Notification>
        </NotificationGroup>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-8 py-10 max-w-6xl">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">Your Saved Forms</h2>
          <p className="text-[var(--muted-foreground)] max-w-2xl">
            All your saved forms are listed here. You can edit, preview, or add them to the builder.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-[var(--primary)] border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
            <span className="ml-4 text-lg font-medium text-[var(--muted-foreground)]">Loading forms...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-2">Error</h3>
            <p>{error}</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-lg bg-[var(--card)] shadow-sm">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium mb-3 text-[var(--foreground)]">No forms saved yet</h3>
            <p className="mt-2 text-[var(--muted-foreground)] max-w-md mx-auto mb-8">
              Save your forms from the builder to see them here. Create beautiful forms with our drag-and-drop builder.
            </p>
            <Link href="/" passHref>
              <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-md text-lg font-medium hover:bg-[var(--primary-hover)] transition-all shadow-md">
                <div className="flex items-center gap-2">
                  <ArrowLeft size={18} />
                  <span>Go to Form Builder</span>
                </div>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formCards}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog
          title="Confirm Delete"
          onClose={() => setShowDeleteConfirm(false)}
          width={400}
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4 text-[var(--destructive)]">
              <Trash size={22} />
              <h3 className="font-medium text-lg">Delete Form</h3>
            </div>
            <p className="text-[var(--muted-foreground)] mb-2">Are you sure you want to delete this form? This action cannot be undone.</p>
          </div>
          <DialogActionsBar>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-[var(--secondary)] text-[var(--foreground)] px-4 py-2 hover:bg-[var(--secondary-hover)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteForm}
              className="bg-[var(--destructive)] text-white px-4 py-2 hover:opacity-90"
            >
              Delete
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedForm && (
        <Dialog
          title={
            <span className="text-lg font-semibold flex items-center">
              <Eye size={18} className="mr-2 text-[var(--primary)]" /> 
              Preview: {selectedForm.name}
            </span>
          }
          onClose={() => setShowPreviewModal(false)}
          width={800}
        >
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-5 border border-[var(--border)] rounded-lg p-6 bg-[var(--card)] shadow-inner">
              {/* Render basic form preview */}
              {selectedForm.formState.map((row: any, rowIndex: number) => (
                <div key={rowIndex} className="flex gap-4">
                  {row.map((component: any) => (
                    <div key={component.id} className="w-full">
                      {component.showLabel !== false && (
                        <Label className="block text-sm font-medium mb-1.5">
                          {component.label}
                          {component.required && <span className="text-[var(--destructive)] ml-1">*</span>}
                        </Label>
                      )}
                      <div 
                        className="border border-[var(--border)] rounded-md p-3.5 text-sm bg-[var(--input)] shadow-sm"
                        style={{ 
                          height: component.type === 'textarea' ? '80px' : 'auto',
                          minHeight: '38px'
                        }}
                      >
                        {component.placeholder || component.type}
                        {component.type === 'checkbox' && (
                          <div className="w-4 h-4 border border-[var(--border)] rounded mr-2 inline-block align-middle"></div>
                        )}
                        {component.type === 'radio' && component.options && (
                          <div className="flex flex-col gap-2 mt-2">
                            {component.options.map((option: any, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-[var(--border)]"></div>
                                <span>{option.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {component.type === 'dropdown' && component.options && (
                          <div className="flex justify-between items-center">
                            <span>Select an option</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <DialogActionsBar>
            <Button
              onClick={() => setShowPreviewModal(false)}
              className="bg-[var(--secondary)] text-[var(--foreground)] px-4 py-2 hover:bg-[var(--secondary-hover)]"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleEditForm(selectedForm);
                setShowPreviewModal(false);
              }}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 hover:bg-[var(--primary-hover)]"
            >
              <div className="flex items-center gap-2">
                <Edit size={14} />
                <span>Edit in Builder</span>
              </div>
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </div>
  );
};

export default CollectionsPage; 