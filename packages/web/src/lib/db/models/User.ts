import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'parent' | 'child';
  children?: mongoose.Types.ObjectId[];
  parent?: mongoose.Types.ObjectId;
  level?: number;
  points?: number;
  streakDays?: number;
  completedLessons?: string[];
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['parent', 'child'],
      required: true,
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    level: {
      type: Number,
      default: 1,
    },
    points: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    completedLessons: [
      {
        type: String,
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods['comparePassword'] = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this['password']);
};

export default mongoose.models['User'] ||
  mongoose.model<IUser>('User', UserSchema);
