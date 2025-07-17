require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sporty';

async function checkClub() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const clubId = '68701f824020870e8dc7f8a8';
    console.log(`Looking for club with ID: ${clubId}`);
    
    const club = await User.findOne({ _id: clubId, role: 'club' });
    
    if (club) {
      console.log('Club found:', {
        id: club._id,
        name: club.name,
        email: club.email,
        role: club.role,
        hasClubData: !!club.clubData,
        clubName: club.clubData?.name
      });
    } else {
      console.log('Club not found');
      
      // Let's see what clubs exist
      const allClubs = await User.find({ role: 'club' });
      console.log('\nExisting clubs:');
      allClubs.forEach(club => {
        console.log(`- ID: ${club._id}, Email: ${club.email}, Name: ${club.name}, ClubName: ${club.clubData?.name || 'No club data'}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkClub();
