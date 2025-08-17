import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  gameId: string;
  lessonId: string;
  level: number;
  score: number;
  completed: boolean;
  timeSpent: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    score: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
ProgressSchema.index({ userId: 1, gameId: 1, lessonId: 1 });

export default mongoose.models['Progress'] ||
  mongoose.model<IProgress>('Progress', ProgressSchema);
