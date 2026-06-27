import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// 1. Define sub-interfaces for cleaner typing
export interface IComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// 2. Define the main TypeScript Interface for the Issue Document
export interface IIssue extends Document {
  category: string;
  user: Types.ObjectId;
  detail?: string;
  mediaUrl: string[];
  addressText: string;
  location: IGeoJSONPoint;
  
  // AI Triage Data fields
  aiCategory?: string;
  aiSeverity?: number;
  aiDepartment?: string;
  
  upvotesCount: number;
  upvoters: Types.ObjectId[];
  comments: IComment[];
  status: 'REPORTED' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

// 3. Create the Mongoose Schema
const IssueSchema: Schema<IIssue> = new Schema(
  {
    category: { 
      type: String, 
      required: true 
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    detail: { 
      type: String 
    },
    mediaUrl: { 
      type: [String], 
      default:[]
    },
    addressText: { 
      type: String, 
      required: true 
    },
    
    // GeoJSON Location format requirement for MongoDB mapping
    location: {
      type: { 
        type: String, 
        enum: ['Point'], 
        default: 'Point',
        required: true 
      },
      coordinates: { 
        type: [Number], // [longitude, latitude]
        required: true 
      }
    },
    
    // AI Metadata from Google AI Studio
    aiCategory: { type: String },
    aiSeverity: { type: Number },
    aiDepartment: { type: String },
    
    upvotesCount: { 
      type: Number, 
      default: 0 
    },
    upvoters: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    
    // Nested Comments Array Structure
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    
    status: { 
      type: String, 
      enum: ['REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED'], 
      default: 'REPORTED' 
    }
  },
  { 
    timestamps: true 
  }
);

// CRITICAL: Create the 2dsphere index for geolocation lookup
IssueSchema.index({ location: '2dsphere' });

// 4. Export the Model
const Issue: Model<IIssue> = mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
export default Issue;