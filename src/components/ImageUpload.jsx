import React, { useState, useRef } from 'react';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import './ImageUpload.css';

const ImageUpload = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeInMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Compress image before upload
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Validate file
  const validateFile = (file) => {
    if (!acceptedFormats.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${acceptedFormats.join(', ')}`;
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }

    if (images.length >= maxImages) {
      return `Maximum ${maxImages} images allowed`;
    }

    return null;
  };

  // Upload single file
  const uploadFile = async (file) => {
    if (!user) {
      toast.authError('login', 'Please log in to upload images');
      return null;
    }

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast.warning(validationError);
        return null;
      }

      // Compress image
      const compressedBlob = await compressImage(file);
      if (!compressedBlob) {
        throw new Error('Failed to compress image');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `recipes/${user.uid}/${timestamp}_${randomId}.${extension}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const newImage = {
        url: downloadURL,
        filename: filename,
        isPrimary: images.length === 0, // First image is primary by default
        uploadedAt: new Date()
      };

      return newImage;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    }
  };

  // Handle file selection
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedImage = await uploadFile(file);
        if (uploadedImage) {
          newImages.push(uploadedImage);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Remove image
  const removeImage = async (index) => {
    const imageToRemove = images[index];
    
    try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, imageToRemove.filename);
      await deleteObject(storageRef);

      // Remove from local state
      const updatedImages = images.filter((_, i) => i !== index);
      
      // If removed image was primary, make first remaining image primary
      if (imageToRemove.isPrimary && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }

      onImagesChange(updatedImages);
      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  // Set primary image
  const setPrimaryImage = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    onImagesChange(updatedImages);
    toast.success('Primary image updated');
  };

  // Reorder images
  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    onImagesChange(updatedImages);
  };

  return (
    <div className="image-upload">
      <div className="image-upload-header">
        <h3>Recipe Images</h3>
        <p>Upload up to {maxImages} images (max {maxSizeInMB}MB each)</p>
      </div>

      {/* Upload Area */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div className="upload-loading">
            <div className="loading-spinner"></div>
            <p>Uploading images...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📸</div>
            <p className="upload-text">
              Drag and drop images here, or <span className="upload-link">click to browse</span>
            </p>
            <p className="upload-hint">
              Supported formats: JPEG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="image-grid">
          {images.map((image, index) => (
            <div key={index} className={`image-item ${image.isPrimary ? 'primary' : ''}`}>
              <div className="image-preview">
                <img src={image.url} alt={`Recipe image ${index + 1}`} />
                
                {image.isPrimary && (
                  <div className="primary-badge">Primary</div>
                )}

                <div className="image-actions">
                  {!image.isPrimary && (
                    <button
                      onClick={() => setPrimaryImage(index)}
                      className="btn-set-primary"
                      title="Set as primary image"
                    >
                      ⭐
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeImage(index)}
                    className="btn-remove"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="image-controls">
                <button
                  onClick={() => moveImage(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="btn-move"
                  title="Move left"
                >
                  ←
                </button>
                <span className="image-position">{index + 1}</span>
                <button
                  onClick={() => moveImage(index, Math.min(images.length - 1, index + 1))}
                  disabled={index === images.length - 1}
                  className="btn-move"
                  title="Move right"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {images.length > 0 && (
        <div className="upload-summary">
          <p>{images.length} of {maxImages} images uploaded</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
