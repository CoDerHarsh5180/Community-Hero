import mongoose from 'mongoose';

const AuthorityAccessSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  approvalStatus: {
    type: String,
    enum: ['NOT_APPLICABLE', 'PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  assignedCategories: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

export default mongoose.models.AuthorityAccess || mongoose.model('AuthorityAccess', AuthorityAccessSchema);