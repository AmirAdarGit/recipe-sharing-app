import React, { useState } from 'react';
import './BulkActions.css';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkTag: (tags: string[]) => void;
  onSelectAll: (selected: boolean) => void;
  availableTags: string[];
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkTag,
  onSelectAll,
  availableTags
}) => {
  const [showTagModal, setShowTagModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Handle adding new tag
  const handleAddNewTag = () => {
    const tag = newTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
      setNewTag('');
    }
  };

  // Handle bulk tag application
  const handleApplyTags = () => {
    if (selectedTags.length > 0) {
      onBulkTag(selectedTags);
      setShowTagModal(false);
      setSelectedTags([]);
      setNewTag('');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    onBulkDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="bulk-actions">
        <div className="bulk-actions-header">
          <div className="selection-info">
            <span className="selected-count">
              {selectedCount} {selectedCount === 1 ? 'link' : 'links'} selected
            </span>
            <button
              onClick={() => onSelectAll(false)}
              className="clear-selection-btn"
            >
              Clear selection
            </button>
          </div>

          <div className="bulk-action-buttons">
            <button
              onClick={() => setShowTagModal(true)}
              className="bulk-btn tag-btn"
              title="Add tags to selected links"
            >
              <span className="btn-icon">🏷️</span>
              <span className="btn-text">Add Tags</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bulk-btn delete-btn"
              title="Delete selected links"
            >
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tag Modal */}
      {showTagModal && (
        <div className="modal-overlay">
          <div className="bulk-tag-modal">
            <div className="modal-header">
              <h3>Add Tags to {selectedCount} Links</h3>
              <button
                onClick={() => {
                  setShowTagModal(false);
                  setSelectedTags([]);
                  setNewTag('');
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="selected-tags-section">
                  <h4>Tags to add:</h4>
                  <div className="selected-tags">
                    {selectedTags.map(tag => (
                      <span key={tag} className="tag selected">
                        {tag}
                        <button
                          onClick={() => handleTagToggle(tag)}
                          className="tag-remove"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Tag */}
              <div className="new-tag-section">
                <h4>Add new tag:</h4>
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
                        handleAddNewTag();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddNewTag}
                    disabled={!newTag.trim()}
                    className="add-tag-btn"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Existing Tags */}
              {availableTags.length > 0 && (
                <div className="existing-tags-section">
                  <h4>Or choose from existing tags:</h4>
                  <div className="existing-tags">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`tag ${selectedTags.includes(tag) ? 'selected' : 'existing'}`}
                      >
                        {tag}
                        {selectedTags.includes(tag) && (
                          <span className="tag-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowTagModal(false);
                  setSelectedTags([]);
                  setNewTag('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTags}
                disabled={selectedTags.length === 0}
                className="btn btn-primary"
              >
                Add Tags to {selectedCount} Links
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header">
              <h3>Delete Selected Links</h3>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete {selectedCount} selected {selectedCount === 1 ? 'link' : 'links'}?
              </p>
              <p className="warning-text">
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="btn btn-danger"
              >
                Delete {selectedCount} {selectedCount === 1 ? 'Link' : 'Links'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;
