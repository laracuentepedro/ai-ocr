import { useState, useRef } from 'react';

type FileUploadHookProps = {
  allowedTypes?: string[];
  multiple?: boolean;
};

type FilePreview = {
  file: File;
  preview: string | null;
};

type FileUploadHookReturn = {
  files: File[];
  filesPreviews: FilePreview[];
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  triggerFileInput: () => void;
  resetForm: () => void;
  removeFile: (index: number) => void;
};

export function useFileUpload({ allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'], multiple = false }: FileUploadHookProps = {}): FileUploadHookReturn {
  const [files, setFiles] = useState<File[]>([]);
  const [filesPreviews, setFilesPreviews] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPreviewForFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-images (like PDFs), no preview
        resolve(null);
      }
    });
  };

  const validateAndProcessFiles = async (selectedFiles: FileList | null) => {
    setError(null);
    
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const newFiles: File[] = [];
    const newPreviews: FilePreview[] = [];
    
    // Process each file
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check if file type is allowed
      if (!allowedTypes.includes(file.type)) {
        setError(`Please select valid file types: ${allowedTypes.join(', ')}`);
        return;
      }
      
      newFiles.push(file);
      
      // Create preview for the file
      const preview = await createPreviewForFile(file);
      newPreviews.push({ file, preview });
    }
    
    if (multiple) {
      // Add to existing files if multiple is enabled
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setFilesPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    } else {
      // Replace existing files if multiple is disabled
      setFiles(newFiles);
      setFilesPreviews(newPreviews);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setFiles([]);
    setFilesPreviews([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setFilesPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  return {
    files,
    filesPreviews,
    error,
    fileInputRef,
    handleFileChange,
    handleDragOver,
    handleDrop,
    triggerFileInput,
    resetForm,
    removeFile
  };
}