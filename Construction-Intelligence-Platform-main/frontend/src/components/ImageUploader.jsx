import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] };

export default function ImageUploader({
  onFileSelect,
  label = 'Upload Image',
  sampleUrl = null,
  sampleName = 'sample.jpg',
  sampleLabel = 'Load Demo Photo',
}) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loadingSample, setLoadingSample] = useState(false);

  const handleSelect = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
    onFileSelect(f);
  };

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected.length > 0) {
      const reasons = rejected[0].errors.map(e => e.message).join(', ');
      setError(reasons);
      return;
    }
    if (accepted.length > 0) {
      handleSelect(accepted[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const loadSample = async (e) => {
    e.stopPropagation();
    if (!sampleUrl || loadingSample) return;
    setLoadingSample(true);
    setError('');
    try {
      const res = await fetch(sampleUrl);
      if (!res.ok) throw new Error('Could not load sample image');
      const blob = await res.blob();
      const sampleFile = new File([blob], sampleName, { type: blob.type || 'image/jpeg' });
      handleSelect(sampleFile);
    } catch (err) {
      setError(`Failed to load demo photo: ${err.message}`);
    } finally {
      setLoadingSample(false);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setError('');
    onFileSelect(null);
  };

  return (
    <div>
      {!preview ? (
        <div>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} id="image-upload-input" />
            <Upload size={38} style={{ margin: '0 auto 0.75rem', display: 'block', color: 'var(--primary)', opacity: 0.8 }} />
            <div className="dropzone-text">
              {isDragActive ? (
                <span className="dropzone-highlight">Drop it here!</span>
              ) : (
                <>
                  <span className="dropzone-highlight">Click to upload</span> or drag & drop photo
                </>
              )}
            </div>
            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              JPG, PNG, WebP — Max 5 MB
            </div>

            {sampleUrl && (
              <div style={{ marginTop: '1rem' }} onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={loadSample}
                  disabled={loadingSample}
                  style={{
                    fontSize: '0.75rem',
                    background: 'rgba(245, 158, 11, 0.12)',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    color: 'var(--primary)',
                  }}
                  id="load-sample-image-btn"
                >
                  <Sparkles size={13} />
                  {loadingSample ? 'Loading Demo Photo...' : `✨ ${sampleLabel}`}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="image-preview-wrapper">
          <img src={preview} alt="Preview" className="image-preview" />
          <button className="image-preview-remove" onClick={removeFile} id="remove-image-btn" title="Remove image">
            <X size={14} />
          </button>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(10,15,30,0.85))',
            padding: '0.6rem 0.75rem',
            fontSize: '0.75rem', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <ImageIcon size={13} color="var(--primary)" />
              <span>{file?.name}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {(file?.size / 1024).toFixed(0)} KB
            </span>
          </div>
        </div>
      )}
      {error && (
        <div style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.8rem' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
