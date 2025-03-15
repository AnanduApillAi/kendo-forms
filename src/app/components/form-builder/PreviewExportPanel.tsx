'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Checkbox, RadioGroup, RadioButton } from '@progress/kendo-react-inputs';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';
import { useFormBuilder } from './FormBuilderContext';
import { Download, Clipboard, Check } from 'lucide-react';

const PreviewExportPanel: React.FC = () => {
  const { components, exportAsJson, exportAsJsx } = useFormBuilder();
  const [selected, setSelected] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'json' | 'jsx'>('json');
  const [copied, setCopied] = useState<boolean>(false);
  
  // Track form values for all components
  const [formValues, setFormValues] = useState<Record<string, any>>({});
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

  // Handle form submission
  const handleSubmit = () => {
    // Show notification with current form values
    setShowNotification(true);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const renderPreviewComponent = (component: any) => {
    const { id, type, label, name, className, placeholder, required, options } = component;
    const value = formValues[id];

    switch (type) {
      case 'textField':
        return (
          <Input
            value={value}
            onChange={(e) => updateFormValue(id, e.value)}
            placeholder={placeholder}
            style={{width: '100%'}}
            name={name}
            className={className}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => updateFormValue(id, e.value)}
            placeholder={placeholder}
            style={{width: '100%'}}
            name={name}
            className={className}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateFormValue(id, e.value)}
            placeholder={placeholder}
            style={{width: '100%'}}
            name={name}
            className={className}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            label={name}
            checked={value}
            onChange={(e) => updateFormValue(id, e.value)}
            style={{width: '100%'}}
            name={name}
            className={className}
          />
        );
      case 'radio':
        return (
          <RadioGroup
            data={options || []}
            value={value}
            onChange={(e) => updateFormValue(id, e.value)}
            style={{width: '100%'}}
            name={name}
            className={className}
          />
        );
      case 'dropdown':
        return (
          <DropDownList
            data={options?.map((o: any) => o.value) || []}
            value={value}
            onChange={(e) => updateFormValue(id, e.value)}
            style={{width: '100%'}}
            name={name}
            className={className}
          />
        );
      case 'textarea':
        return (
          <Input
            type="textarea"
            value={value}
            onChange={(e) => updateFormValue(id, e.value)}
            placeholder={placeholder}
            style={{width: '100%', minHeight: '80px'}}
            name={name}
            className={className}
          />
        );
      case 'button':
        return (
          <div 
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px 16px' }}
          >
            {label}
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

  return (
    <div className="p-4 h-full overflow-y-auto">
      <TabStrip selected={selected} onSelect={handleSelect} className="k-tabstrip-theme w-full">
        <TabStripTab title="Preview">
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              
              Form Preview
            </h2>
            
            {components.length === 0 ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-lg">
                <p className="text-[var(--muted-foreground)]">Add components to see preview</p>
              </div>
            ) : (
              <div className="space-y-4 p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]">
                {components.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-4">
                    {row.map((component) => (
                      <div key={component.id} className="mb-4" style={{ width:'100%' }}>
                        {component.showLabel !== false && (
                          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
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
                  <div className="mt-4">
                    <Button 
                      themeColor="primary" 
                      onClick={handleSubmit}
                      className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabStripTab>
        
        <TabStripTab title="Export">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              
              Export Form
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Export Format
              </label>
              <DropDownList
                data={['json', 'jsx']}
                value={exportFormat}
                onChange={(e) => setExportFormat(e.value as 'json' | 'jsx')}
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                {exportFormat === 'json' ? 'JSON Schema' : 'JSX Component'}
              </label>
              <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--secondary)] h-64 overflow-auto">
                <pre className="text-xs text-[var(--foreground)]">
                  {exportFormat === 'json' ? exportAsJson() : exportAsJsx()}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2 bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--secondary-hover)] transition-colors w-fit"
              >
                <div className="flex items-center gap-2">
                  {copied ? <Check size={16} /> : <Clipboard size={16} />}
                  <span>
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </div>
              </Button>
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Download size={16} />
                  <span>
                    Download
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </TabStripTab>
      </TabStrip>
      
      {/* Notification for form values */}
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
              className="bg-[var(--card)] border border-[var(--border)] shadow-lg"
            >
              <div>
                <h4 className="font-bold mb-2 text-[var(--foreground)]">Form Values:</h4>
                <pre className="p-2 rounded text-xs max-h-40 overflow-auto bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]">
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