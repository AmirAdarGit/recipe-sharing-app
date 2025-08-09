import React, { useState, useEffect } from 'react';
import { SavedLink } from '../pages/SavedLinks';
import { savedLinksAPI, savedLinksUtils } from '../services/savedLinksAPI';
import './AddLinkModal.css';

interface AddLinkModalProps {
  onClose: () => void;
  onSave: (linkData: Partial<SavedLink>) => void;
  existingTags: string[];
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({
  onClose,
  onSave,
  existingTags
}) => {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    platform: 'website' as SavedLink['platform'],
    tags: [] as string[],
    userNotes: '',
    isPublic: false
  });

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (formData.url && savedLinksUtils.isValidUrl(formData.url)) {
      const detectedPlatform = savedLinksUtils.getPlatformFromUrl(formData.url);
      setFormData(prev => ({ ...prev, platform: detectedPlatform }));
    }
  }, [formData.url]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle URL preview
  const handlePreviewUrl = async () => {
    // Clean and decode the URL
    let cleanUrl = formData.url.trim();
    
    // Decode URL if it's encoded
    try {
      cleanUrl = decodeURIComponent(cleanUrl);
    } catch (e) {
      // If decoding fails, use original
    }
    
    if (!cleanUrl || !savedLinksUtils.isValidUrl(cleanUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    console.log('🔍 Attempting to preview URL:', cleanUrl);
    
    try {
      setPreviewLoading(true);
      setError(null);

      const response = await savedLinksAPI.getLinkPreview(cleanUrl);
      
      if (response.success && response.data) {
        const { title, description, thumbnail, platform } = response.data;
        
        setFormData(prev => ({
          ...prev,
          title: title || prev.title,
          description: description || prev.description,
          platform: platform as SavedLink['platform'] || prev.platform,
          thumbnail: thumbnail
        }));
      }
    } catch (error: any) {
      console.error('Error fetching preview:', error);
      setError(`Failed to fetch link preview: ${error.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle tag management
  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleExistingTagClick = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url || !savedLinksUtils.isValidUrl(formData.url)) {
      setError('Please enter a valid URL');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for the link');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const linkData: Partial<SavedLink> = {
        url: formData.url.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        platform: formData.platform,
        tags: formData.tags,
        userNotes: formData.userNotes.trim(),
        isPublic: formData.isPublic
      };

      await onSave(linkData);
    } catch (error: any) {
      console.error('Error saving link:', error);
      setError(error.message || 'Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="add-link-modal">
        <div className="modal-header">
          <h2>Add New Link</h2>
          <button
            onClick={handleClose}
            className="close-btn"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* URL Input */}
          <div className="form-group">
            <label htmlFor="url">URL *</label>
            <div className="url-input-group">
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com/recipe"
                required
                className="form-input"
              />
              <button
                type="button"
                onClick={handlePreviewUrl}
                disabled={!formData.url || previewLoading}
                className="preview-btn"
              >
                {previewLoading ? '⏳' : '🔍'}
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Recipe title"
              required
              className="form-input"
            />
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the recipe"
              rows={3}
              className="form-textarea"
            />
          </div>

          {/* Platform Selection */}
          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="website">Website</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="pinterest">Pinterest</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            
            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="selected-tags">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag selected">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="tag-remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="tag-input-section">
              {showTagInput ? (
                <div className="new-tag-input">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name"
                    className="tag-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="add-tag-btn"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTagInput(false);
                      setNewTag('');
                    }}
                    className="cancel-tag-btn"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="show-tag-input-btn"
                >
                  + Add Tag
                </button>
              )}
            </div>

            {/* Existing Tags */}
            {existingTags.length > 0 && (
              <div className="existing-tags">
                <p className="existing-tags-label">Or choose from existing:</p>
                <div className="existing-tags-list">
                  {existingTags
                    .filter(tag => !formData.tags.includes(tag))
                    .slice(0, 10)
                    .map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleExistingTagClick(tag)}
                        className="tag existing"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* User Notes */}
          <div className="form-group">
            <label htmlFor="userNotes">Personal Notes</label>
            <textarea
              id="userNotes"
              name="userNotes"
              value={formData.userNotes}
              onChange={handleInputChange}
              placeholder="Add your personal notes about this recipe"
              rows={2}
              className="form-textarea"
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              <span className="checkbox-text">
                Make this link public (others can see it)
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.url || !formData.title}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLinkModal;
