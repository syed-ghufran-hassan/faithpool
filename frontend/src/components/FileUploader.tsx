import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface FileUpload {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
}

export interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void> | void;
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  disabled?: boolean;
  uploadText?: string;
  dragText?: string;
  className?: string;
  children?: ReactNode;
}

export function FileUploader({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  onUpload,
  onFileSelect,
  onFileRemove,
  disabled = false,
  uploadText = 'Click to upload',
  dragText = 'or drag and drop',
  className,
  children,
}: FileUploaderProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit`;
    }
    
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type || file.name.endsWith(type.replace('.', ''));
      });
      
      if (!isAccepted) {
        return `File type not accepted. Allowed: ${accept}`;
      }
    }
    
    return null;
  };

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles || disabled) return;
    
    const fileArray = Array.from(newFiles);
    
    if (!multiple && fileArray.length > 1) {
      fileArray.splice(1);
    }
    
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    const uploads: FileUpload[] = fileArray.map(file => {
      const error = validateFile(file);
      return {
        id: generateId(),
        file,
        status: error ? 'error' : 'idle',
        progress: 0,
        error: error || undefined,
      };
    });
    
    setFiles(prev => [...prev, ...uploads]);
    
    const validFiles = uploads.filter(u => u.status !== 'error').map(u => u.file);
    if (validFiles.length > 0) {
      onFileSelect?.(validFiles);
    }
  }, [files.length, maxFiles, multiple, disabled, accept, maxSize, onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    onFileRemove?.(id);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const startUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'idle');
    if (pendingFiles.length === 0) return;
    
    setFiles(prev => prev.map(f => 
      f.status === 'idle' ? { ...f, status: 'uploading' } : f
    ));
    
    try {
      await onUpload?.(pendingFiles.map(f => f.file));
      
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'success', progress: 100 } : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error', error: 'Upload failed' } 
          : f
      ));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="fileuploader__status-icon fileuploader__status-icon--success" />;
      case 'error':
        return <AlertCircle size={16} className="fileuploader__status-icon fileuploader__status-icon--error" />;
      default:
        return <File size={16} className="fileuploader__status-icon" />;
    }
  };

  return (
    <div className={clsx('fileuploader', className)}>
      <div
        className={clsx('fileuploader__dropzone', {
          'fileuploader__dropzone--dragging': isDragging,
          'fileuploader__dropzone--disabled': disabled,
        })}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="fileuploader__input"
        />
        
        {children || (
          <>
            <Upload size={32} className="fileuploader__icon" />
            <p className="fileuploader__text">
              <span className="fileuploader__text-primary">{uploadText}</span>
              <span className="fileuploader__text-secondary">{dragText}</span>
            </p>
            {accept && (
              <p className="fileuploader__hint">
                Accepted files: {accept}
              </p>
            )}
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="fileuploader__list">
          {files.map((upload) => (
            <div
              key={upload.id}
              className={clsx('fileuploader__file', {
                [`fileuploader__file--${upload.status}`]: upload.status !== 'idle',
              })}
            >
              {getStatusIcon(upload.status)}
              
              <div className="fileuploader__file-info">
                <span className="fileuploader__file-name">{upload.file.name}</span>
                <span className="fileuploader__file-size">
                  {formatFileSize(upload.file.size)}
                </span>
                {upload.error && (
                  <span className="fileuploader__file-error">{upload.error}</span>
                )}
              </div>
              
              {upload.status === 'uploading' && (
                <div className="fileuploader__progress">
                  <div
                    className="fileuploader__progress-bar"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}
              
              <button
                type="button"
                onClick={() => removeFile(upload.id)}
                className="fileuploader__remove"
                disabled={upload.status === 'uploading'}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          
          <div className="fileuploader__actions">
            <button
              type="button"
              onClick={clearFiles}
              className="fileuploader__button fileuploader__button--secondary"
              disabled={files.some(f => f.status === 'uploading')}
            >
              Clear All
            </button>
            {onUpload && (
              <button
                type="button"
                onClick={startUpload}
                className="fileuploader__button fileuploader__button--primary"
                disabled={files.every(f => f.status !== 'idle')}
              >
                Upload {files.filter(f => f.status === 'idle').length} Files
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
