const app = require('./src/app');
const config = require('./src/config');
const clickHouseClient = require('./src/database/clickHouse');

async function startServer() {
  try {
    await clickHouseClient.connect();
    console.log('✅ Analytics service initialized successfully');

    const server = app.listen(config.port, () => {
      console.log(`
🚀 Analytics Microservice running on port ${config.port}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${config.port}/health
🔗 API Documentation: http://localhost:${config.port}/api-docs
✅ Service ready to serve!
      `);
    });

    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🔄 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
