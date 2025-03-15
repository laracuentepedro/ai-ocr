import { useState, useRef } from 'react';

type FileUploadHookProps = {
  allowedTypes?: string[];
};

type FileUploadHookReturn = {
  file: File | null;
  preview: string | null;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  triggerFileInput: () => void;
  resetForm: () => void;
};

export function useFileUpload({ allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'] }: FileUploadHookProps = {}): FileUploadHookReturn {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (selectedFile: File | null) => {
    setError(null);
    
    if (!selectedFile) return;
    
    // Check if file type is allowed
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(`Please select a valid file type: ${allowedTypes.join(', ')}`);
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview for images only
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For non-images (like PDFs), just clear the preview
      setPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    validateAndProcessFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0] || null;
    validateAndProcessFile(droppedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    file,
    preview,
    error,
    fileInputRef,
    handleFileChange,
    handleDragOver,
    handleDrop,
    triggerFileInput,
    resetForm
  };
}