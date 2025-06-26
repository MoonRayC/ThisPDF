const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectDB();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Auth microservice running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
