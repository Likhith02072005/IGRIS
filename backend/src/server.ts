import app from './app';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`IGRIS - ORCHESTRATION BACKEND ACTIVE`);
  console.log(`Port: ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Express HTTP server closed.');
    process.exit(0);
  });
});
