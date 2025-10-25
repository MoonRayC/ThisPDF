const pool = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

const seedData = [
  {
    user_id: uuidv4(),
    username: 'johndoe',
    bio: 'Software developer passionate about building great user experiences.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  },
  {
    user_id: uuidv4(),
    username: 'janedoe',
    bio: 'Digital marketing specialist and content creator.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b9e3?w=400'
  },
  {
    user_id: uuidv4(),
    username: 'techguru',
    bio: 'Tech enthusiast exploring the latest in AI and machine learning.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    user_id: uuidv4(),
    username: 'designpro',
    bio: 'UI/UX designer creating beautiful and functional interfaces.',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
  },
  {
    user_id: uuidv4(),
    username: 'codemaster',
    bio: 'Full-stack developer with 10+ years of experience in web development.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
  }
];

const seedProfiles = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if profiles already exist
    const existingProfiles = await pool.query('SELECT COUNT(*) as count FROM user_profiles');
    const profileCount = parseInt(existingProfiles.rows[0].count);
    
    if (profileCount > 0) {
      console.log(`⚠️  Database already contains ${profileCount} profiles`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        readline.question('Do you want to continue seeding? This will add more test data. (y/N): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled');
        return;
      }
    }
    
    console.log(`📝 Inserting ${seedData.length} test profiles...`);
    
    for (const profileData of seedData) {
      try {
        const query = `
          INSERT INTO user_profiles (user_id, username, bio, avatar_url, last_active_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (username) DO NOTHING
          RETURNING username;
        `;
        
        const result = await pool.query(query, [
          profileData.user_id,
          profileData.username,
          profileData.bio,
          profileData.avatar_url
        ]);
        
        if (result.rows.length > 0) {
          console.log(`  ✅ Created profile: ${profileData.username}`);
        } else {
          console.log(`  ⚠️  Profile already exists: ${profileData.username}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Failed to create profile ${profileData.username}:`, error.message);
      }
    }
    
    // Display final count
    const finalCount = await pool.query('SELECT COUNT(*) as count FROM user_profiles');
    const totalProfiles = parseInt(finalCount.rows[0].count);
    
    console.log(`🎉 Seeding completed! Total profiles in database: ${totalProfiles}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

const clearProfiles = async () => {
  try {
    console.log('🧹 Clearing all profile data...');
    
    const result = await pool.query('DELETE FROM user_profiles RETURNING username');
    const deletedCount = result.rows.length;
    
    console.log(`✅ Deleted ${deletedCount} profiles`);
    
    // Reset the sequence
    await pool.query('ALTER SEQUENCE user_profiles_id_seq RESTART WITH 1');
    console.log('✅ Reset ID sequence');
    
  } catch (error) {
    console.error('❌ Failed to clear profiles:', error);
    throw error;
  }
};

// Handle command line arguments
const command = process.argv[2];

const main = async () => {
  try {
    switch (command) {
      case 'clear':
        await clearProfiles();
        break;
      case 'fresh':
        await clearProfiles();
        await seedProfiles();
        break;
      default:
        await seedProfiles();
        break;
    }
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { seedProfiles, clearProfiles };