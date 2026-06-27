// RoomPage.jsx
// Now passes onClear to Toolbar and shows a polished room bar

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import Cursor from '../components/Cursor';
import socket from '../socket';

const CURSOR_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e91e63',
  '#ff5722',
];

const getColorForId = (id) => {
  const total = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return CURSOR_COLORS[total % CURSOR_COLORS.length];
};

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // ── TOOL STATE ──
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [strokeSize, setStrokeSize] = useState(4);
  const [copied, setCopied] = useState(false);

  // ── CURSOR STATE ──
  const [cursors, setCursors] = useState({});

  const canvasRef = useRef(null);

  // ── KEYBOARD SHORTCUTS ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        canvasRef.current?.undo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        canvasRef.current?.redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── CURSOR SOCKET LISTENERS ──
  useEffect(() => {
    const handleCursorMove = (data) => {
      setCursors((prev) => ({
        ...prev,
        [data.socketId]: {
          x: data.x,
          y: data.y,
          color: getColorForId(data.socketId),
        },
      }));
    };

    const handleUserLeft = (data) => {
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[data.socketId];
        return updated;
      });
    };

    socket.on('cursor-move', handleCursorMove);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('cursor-move', handleCursorMove);
      socket.off('user-left', handleUserLeft);
    };
  }, []);

  // ── COPY LINK ──
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── CLEAR CANVAS HANDLER ──
  // Shows a browser confirm dialog before clearing — destructive action
  const handleClear = () => {
    const confirmed = window.confirm(
      'Clear the entire canvas? This cannot be undone for other users.'
    );
    if (confirmed) {
      canvasRef.current?.clearCanvas();
    }
  };

  // ── USER COUNT ──
  const remoteUserCount = Object.keys(cursors).length;
  const totalUsers = remoteUserCount + 1; // +1 for yourself

  return (
    <div className="app">

      {/* ── TOOLBAR ── */}
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeSize={strokeSize}
        setStrokeSize={setStrokeSize}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
        onClear={handleClear}
      />

      {/* ── CURSOR OVERLAY ── */}
      <div className="cursor-overlay">
        {Object.entries(cursors).map(([id, cursor]) => (
          <Cursor
            key={id}
            x={cursor.x}
            y={cursor.y}
            color={cursor.color}
            label={id.substring(0, 6)}
          />
        ))}
      </div>

      {/* ── ROOM BAR ── */}
      <div className="room-bar">

        {/* Room ID with a subtle copy-on-click label */}
        <div className="room-id-section">
          <span className="room-bar-label">Room</span>
          <code className="room-id-code">{roomId}</code>
        </div>

        {/* Live user count — Bootstrap badge */}
        <span className={`badge user-badge ${totalUsers > 1 ? 'badge-live' : 'badge-solo'}`}>
          {totalUsers > 1 ? '🟢' : '⚪'} {totalUsers} {totalUsers === 1 ? 'user' : 'users'}
        </span>

        {/* Copy link button */}
        <button
          className={`btn btn-sm copy-btn ${copied ? 'btn-success' : 'btn-primary'}`}
          onClick={copyLink}
        >
          {copied ? '✅ Copied!' : '🔗 Copy Link'}
        </button>

        {/* Leave room — goes back to home page */}
        <button
          className="btn btn-sm btn-outline-secondary leave-btn"
          onClick={() => navigate('/')}
          title="Leave room and return to home"
        >
          ✕ Leave
        </button>

      </div>

      {/* ── CANVAS ── */}
      <Canvas
        ref={canvasRef}
        tool={tool}
        color={color}
        strokeSize={strokeSize}
        roomId={roomId}
      />

    </div>
  );
};

export default RoomPage;