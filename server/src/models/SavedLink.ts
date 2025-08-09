import mongoose, { Schema, Document } from 'mongoose';

export interface SavedLinkMetadata {
  author?: string;
  duration?: string;
  difficulty?: string;
  servings?: string;
}

export interface SavedLinkDocument extends Document {
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
  metadata?: SavedLinkMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const SavedLinkSchema = new Schema<SavedLinkDocument>(
  {
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Invalid URL format'
      }
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    thumbnail: {
      type: String,
      default: null
    },
    platform: {
      type: String,
      enum: ['instagram', 'tiktok', 'youtube', 'pinterest', 'website', 'other'],
      default: 'other'
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 30
    }],
    userNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    visitCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    userFirebaseUid: {
      type: String,
      required: true,
      index: true
    },
    metadata: {
      author: {
        type: String,
        trim: true
      },
      duration: {
        type: String,
        trim: true
      },
      difficulty: {
        type: String,
        trim: true
      },
      servings: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for performance
SavedLinkSchema.index({ userFirebaseUid: 1, createdAt: -1 });
SavedLinkSchema.index({ userFirebaseUid: 1, platform: 1 });
SavedLinkSchema.index({ userFirebaseUid: 1, tags: 1 });
SavedLinkSchema.index({ title: 'text', description: 'text', userNotes: 'text' });

// Methods
SavedLinkSchema.methods.incrementVisitCount = function() {
  this.visitCount += 1;
  return this.save();
};

// Static methods
SavedLinkSchema.statics.findByUser = function(userFirebaseUid: string) {
  return this.find({ userFirebaseUid }).sort({ createdAt: -1 });
};

SavedLinkSchema.statics.findByUserAndPlatform = function(userFirebaseUid: string, platform: string) {
  return this.find({ userFirebaseUid, platform }).sort({ createdAt: -1 });
};

const SavedLink = mongoose.model<SavedLinkDocument>('SavedLink', SavedLinkSchema);

export default SavedLink;