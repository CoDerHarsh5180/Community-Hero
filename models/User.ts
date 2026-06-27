import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define the TypeScript Interface representing a User document
export interface IUser extends Document {
  email: string;
  name: string;
  role: 'CITIZEN' | 'AUTHORITY' | 'ADMIN';
  department?: string;
  approvalStatus: 'NOT_APPLICABLE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  communityPoints: number;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  username: string;
  verificationToken: string;
  isVerified: boolean;
}


const UserSchema: Schema<IUser> = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    username:{
      type:String,
      required:true
    },
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    role: { 
      type: String, 
      enum: ['CITIZEN', 'AUTHORITY', 'ADMIN'], 
      default: 'CITIZEN' 
    },
    isVerified:{
      type: Boolean
    },
    verificationToken:{
      type: String
    },
    department: { 
      type: String,
      default: null
    },
    approvalStatus: { 
      type: String, 
      enum: ['NOT_APPLICABLE', 'PENDING', 'APPROVED', 'REJECTED'], 
      default: 'NOT_APPLICABLE' 
    },
    communityPoints: { 
      type: Number, 
      default: 0 
    },
    password:{
        type: String,
        required: true
    }
  },
  { 
    timestamps: true 
  }
);

// 3. Export the Model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;