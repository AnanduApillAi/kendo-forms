'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Checkbox, RadioGroup } from '@progress/kendo-react-inputs';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';
import { Dialog } from '@progress/kendo-react-dialogs';
import { useFormBuilder } from './FormBuilderContext';
import { Download, Clipboard, Check, Maximize2, Minimize2 } from 'lucide-react';

const PreviewExportPanel: React.FC = () => {
  const { components, exportAsJson, exportAsJsx } = useFormBuilder();
  const [selected, setSelected] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'json' | 'jsx'>('json');
  const [copied, setCopied] = useState<boolean>(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState<boolean>(false);
  
  // Track form values for all components
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showNotification, setShowNotification] = useState<boolean>(false);

  // Initialize form values when components change
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    
    components.forEach(row => {
      row.forEach(component => {
        switch (component.type) {
          case 'textField':
          case 'email':
          case 'textarea':
          case 'number':
            initialValues[component.id] = '';
            break;
          case 'checkbox':
            initialValues[component.id] = false;
            break;
          case 'radio':
          case 'dropdown':
            initialValues[component.id] = component.options && component.options.length > 0 
              ? component.options[0].value 
              : '';
            break;
        }
      });
    });
    
    setFormValues(initialValues);
  }, [components]);

  // Update a specific form value
  const updateFormValue = (id: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelect = (e: any) => {
    setSelected(e.selected);
  };

  const handleCopyToClipboard = () => {
    const exportContent = exportFormat === 'json' ? exportAsJson() : exportAsJsx();
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const exportContent = exportFormat === 'json' ? exportAsJson() : exportAsJsx();
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFormat === 'json' ? 'form-schema.json' : 'form-component.jsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle fullscreen preview
  const toggleFullscreenPreview = () => {
    setShowFullscreenPreview(!showFullscreenPreview);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate required fields
    const errors: Record<string, string> = {};
    let hasErrors = false;
    
    components.forEach(row => {
      row.forEach(component => {
        if (component.required) {
          const value = formValues[component.id];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[component.id] = 'This field is required';
            hasErrors = true;
          }
        }
      });
    });
    
    setFormErrors(errors);
    
    // Only show notification if there are no errors
    if (!hasErrors) {
      setShowNotification(true);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
  };

  const renderPreviewComponent = (component: any) => {
    const { id, type, label, name, className, placeholder, required, options } = component;
    const value = formValues[id];
    const hasError = formErrors[id] !== undefined;
    
    const errorId = `${id}-error`;
    const commonProps = {
      valid: !hasError,
      validationMessage: formErrors[id],
      id: id,
      ariaDescribedBy: hasError ? errorId : undefined
    };

    switch (type) {
      case 'textField':
        return (
          <div className="k-form-field">
            <Input
              value={value}
              onChange={(e) => updateFormValue(id, e.value)}
              placeholder={placeholder}
              style={{width: '100%'}}
              name={name}
              className={className}
              {...commonProps}
            />
            {hasError && (
              <div className="k-form-error" id={errorId}>
                <span className="text-[var(--destructive)] text-sm">{formErrors[id]}</span>
              </div>
            )}
          </div>
        );
      case 'email':
        return (
          <div className="k-form-field">
            <Input
              type="email"
              value={value}
              onChange={(e) => updateFormValue(id, e.value)}
              placeholder={placeholder}
              style={{width: '100%'}}
              name={name}
              className={className}
              {...commonProps}
            />
            {hasError && (
              <div className="k-form-error" id={errorId}>
                <span className="text-[var(--destructive)] text-sm">{formErrors[id]}</span>
              </div>
            )}
          </div>
        );
      case 'number':
        return (
          <div className="k-form-field">
            <Input
              type="number"
              value={value}
              onChange={(e) => updateFormValue(id, e.value)}
              placeholder={placeholder}
              style={{width: '100%'}}
              name={name}
              className={className}
              {...commonProps}
            />
            {hasError && (
              <div className="k-form-error" id={errorId}>
                <span className="text-[var(--destructive)] text-sm">{formErrors[id]}</span>
              </div>
            )}
          </div>
        );
      case 'checkbox':
        return (
          <div className="k-form-field">
            <Checkbox
              label={label}
              checked={value}
              onChange={(e) => updateFormValue(id, e.value)}
              style={{width: '100%'}}
              name={name}
              className={className}
              {...commonProps}
            />
            {hasError && (
              <div className="k-form-error" id={errorId}>
                <span className="text-[var(--destructive)] text-sm">{formErrors[id]}</span>
              </div>
            )}
          </div>
        );
      case 'radio':
        return (
          <div className="k-form-field">
            <RadioGroup
              data={options || []}
              value={value}
              onChange={(e) => updateFormValue(id, e.value)}
              style={{width: '100%'}}
              name={name}
              className={className}
              {...commonProps}
            />
            {hasError && (
              <div className="k-form-error" id={errorId}>
                <span className="text-[var(--destructive)] text-sm">{formErrors[id]}</span>
              </div>
            )}
          </div>
        );
      case 'dropdown':
        return (
          <div className="k-form-field">
            <DropDownList
              data={options?.map((o: any) => o.value) || []}
              value={value}
              onChange={(e) => updateFormValue(id, e.value)}
              style={{width: '100%'}}
              name={name}
              className={className}
              {...commonProps}
            />
            {hasError && (
              <div className="k-form-error" id={errorId}>
                <span className="text-[var(--destructive)] text-sm">{formErrors[id]}</span>
              </div>
            )}
          </div>
        );
      case 'textarea':
        return (
          <div className="k-form-field">
            <Input
              type="textarea"
              value={value}
              onChange={(e) => updateFormValue(id, e.value)}
              placeholder={placeholder}
              style={{width: '100%', minHeight: '80px'}}
              name={name}
              className={className}
              {...commonProps}
            />
            {hasError && (
              <div className="k-form-error" id={errorId}>
                <span className="text-[var(--destructive)] text-sm">{formErrors[id]}</span>
              </div>
            )}
          </div>
        );
      case 'button':
        return (
          <div className="k-form-field">
            <div 
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px 16px' }}
            >
              {label}
            </div>
            {hasError && (
              <div className="k-form-error" id={errorId}>
                <span className="text-[var(--destructive)] text-sm">{formErrors[id]}</span>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Filter out empty values for display
  const getDisplayValues = () => {
    const displayValues: Record<string, any> = {};
    
    // Find component labels to use as keys
    components.forEach(row => {
      row.forEach(component => {
        if (component.id in formValues && formValues[component.id] !== '') {
          const displayKey = component.name || component.label || component.id;
          displayValues[displayKey] = formValues[component.id];
        }
      });
    });
    
    return displayValues;
  };

  // Render the form preview content
  const renderFormPreview = (isFullscreen = false) => {
    if (components.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-[var(--muted-foreground)] mb-3">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <p className="text-[var(--muted-foreground)] text-center">Add components to see preview</p>
        </div>
      );
    }

    return (
      <div className={`space-y-5 p-5 border border-[var(--border)] rounded-lg bg-[var(--background)] ${isFullscreen ? '' : 'shadow-sm'}`}>
        {components.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {row.map((component) => (
              <div key={component.id} className="mb-4 w-full">
                {component.showLabel !== false && (
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    {component.label}
                    {component.required && <span className="text-[var(--destructive)] ml-1">*</span>}
                  </label>
                )}
                {renderPreviewComponent(component)}
              </div>
            ))}
          </div>
        ))}
        
        {components.some(row => row.length > 0) && (
          <div className="mt-6">
            <Button 
              themeColor="primary" 
              onClick={handleSubmit}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity px-5 py-2 rounded-md shadow-sm"
            >
              Submit Form
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-5 h-full overflow-y-auto bg-[var(--card)] border-l border-[var(--border)]">
      <TabStrip selected={selected} onSelect={handleSelect} className="k-tabstrip-theme w-full">
        <TabStripTab title="Preview">
          <div className="w-full pt-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg text-[var(--primary)] font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Form Preview
              </h2>
              {components.length > 0 && (
                <Button
                  onClick={toggleFullscreenPreview}
                  className="flex items-center gap-1 text-sm text-[var(--primary)] bg-[var(--primary-light)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)] transition-colors px-3 py-1 rounded-md"
                  style={{ border: 'none' }}
                  title="View in fullscreen"
                >
                  <Maximize2 size={16} />
                  <span>Fullscreen</span>
                </Button>
              )}
            </div>
            
            {renderFormPreview()}
          </div>
        </TabStripTab>
        
        <TabStripTab title="Export">
          <div className="pt-4">
            <h2 className="text-lg text-[var(--primary)] font-semibold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Form
            </h2>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Export Format
              </label>
              <DropDownList
                data={['json', 'jsx']}
                value={exportFormat}
                onChange={(e) => setExportFormat(e.value as 'json' | 'jsx')}
                style={{ width: '100%' }}
                className="border-[var(--border)] rounded-md"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleCopyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] transition-colors"
              >
                {copied ? <Check size={18} className="text-[var(--success)]" /> : <Clipboard size={18} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              
              <Button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                <Download size={18} />
                Download
              </Button>
            </div>
            
            <div className="mt-6 border border-[var(--border)] rounded-lg p-4 bg-[var(--secondary)] text-[var(--foreground)]">
              <h3 className="text-sm font-semibold mb-3">Preview</h3>
              <pre className="text-xs overflow-auto p-3 bg-[var(--background)] border border-[var(--border)] rounded-md max-h-[300px] font-mono">
                {exportFormat === 'json' ? exportAsJson() : exportAsJsx()}
              </pre>
            </div>
          </div>
        </TabStripTab>
      </TabStrip>
      
      {/* Fullscreen Preview Modal */}
      {showFullscreenPreview && (
        <Dialog 
          title={
            <div className="flex items-center justify-between w-full pr-5">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--primary)]">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-lg font-semibold">Form Preview</span>
              </div>
              <Button
                onClick={toggleFullscreenPreview}
                className="flex items-center gap-1 text-sm text-[var(--primary)] bg-[var(--primary-light)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)] transition-colors px-3 py-1 rounded-md"
                style={{ border: 'none' }}
                title="Exit fullscreen"
              >
                <Minimize2 size={16} />
                <span>Exit Fullscreen</span>
              </Button>
            </div>
          }
          onClose={toggleFullscreenPreview}
          width={800}
          height="90vh"
          className="k-dialog-lg bg-[var(--background)]"
        >
          <div className="p-5 overflow-y-auto h-full">
            {renderFormPreview(true)}
          </div>
        </Dialog>
      )}
      
      <NotificationGroup
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 9999
        }}
      >
        <Fade enter={true} exit={true}>
          {showNotification && (
            <Notification
              type={{ style: 'success', icon: true }}
              closable={true}
              onClose={() => setShowNotification(false)}
              className="bg-[var(--card)] border border-[var(--border)] shadow-lg rounded-lg"
            >
              <div>
                <h4 className="font-bold mb-2 text-[var(--foreground)]">Form Values:</h4>
                <pre className="p-3 rounded text-xs max-h-40 overflow-auto bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] font-mono">
                  {JSON.stringify(getDisplayValues(), null, 2)}
                </pre>
              </div>
            </Notification>
          )}
        </Fade>
      </NotificationGroup>
    </div>
  );
};

export default PreviewExportPanel; 