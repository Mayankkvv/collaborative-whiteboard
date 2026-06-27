// main.jsx
// Entry point — mounts the React app
// Bootstrap is imported FIRST so our App.css can override it where needed

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap base styles
import './App.css';                             // Our custom styles (loaded after = higher priority)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);