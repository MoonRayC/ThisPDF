require('dotenv').config(); 
const database = require('../src/config/database'); 

(async () => {
  console.log('🔍 Checking MongoDB connection...');

  try {
    await database.connect();

    const isConnected = database.isConnected();
    if (isConnected) {
      console.log('✅ MongoDB is connected and ready to use!');
    } else {
      console.warn('⚠️ MongoDB is not connected.');
    }

    await database.disconnect();
  } catch (err) {
    console.error('❌ Error during MongoDB check:', err.message);
    process.exit(1);
  }
})();
