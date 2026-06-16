import React, { useState, useRef, useCallback } from 'react';
import { apiClient } from '../lib/axios';

interface ImageUploaderProps {
  /** Current image URL (for preview) */
  currentImage?: string;
  /** API endpoint to upload to, e.g. '/upload/profile' */
  uploadEndpoint: string;
  /** Field name for the file in the form data */
  fieldName?: string;
  /** Callback when upload succeeds, receives the new URL */
  onUploadSuccess?: (url: string) => void;
  /** Callback when upload fails */
  onUploadError?: (error: string) => void;
  /** Shape: 'circle' for profile pics, 'rounded' for portfolio */
  shape?: 'circle' | 'rounded';
  /** Size of the preview area */
  size?: number;
  /** Label text */
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  uploadEndpoint,
  fieldName = 'image',
  onUploadSuccess,
  onUploadError,
  shape = 'circle',
  size = 120,
  label = 'Upload Image',
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    // Prepend backend base URL
    const backendUrl = process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    return `${backendUrl}${url}`;
  };

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Only image files (JPEG, PNG, WebP, GIF) are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('File size must be less than 5MB');
      return;
    }

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const res = await apiClient.post(uploadEndpoint, formData);

      if (res.data.success) {
        const serverUrl = res.data.data.url || res.data.data.imageUrl;
        setPreview(getImageUrl(serverUrl));
        onUploadSuccess?.(serverUrl);
      } else {
        onUploadError?.('Upload failed');
        setPreview(currentImage || null);
      }
    } catch (err: any) {
      onUploadError?.(err?.response?.data?.error?.message || 'Upload failed');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  }, [uploadEndpoint, fieldName, onUploadSuccess, onUploadError, currentImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const borderRadius = shape === 'circle' ? '50%' : 16;
  const displayUrl = preview ? (preview.startsWith('blob:') ? preview : getImageUrl(preview)) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          width: size,
          height: size,
          borderRadius,
          border: dragOver ? '2px dashed #10B981' : '2px dashed #CBD5E1',
          background: dragOver ? '#ECFDF5' : '#F8FAFC',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" style={{ margin: '0 auto 4px' }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Drop or click</div>
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius,
          }}>
            <div style={{
              width: 28,
              height: 28,
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: '#10B981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        )}

        {/* Hover overlay to indicate clickable */}
        {!uploading && displayUrl && (
          <div
            className="upload-hover-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.querySelector('svg')!.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.querySelector('svg')!.style.opacity = '0'; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ opacity: 0, transition: 'opacity 0.2s' }}>
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</span>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ImageUploader;
