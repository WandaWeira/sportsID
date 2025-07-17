const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Simple script to create a test club user
async function createTestClub() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/sporty"
    );
    console.log("Connected to MongoDB");

    // Define User schema (simplified)
    const userSchema = new mongoose.Schema(
      {
        name: String,
        email: String,
        password: String,
        role: String,
        isVerified: Boolean,
        clubData: {
          name: String,
          location: String,
          foundedYear: Number,
          description: String,
          verified: Boolean,
          website: String,
          tier: String,
          league: String,
          coaches: [String],
          players: [String],
          scouts: [String],
          achievements: [],
          facilities: [String],
        },
      },
      { timestamps: true }
    );

    const User = mongoose.model("User", userSchema);

    // Check if test club already exists
    const existingClub = await User.findOne({ email: "testclub@sporty.com" });
    if (existingClub) {
      console.log("Test club already exists:", existingClub._id);
      console.log("Email: testclub@sporty.com");
      console.log("Password: testpass123");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("testpass123", 12);

    // Create test club user
    const testClub = new User({
      name: "Test Football Club",
      email: "testclub@sporty.com",
      password: hashedPassword,
      role: "club",
      isVerified: true,
      clubData: {
        name: "Test Football Club",
        location: "Manchester, UK",
        foundedYear: 2020,
        description: "A test football club for development purposes.",
        verified: true,
        website: "https://testfc.com",
        tier: "Amateur",
        league: "Test League",
        coaches: [],
        players: [],
        scouts: [],
        achievements: [
          {
            id: "1",
            title: "Test Cup Winner",
            year: 2023,
            description: "Won the local test tournament",
            level: "Regional",
          },
        ],
        facilities: ["Training Ground", "Gym", "Clubhouse"],
      },
    });

    await testClub.save();
    console.log("Test club created successfully!");
    console.log("Club ID:", testClub._id);
    console.log("Email: testclub@sporty.com");
    console.log("Password: testpass123");
    console.log("Role: club");
  } catch (error) {
    console.error("Error creating test club:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createTestClub();
