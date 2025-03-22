// IndexedDB utility for form collection management

// Define types for our form collection
export interface FormCollection {
  id?: number;
  name: string;
  description?: string;
  formState: any[];
  dateCreated: Date;
  dateModified: Date;
  preview?: string; // Base64 encoded preview image
}

// Database configuration
const DB_NAME = 'FormBuilderDB';
const DB_VERSION = 1;
const FORM_STORE = 'formCollections';

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the form collections object store
      if (!db.objectStoreNames.contains(FORM_STORE)) {
        const store = db.createObjectStore(FORM_STORE, {
          keyPath: 'id',
          autoIncrement: true
        });
        
        // Create indexes for faster searching
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('dateCreated', 'dateCreated', { unique: false });
        store.createIndex('dateModified', 'dateModified', { unique: false });
      }
    };
  });
};

// Save a form to the collection
export const saveForm = async (form: FormCollection): Promise<FormCollection> => {
  const db = await initDB();
  const tx = db.transaction(FORM_STORE, 'readwrite');
  const store = tx.objectStore(FORM_STORE);

  // Create a copy of the form data to avoid modifying the original
  const formToSave = { ...form };
  
  let result;
  if (formToSave.id) {
    // If form has an ID, update it
    result = await store.put(formToSave);
  } else {
    // If no ID, remove the id property completely before adding
    delete formToSave.id;
    result = await store.add(formToSave);
  }

  await tx.done;

  // Return the saved form with its ID
  return { ...formToSave, id: result };
};

// Update an existing form
export const updateForm = async (form: FormCollection): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FORM_STORE], 'readwrite');
    const store = transaction.objectStore(FORM_STORE);
    
    const request = store.put(form);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      console.error('Error updating form:', event);
      reject('Failed to update form');
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get all forms in the collection
export const getAllForms = async (): Promise<FormCollection[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FORM_STORE], 'readonly');
    const store = transaction.objectStore(FORM_STORE);
    
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error('Error getting forms:', event);
      reject('Failed to get forms');
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get a specific form by ID
export const getFormById = async (id: number): Promise<FormCollection | null> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FORM_STORE], 'readonly');
    const store = transaction.objectStore(FORM_STORE);
    
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      console.error('Error getting form:', event);
      reject('Failed to get form');
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Delete a form by ID
export const deleteForm = async (id: number): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FORM_STORE], 'readwrite');
    const store = transaction.objectStore(FORM_STORE);
    
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      console.error('Error deleting form:', event);
      reject('Failed to delete form');
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}; 