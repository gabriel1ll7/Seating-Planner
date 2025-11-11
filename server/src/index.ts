import express from "express";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS middleware
import path from 'path'; // Added path
import { fileURLToPath } from 'url'; // Added url
import db from "./db.js"; // Import the db module

dotenv.config(); // Load environment variables from .env file

// Calculate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use HOSTNAME from env or default to 0.0.0.0 for Fly.io
const HOST = process.env.HOSTNAME || '0.0.0.0';
const PORT = process.env.PORT || 3000;

// ***** ADD THIS MIDDLEWARE *****
app.use((req, res, next) => {
  console.log(`[SERVER] Request received: ${req.method} ${req.originalUrl}`);
  next();
});
// *******************************

// Enable CORS for all origins (for development)
// For production, you might want to configure specific origins:
// app.use(cors({ origin: 'https://yourfrontenddomain.com' }));
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// --- Serve Frontend Static Files ---
const frontendDistPath = path.resolve(__dirname, '../../public_html'); // Path relative to server/dist/index.js
app.use(express.static(frontendDistPath));

// --- API Routes ---
// Basic health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Placeholder for venue routes (to be implemented later)
import venueRoutes from "./routes/venueRoutes.js";
app.use("/api/venues", venueRoutes);

// --- Fallback for SPA Routing ---
// Serve index.html for any non-API routes that don't match static files
app.get('/*fallback' , (req: Request, res: Response) => {
  // Check if it looks like an API call gone wrong
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ message: 'API endpoint not found.' });
    return; // Exit after sending response
  }
  // Otherwise, serve the frontend app
  res.sendFile(path.resolve(frontendDistPath, 'index.html'));
});

// Global error handler (basic example)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.listen(PORT as number, HOST, () => { // Cast PORT to number and specify HOST
  console.log(`Server is running on http://${HOST}:${PORT}`);

  // // Attempt a simple query to test DB connection on startup (COMMENTED OUT)
  // try {
  //   const result = await db.query('SELECT NOW()');
  //   console.log('Database connection test successful:', result.rows[0]);
  // } catch (error) {
  //   console.error('!!! Database connection test failed on startup:', error);
  //   // process.exit(1);
  // }
});

export default app; // Optional: export app for testing or other purposes
