import express, { Request, Response } from 'express';
import SavedLink from '../models/SavedLink.js';
import type { ApiResponse } from '../types/index.js';

const router = express.Router();

// Middleware to extract user from Firebase token
const extractUser = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided'
    });
  }

  // For now, we'll extract the user ID from the token
  // In a real implementation, you'd verify the Firebase token
  try {
    // This is a simplified version - replace with proper Firebase token verification
    const token = authHeader.split(' ')[1];
    // Mock user extraction - replace with actual Firebase verification
    req.userFirebaseUid = 'mock-user-id'; // This should be extracted from verified Firebase token
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token'
    });
  }
};

// GET /api/saved-links - Get all saved links for user
router.get('/', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { search, platform, tags, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = req.query;
    
    let query: any = { userFirebaseUid: req.userFirebaseUid };
    
    // Platform filter
    if (platform && platform !== 'all') {
      query.platform = platform;
    }
    
    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userNotes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const [links, total] = await Promise.all([
      SavedLink.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SavedLink.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: links,
      meta: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching saved links:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved links'
    });
  }
});

// POST /api/saved-links - Create a new saved link
router.post('/', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const {
      url,
      title,
      description = '',
      thumbnail,
      platform = 'other',
      tags = [],
      userNotes = '',
      isPublic = false,
      metadata
    } = req.body;

    // Validate required fields
    if (!url || !title) {
      return res.status(400).json({
        success: false,
        message: 'URL and title are required'
      });
    }

    // Auto-detect platform if not provided
    let detectedPlatform = platform;
    if (platform === 'other' || !platform) {
      try {
        const hostname = new URL(url).hostname.toLowerCase();
        if (hostname.includes('instagram.com')) detectedPlatform = 'instagram';
        else if (hostname.includes('tiktok.com')) detectedPlatform = 'tiktok';
        else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) detectedPlatform = 'youtube';
        else if (hostname.includes('pinterest.com')) detectedPlatform = 'pinterest';
        else detectedPlatform = 'website';
      } catch {
        detectedPlatform = 'other';
      }
    }

    const savedLink = new SavedLink({
      url,
      title: title.trim(),
      description: description.trim(),
      thumbnail,
      platform: detectedPlatform,
      tags: Array.isArray(tags) ? tags.map((tag: string) => tag.trim()).filter(Boolean) : [],
      userNotes: userNotes.trim(),
      isPublic,
      userFirebaseUid: req.userFirebaseUid,
      metadata
    });

    await savedLink.save();

    res.status(201).json({
      success: true,
      data: savedLink,
      message: 'Link saved successfully'
    });
  } catch (error) {
    console.error('Error creating saved link:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving link'
    });
  }
});

// GET /api/saved-links/:id - Get a specific saved link
router.get('/:id', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    
    const savedLink = await SavedLink.findOne({
      _id: id,
      userFirebaseUid: req.userFirebaseUid
    });

    if (!savedLink) {
      return res.status(404).json({
        success: false,
        message: 'Saved link not found'
      });
    }

    res.json({
      success: true,
      data: savedLink
    });
  } catch (error) {
    console.error('Error fetching saved link:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved link'
    });
  }
});

// PUT /api/saved-links/:id - Update a saved link
router.put('/:id', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.userFirebaseUid;
    delete updates.createdAt;
    delete updates.updatedAt;

    const savedLink = await SavedLink.findOneAndUpdate(
      { _id: id, userFirebaseUid: req.userFirebaseUid },
      updates,
      { new: true, runValidators: true }
    );

    if (!savedLink) {
      return res.status(404).json({
        success: false,
        message: 'Saved link not found'
      });
    }

    res.json({
      success: true,
      data: savedLink,
      message: 'Link updated successfully'
    });
  } catch (error) {
    console.error('Error updating saved link:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating link'
    });
  }
});

// DELETE /api/saved-links/:id - Delete a saved link
router.delete('/:id', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    const savedLink = await SavedLink.findOneAndDelete({
      _id: id,
      userFirebaseUid: req.userFirebaseUid
    });

    if (!savedLink) {
      return res.status(404).json({
        success: false,
        message: 'Saved link not found'
      });
    }

    res.json({
      success: true,
      message: 'Link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting saved link:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting link'
    });
  }
});

// POST /api/saved-links/:id/visit - Increment visit count
router.post('/:id/visit', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    const savedLink = await SavedLink.findOneAndUpdate(
      { _id: id, userFirebaseUid: req.userFirebaseUid },
      { $inc: { visitCount: 1 } },
      { new: true }
    );

    if (!savedLink) {
      return res.status(404).json({
        success: false,
        message: 'Saved link not found'
      });
    }

    res.json({
      success: true,
      data: savedLink,
      message: 'Visit count updated'
    });
  } catch (error) {
    console.error('Error updating visit count:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating visit count'
    });
  }
});

// POST /api/saved-links/preview - Get link preview/metadata
router.post('/preview', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // For now, return basic metadata - you can enhance this with actual web scraping
    const hostname = new URL(url).hostname.toLowerCase();
    let platform = 'other';
    
    if (hostname.includes('instagram.com')) platform = 'instagram';
    else if (hostname.includes('tiktok.com')) platform = 'tiktok';
    else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) platform = 'youtube';
    else if (hostname.includes('pinterest.com')) platform = 'pinterest';
    else platform = 'website';

    res.json({
      success: true,
      data: {
        title: `Recipe from ${hostname}`,
        description: 'Recipe link preview',
        platform,
        thumbnail: null,
        metadata: {
          author: null,
          duration: null,
          difficulty: null,
          servings: null
        }
      }
    });
  } catch (error) {
    console.error('Error getting link preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting link preview'
    });
  }
});

// POST /api/saved-links/bulk-delete - Bulk delete links
router.post('/bulk-delete', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { linkIds } = req.body;

    if (!Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Link IDs array is required'
      });
    }

    const result = await SavedLink.deleteMany({
      _id: { $in: linkIds },
      userFirebaseUid: req.userFirebaseUid
    });

    res.json({
      success: true,
      data: { deletedCount: result.deletedCount },
      message: `${result.deletedCount} links deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting links:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting links'
    });
  }
});

// GET /api/saved-links/stats - Get user statistics
router.get('/stats', extractUser, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const [totalLinks, platformStats, tagStats, totalVisits] = await Promise.all([
      SavedLink.countDocuments({ userFirebaseUid: req.userFirebaseUid }),
      SavedLink.aggregate([
        { $match: { userFirebaseUid: req.userFirebaseUid } },
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ]),
      SavedLink.aggregate([
        { $match: { userFirebaseUid: req.userFirebaseUid } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),
      SavedLink.aggregate([
        { $match: { userFirebaseUid: req.userFirebaseUid } },
        { $group: { _id: null, total: { $sum: '$visitCount' } } }
      ])
    ]);

    const linksByPlatform = platformStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const linksByTag = tagStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalLinks,
        linksByPlatform,
        linksByTag,
        totalVisits: totalVisits[0]?.total || 0,
        recentActivity: [] // TODO: Implement recent activity tracking
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting statistics'
    });
  }
});

export default router;
