// socket.js
// Creates the shared Socket.io connection
//
// VITE ENVIRONMENT VARIABLES:
// In Vite, environment variables must start with VITE_ to be accessible in the browser
// import.meta.env.VITE_SERVER_URL reads from:
//   - client/.env during local development
//   - Vercel dashboard environment variables in production
//
// If the variable is not set for any reason, fall back to localhost for safety

import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const socket = io(SERVER_URL);

export default socket;