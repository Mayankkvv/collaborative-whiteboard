// Canvas.jsx
// Same as before plus clearCanvas exposed via useImperativeHandle

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import socket from '../socket';

const drawSegment = (ctx, canvas, data) => {
  ctx.beginPath();
  ctx.moveTo(data.from.x * canvas.width, data.from.y * canvas.height);
  ctx.lineTo(data.to.x * canvas.width, data.to.y * canvas.height);
  ctx.strokeStyle = data.strokeStyle;
  ctx.lineWidth = data.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
};

const Canvas = forwardRef(({ tool, color, strokeSize, roomId }, ref) => {

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // ── HISTORY ──
  const history = useRef([]);
  const historyIndex = useRef(-1);

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(snapshot);
    historyIndex.current = history.current.length - 1;
    if (history.current.length > 50) {
      history.current.shift();
      historyIndex.current = history.current.length - 1;
    }
  };

  const undo = () => {
    if (historyIndex.current <= 0) return;
    historyIndex.current -= 1;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(history.current[historyIndex.current], 0, 0);
  };

  const redo = () => {
    if (historyIndex.current >= history.current.length - 1) return;
    historyIndex.current += 1;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(history.current[historyIndex.current], 0, 0);
  };

  // ── CLEAR CANVAS ──
  // Fills the entire canvas with white and saves it as a new history state
  // So you can undo a clear just like any other stroke
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState(); // Save the blank state so Ctrl+Z can restore what was there
  };

  // Expose undo, redo, and clearCanvas to parent components via ref
  useImperativeHandle(ref, () => ({ undo, redo, clearCanvas }));

  // ── CANVAS SETUP ──
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  // ── SOCKET: incoming draw events ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    socket.emit('join-room', roomId);

    const handleRemoteDraw = (data) => {
      drawSegment(ctx, canvas, data);
    };

    socket.on('draw', handleRemoteDraw);

    return () => {
      socket.off('draw', handleRemoteDraw);
    };
  }, [roomId]);

  // ── GET MOUSE POSITION ──
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    const canvas = canvasRef.current;
    const currentPos = getPos(e);

    // Always emit cursor position (even when not drawing)
    socket.emit('cursor-move', {
      x: currentPos.x / canvas.width,
      y: currentPos.y / canvas.height,
      roomId,
    });

    if (!isDrawing.current) return;

    const ctx = canvas.getContext('2d');

    const strokeData = {
      from: {
        x: lastPos.current.x / canvas.width,
        y: lastPos.current.y / canvas.height,
      },
      to: {
        x: currentPos.x / canvas.width,
        y: currentPos.y / canvas.height,
      },
      strokeStyle: tool === 'eraser' ? '#ffffff' : color,
      lineWidth: tool === 'eraser' ? strokeSize * 3 : strokeSize,
      roomId,
    };

    drawSegment(ctx, canvas, strokeData);
    socket.emit('draw', strokeData);

    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    saveState();
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{
        cursor: tool === 'eraser' ? 'cell' : 'crosshair',
        display: 'block',
      }}
    />
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;