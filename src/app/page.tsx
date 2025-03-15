'use client'
import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the FormBuilder component
// This is necessary because some KendoReact components use browser APIs
const FormBuilder = dynamic(
  () => import('./components/form-builder/FormBuilder'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <FormBuilder />
    </div>
  );
}
