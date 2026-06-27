// seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Issue from './models/Issue';
import dotenv from 'dotenv'
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

const generateRandomCoordinate = (base: number, variance: number) => {
  return base + (Math.random() - 0.5) * variance;
}

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected! Clearing old data...');

    // Warning: This wipes the existing collections to give you a clean slate
    await User.deleteMany({});
    await Issue.deleteMany({});

    console.log('Generating Users...');
    const usersToCreate = [];
    
    // Create 1 Admin
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    usersToCreate.push({
      name: 'System Admin', username: 'admin_master', email: 'admin@city.com', password: adminPassword,
      role: 'ADMIN', isVerified: true, approvalStatus: 'APPROVED'
    });

    // Create 4 Authorities
    const departments = ['Public Works', 'Sanitation', 'Electricity', 'Water & Sewage'];
    const authorityPassword = await bcrypt.hash('auth123', salt);
    for (let i = 0; i < 4; i++) {
      usersToCreate.push({
        name: `${departments[i]} Worker`, username: `worker_${i}`, email: `worker${i}@city.com`, password: authorityPassword,
        role: 'AUTHORITY', department: departments[i], isVerified: true, approvalStatus: 'APPROVED'
      });
    }

    // Create 15 Citizens
    const citizenPassword = await bcrypt.hash('citizen123', salt);
    for (let i = 1; i <= 15; i++) {
      usersToCreate.push({
        name: `Citizen ${i}`, username: `citizen_${i}`, email: `citizen${i}@city.com`, password: citizenPassword,
        role: 'CITIZEN', isVerified: true, communityPoints: Math.floor(Math.random() * 500)
      });
    }

    const insertedUsers = await User.insertMany(usersToCreate);
    const citizenIds = insertedUsers.filter(u => u.role === 'CITIZEN').map(u => u._id);
    console.log(`Successfully created ${insertedUsers.length} users.`);

    console.log('Generating 100 Issues near Patna...');
    const issuesToCreate = [];
    const categories = ['Pothole', 'Broken Streetlight', 'Illegal Dumping', 'Water Leakage', 'Noise Pollution'];
    const statuses = ['REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED'];

    for (let i = 0; i < 100; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Assign appropriate AI Department based on category
      let aiDept = 'Public Works';
      if (randomCategory === 'Broken Streetlight') aiDept = 'Electricity';
      if (randomCategory === 'Illegal Dumping') aiDept = 'Sanitation';
      if (randomCategory === 'Water Leakage') aiDept = 'Water & Sewage';
      if (randomCategory === 'Noise Pollution') aiDept = 'Law Enforcement';

      // Base Coordinates for Patna: Lat 25.5941, Lng 85.1376
      // Spread them out within roughly a 5-10km radius
      const lat = generateRandomCoordinate(25.5941, 0.1); 
      const lng = generateRandomCoordinate(85.1376, 0.1);

      issuesToCreate.push({
        category: randomCategory,
        user: citizenIds[Math.floor(Math.random() * citizenIds.length)],
        detail: `This is an automated test report for a ${randomCategory}. Needs immediate attention!`,
        mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'], // Dummy image
        addressText: `Test Location ${i}, Patna, Bihar`,
        location: {
          type: 'Point',
          coordinates: [lng, lat], // Longitude first!
        },
        aiCategory: randomCategory,
        aiSeverity: Math.floor(Math.random() * 5) + 1, // Random severity 1-5
        aiDepartment: aiDept,
        status: randomStatus,
        upvotesCount: Math.floor(Math.random() * 20),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Randomize dates over last few months
      });
    }

    await Issue.insertMany(issuesToCreate);
    console.log('Successfully created 100 issues!');

    console.log('Database seeding completed. Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();