import mongoose, { Document, Schema } from 'mongoose';

export interface IChild extends Document {
  userId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  subjects: {
    math: { level: number; xp: number; completedLessons: string[] };
    science: { level: number; xp: number; completedLessons: string[] };
    english: { level: number; xp: number; completedLessons: string[] };
  };
  achievements: string[];
  dailyStreak: number;
  lastActiveDate: Date;
  totalPlayTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChildSchema = new Schema<IChild>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjects: {
      math: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        completedLessons: [{ type: String }],
      },
      science: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        completedLessons: [{ type: String }],
      },
      english: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        completedLessons: [{ type: String }],
      },
    },
    achievements: [{ type: String }],
    dailyStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    totalPlayTime: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models['Child'] ||
  mongoose.model<IChild>('Child', ChildSchema);
