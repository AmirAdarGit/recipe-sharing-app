import React, { useState } from 'react';
import { SavedLink } from '../pages/SavedLinks';
import { savedLinksUtils } from '../services/savedLinksAPI';
import EditLinkModal from './EditLinkModal';
import './LinkCard.css';

interface LinkCardProps {
  link: SavedLink;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onVisit: () => void;
  onUpdate: (updates: Partial<SavedLink>) => void;
  onDelete: () => void;
}

const LinkCard: React.FC<LinkCardProps> = ({
  link,
  selected,
  onSelect,
  onVisit,
  onUpdate,
  onDelete
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Get domain from URL
  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Handle edit
  const handleEditSave = (updates: Partial<SavedLink>) => {
    onUpdate(updates);
    setShowEditModal(false);
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <>
      <div className={`link-card ${selected ? 'selected' : ''}`}>
        {/* Selection Checkbox */}
        <div className="card-header">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="card-checkbox"
            />
            <span className="checkmark"></span>
          </label>
          
          <div className="platform-badge">
            <span className="platform-icon">
              {savedLinksUtils.getPlatformIcon(link.platform)}
            </span>
            <span className="platform-name">{link.platform}</span>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="card-thumbnail" onClick={onVisit}>
          {link.thumbnail ? (
            <img 
              src={link.thumbnail} 
              alt={link.title}
              className="thumbnail-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`thumbnail-placeholder ${link.thumbnail ? 'hidden' : ''}`}>
            <span className="placeholder-icon">🔗</span>
          </div>
          
          {/* Visit overlay */}
          <div className="visit-overlay">
            <span className="visit-icon">👁️</span>
            <span className="visit-text">View</span>
          </div>
        </div>

        {/* Content */}
        <div className="card-content">
          <h3 className="card-title" onClick={onVisit} title={link.title}>
            {link.title}
          </h3>
          
          <p className="card-description" title={link.description}>
            {link.description}
          </p>

          {/* User Notes */}
          {link.userNotes && (
            <div className="card-notes">
              <span className="notes-icon">📝</span>
              <span className="notes-text">{link.userNotes}</span>
            </div>
          )}

          {/* Tags */}
          {link.tags.length > 0 && (
            <div className="card-tags">
              {link.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
              {link.tags.length > 3 && (
                <span className="tag-more">+{link.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="card-metadata">
            <div className="metadata-item">
              <span className="metadata-icon">🌐</span>
              <span className="metadata-text">{getDomain(link.url)}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-icon">👁️</span>
              <span className="metadata-text">
                {savedLinksUtils.formatVisitCount(link.visitCount)}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-icon">📅</span>
              <span className="metadata-text">{formatDate(link.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <button
            onClick={onVisit}
            className="action-btn primary"
            title="Visit link"
          >
            <span className="action-icon">🔗</span>
            <span className="action-text">Visit</span>
          </button>
          
          <button
            onClick={handleCopyLink}
            className="action-btn secondary"
            title="Copy link"
          >
            <span className="action-icon">📋</span>
            <span className="action-text">Copy</span>
          </button>
          
          <button
            onClick={() => setShowEditModal(true)}
            className="action-btn secondary"
            title="Edit link"
          >
            <span className="action-icon">✏️</span>
            <span className="action-text">Edit</span>
          </button>
          
          <button
            onClick={handleDeleteClick}
            className="action-btn danger"
            title="Delete link"
          >
            <span className="action-icon">🗑️</span>
            <span className="action-text">Delete</span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditLinkModal
          link={link}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header">
              <h3>Delete Link</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this link?</p>
              <p className="link-title-preview">"{link.title}"</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={handleDeleteCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LinkCard;
