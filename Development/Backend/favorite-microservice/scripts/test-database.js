const mongoose = require('mongoose');
require('dotenv').config();

const testDatabaseConnection = async () => {
  try {
    console.log('🧪 Testing database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Database connection successful!');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    console.log('🔗 Connection host:', mongoose.connection.host);

    // Test basic operations
    console.log('\n🔄 Testing basic operations...');
    
    // Test collection access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));

    // Test index creation
    const db = mongoose.connection.db;
    const favoritesCollection = db.collection('favorites');
    
    // Check if indexes exist
    const indexes = await favoritesCollection.indexes();
    console.log('📇 Existing indexes:', indexes.length);

    // Test creating a sample document (without saving)
    const testDoc = {
      user_id: new mongoose.Types.ObjectId(),
      target_type: 'pdf',
      target_id: new mongoose.Types.ObjectId(),
      created_at: new Date()
    };

    console.log('📄 Test document structure:', testDoc);

    console.log('\n✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testDatabaseConnection();