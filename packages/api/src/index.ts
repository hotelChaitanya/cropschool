// API Server Entry Point
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', c => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'cropschool-api',
  });
});

// API routes
app.get('/api/status', c => {
  return c.json({ message: 'CropSchool API is running!' });
});

// Default route
app.get('/', c => {
  return c.json({ message: 'Welcome to CropSchool API' });
});

const port = 3005;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
