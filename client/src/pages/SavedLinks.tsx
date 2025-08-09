import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { savedLinksAPI } from '../services/savedLinksAPI';
import AddLinkModal from '../components/AddLinkModal';
import LinkCard from '../components/LinkCard';
import LinkFilters from '../components/LinkFilters';
import BulkActions from '../components/BulkActions';
import './SavedLinks.css';

// TypeScript interfaces
export interface SavedLink {
  _id: string;
  url: string;
  title: string;
  description: string;
  thumbnail?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'website' | 'other';
  tags: string[];
  userNotes?: string;
  visitCount: number;
  isPublic: boolean;
  userFirebaseUid: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    author?: string;
    duration?: string;
    difficulty?: string;
    servings?: string;
  };
}

export interface LinkFilters {
  search: string;
  platform: string;
  tags: string[];
  sortBy: 'createdAt' | 'title' | 'visitCount' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

const SavedLinks: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  // State management
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter state
  const [filters, setFilters] = useState<LinkFilters>({
    search: '',
    platform: '',
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Available tags for filtering (extracted from all links)
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    links.forEach(link => {
      link.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [links]);

  // Filtered and sorted links
  const filteredLinks = useMemo(() => {
    let filtered = links.filter(link => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          link.title.toLowerCase().includes(searchLower) ||
          link.description.toLowerCase().includes(searchLower) ||
          link.userNotes?.toLowerCase().includes(searchLower) ||
          link.tags.some(tag => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Platform filter
      if (filters.platform && link.platform !== filters.platform) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag =>
          link.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy];
      let bValue: any = b[filters.sortBy];

      // Handle date sorting
      if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [links, filters]);

  // Fetch saved links
  const fetchLinks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await savedLinksAPI.getLinks();

      if (response.success && response.data) {
        setLinks(response.data);
      } else {
        throw new Error('Failed to fetch saved links');
      }
    } catch (error: any) {
      console.error('Error fetching saved links:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load saved links';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load links on component mount
  useEffect(() => {
    fetchLinks();
  }, [user]);

  // Handle adding new link
  const handleAddLink = async (linkData: Partial<SavedLink>) => {
    try {
      const response = await savedLinksAPI.createLink(linkData);

      if (response.success && response.data) {
        setLinks(prev => [response.data!, ...prev]);
        setShowAddModal(false);
        toast.success('Link saved successfully!');
      } else {
        throw new Error('Failed to save link');
      }
    } catch (error: any) {
      console.error('Error saving link:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save link';
      toast.error(errorMessage);
    }
  };

  // Handle updating link
  const handleUpdateLink = async (linkId: string, updates: Partial<SavedLink>) => {
    try {
      const response = await savedLinksAPI.updateLink(linkId, updates);

      if (response.success && response.data) {
        setLinks(prev => prev.map(link =>
          link._id === linkId ? response.data! : link
        ));
        toast.success('Link updated successfully!');
      } else {
        throw new Error('Failed to update link');
      }
    } catch (error: any) {
      console.error('Error updating link:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update link';
      toast.error(errorMessage);
    }
  };

  // Handle deleting link
  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await savedLinksAPI.deleteLink(linkId);

      if (response.success) {
        setLinks(prev => prev.filter(link => link._id !== linkId));
        setSelectedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(linkId);
          return newSet;
        });
        toast.success('Link deleted successfully!');
      } else {
        throw new Error('Failed to delete link');
      }
    } catch (error: any) {
      console.error('Error deleting link:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete link';
      toast.error(errorMessage);
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedLinks.size === 0) return;

    try {
      const linkIds = Array.from(selectedLinks);
      await Promise.all(linkIds.map(id => savedLinksAPI.deleteLink(id)));

      setLinks(prev => prev.filter(link => !selectedLinks.has(link._id)));
      setSelectedLinks(new Set());
      toast.success(`${linkIds.length} links deleted successfully!`);
    } catch (error: any) {
      console.error('Error deleting links:', error);
      toast.error('Failed to delete some links');
    }
  };

  const handleBulkTag = async (newTags: string[]) => {
    if (selectedLinks.size === 0) return;

    try {
      const linkIds = Array.from(selectedLinks);
      const updates = { tags: newTags };

      await Promise.all(linkIds.map(id => savedLinksAPI.updateLink(id, updates)));

      setLinks(prev => prev.map(link =>
        selectedLinks.has(link._id)
          ? { ...link, tags: [...new Set([...link.tags, ...newTags])] }
          : link
      ));

      setSelectedLinks(new Set());
      toast.success(`Tags added to ${linkIds.length} links!`);
    } catch (error: any) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    }
  };

  // Handle link selection
  const handleSelectLink = (linkId: string, selected: boolean) => {
    setSelectedLinks(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(linkId);
      } else {
        newSet.delete(linkId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLinks(new Set(filteredLinks.map(link => link._id)));
    } else {
      setSelectedLinks(new Set());
    }
  };

  // Handle visiting link
  const handleVisitLink = async (link: SavedLink) => {
    try {
      // Increment visit count
      await savedLinksAPI.incrementVisitCount(link._id);

      // Update local state
      setLinks(prev => prev.map(l =>
        l._id === link._id
          ? { ...l, visitCount: l.visitCount + 1 }
          : l
      ));

      // Open link in new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error updating visit count:', error);
      // Still open the link even if visit count update fails
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<LinkFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="saved-links-page theme-bg-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your saved links...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="saved-links-page theme-bg-page">
        <div className="container">
          <div className="error-state theme-card">
            <div className="error-icon">😞</div>
            <h2>Failed to Load Links</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button
                onClick={fetchLinks}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-links-page theme-bg-page">
      <div className="container">
        {/* Page Header */}
        <header className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">🔗 Saved Links</h1>
              <p className="page-description">
                Organize and manage your favorite recipe links from social media and websites
              </p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary add-link-btn"
              >
                <span className="btn-icon">➕</span>
                Add Link
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{links.length}</span>
              <span className="stat-label">Total Links</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{filteredLinks.length}</span>
              <span className="stat-label">Filtered</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{selectedLinks.size}</span>
              <span className="stat-label">Selected</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{availableTags.length}</span>
              <span className="stat-label">Tags</span>
            </div>
          </div>
        </header>

        {/* Filters and Controls */}
        <LinkFilters
          filters={filters}
          availableTags={availableTags}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalLinks={filteredLinks.length}
        />

        {/* Bulk Actions */}
        {selectedLinks.size > 0 && (
          <BulkActions
            selectedCount={selectedLinks.size}
            onBulkDelete={handleBulkDelete}
            onBulkTag={handleBulkTag}
            onSelectAll={handleSelectAll}
            availableTags={availableTags}
          />
        )}

        {/* Links Content */}
        <div className="links-content">
          {filteredLinks.length === 0 ? (
            <div className="empty-state theme-card">
              {links.length === 0 ? (
                <>
                  <div className="empty-icon">📝</div>
                  <h2>No saved links yet</h2>
                  <p>Start saving your favorite recipe links to access them quickly!</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                  >
                    Add Your First Link
                  </button>
                </>
              ) : (
                <>
                  <div className="empty-icon">🔍</div>
                  <h2>No links match your filters</h2>
                  <p>Try adjusting your search or filter criteria.</p>
                  <button
                    onClick={() => setFilters({
                      search: '',
                      platform: '',
                      tags: [],
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    })}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className={`links-grid ${viewMode}`}>
              {filteredLinks.map(link => (
                <LinkCard
                  key={link._id}
                  link={link}
                  selected={selectedLinks.has(link._id)}
                  onSelect={(selected) => handleSelectLink(link._id, selected)}
                  onVisit={() => handleVisitLink(link)}
                  onUpdate={(updates) => handleUpdateLink(link._id, updates)}
                  onDelete={() => handleDeleteLink(link._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Link Modal */}
        {showAddModal && (
          <AddLinkModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddLink}
            existingTags={availableTags}
          />
        )}
      </div>
    </div>
  );
};

export default SavedLinks;
