import connectDB from '../database/mongodb';
import User from '../db/models/User';

export async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if default user already exists
    const existingUser = await User.findOne({ email: 'parent@example.com' });

    if (!existingUser) {
      // Create default parent user - let the User model hash the password
      const defaultUser = new User({
        email: 'parent@example.com',
        password: 'demo123', // Plain password - will be hashed by pre-save hook
        name: 'Demo Parent',
        role: 'parent',
      });

      await defaultUser.save();
      console.log('Default user created: parent@example.com / demo123');
    } else {
      console.log('Default user already exists');
    }

    // Create a test student user
    const existingStudent = await User.findOne({
      email: 'student@example.com',
    });

    if (!existingStudent) {
      const studentUser = new User({
        email: 'student@example.com',
        password: 'demo123', // Plain password - will be hashed by pre-save hook
        name: 'Demo Student',
        role: 'child',
      });

      await studentUser.save();
      console.log('Default student created: student@example.com / demo123');
    } else {
      console.log('Default student already exists');
    }

    return { success: true };
  } catch (error) {
    console.error('Database seeding failed:', error);
    return { success: false, error };
  }
}
