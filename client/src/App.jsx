// App.jsx
// Now only handles routing — all tool state has moved to RoomPage.jsx
// This is cleaner separation of concerns

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import './App.css';

function App() {
  return (
    // BrowserRouter enables URL-based navigation throughout the app
    <BrowserRouter>
      <Routes>
        {/* Home page: visit localhost:5173 */}
        <Route path="/" element={<HomePage />} />

        {/* Room page: visit localhost:5173/room/abc1234 */}
        {/* :roomId is a URL parameter — react-router extracts it as a variable */}
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;