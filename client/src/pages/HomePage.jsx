// HomePage.jsx
// Redesigned with Bootstrap for a clean, professional first impression

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const generateRoomId = () => Math.random().toString(36).substring(2, 9);

const HomePage = () => {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState(''); // Show error if user clicks Join with empty input

  const createRoom = () => {
    const roomId = generateRoomId();
    navigate(`/room/${roomId}`);
  };

  const joinRoom = () => {
    const trimmed = joinId.trim();
    if (!trimmed) {
      setError('Please enter a room ID first.');
      return;
    }
    setError('');
    navigate(`/room/${trimmed}`);
  };

  return (
    <div className="home">
      <div className="home-card">

        {/* ── HEADER ── */}
        <div className="home-header">
          <div className="home-icon">🎨</div>
          <h1 className="home-title">Collaborative Whiteboard</h1>
          <p className="home-subtitle">
            Draw together in real time. Share a link, open it anywhere, and
            see everyone's strokes appear live on the same canvas.
          </p>
        </div>

        {/* ── FEATURE PILLS ── */}
        {/* Bootstrap badges used as feature highlights */}
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <span className="badge feature-badge">✏️ Pen & Eraser</span>
          <span className="badge feature-badge">↩ Undo / Redo</span>
          <span className="badge feature-badge">🎨 Color Picker</span>
          <span className="badge feature-badge">👥 Live Cursors</span>
          <span className="badge feature-badge">🔗 Shareable Link</span>
        </div>

        {/* ── DIVIDER ── */}
        <hr className="home-hr" />

        {/* ── CREATE ROOM ── */}
        <button
          className="btn btn-primary btn-lg w-100 create-btn"
          onClick={createRoom}
        >
          + Create New Room
        </button>

        {/* ── OR DIVIDER ── */}
        <div className="home-or">
          <span>or join an existing room</span>
        </div>

        {/* ── JOIN ROOM ── */}
        {/* Bootstrap input group keeps input and button visually joined */}
        <div className="input-group">
          <input
            type="text"
            className={`form-control join-input ${error ? 'is-invalid' : ''}`}
            placeholder="Enter Room ID (e.g. k3n2p8a)"
            value={joinId}
            onChange={(e) => {
              setJoinId(e.target.value);
              if (error) setError(''); // Clear error as soon as user types
            }}
            onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
          />
          <button
            className="btn btn-outline-primary join-btn"
            onClick={joinRoom}
          >
            Join →
          </button>
          {/* Bootstrap's invalid feedback — only shows when is-invalid class is set */}
          {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>

        {/* ── FOOTER NOTE ── */}
        <p className="home-note">
          No account needed. Rooms are temporary and reset when everyone leaves.
        </p>

      </div>
    </div>
  );
};

export default HomePage;