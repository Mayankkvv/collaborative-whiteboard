// Toolbar.jsx
// Now uses Bootstrap button group for Pen/Eraser toggle
// Cleaner layout with visual sections

import React from 'react';

const Toolbar = ({
  tool,
  setTool,
  color,
  setColor,
  strokeSize,
  setStrokeSize,
  onUndo,
  onRedo,
  onClear, // ← NEW: clears the entire canvas
}) => {
  return (
    <div className="toolbar">

      {/* ── UNDO / REDO ── */}
      {/* Bootstrap btn-group keeps these buttons visually joined */}
      <div className="btn-group btn-group-sm" role="group" aria-label="History controls">
        <button
          className="btn btn-outline-secondary toolbar-action-btn"
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
        >
          ↩ Undo
        </button>
        <button
          className="btn btn-outline-secondary toolbar-action-btn"
          onClick={onRedo}
          title="Redo (Ctrl+Y)"
        >
          ↪ Redo
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ── PEN / ERASER TOGGLE ── */}
      {/* Bootstrap btn-group with checked state — visually shows which is active */}
      <div className="btn-group btn-group-sm" role="group" aria-label="Drawing tools">
        <button
          className={`btn toolbar-action-btn ${tool === 'pen' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setTool('pen')}
          title="Pen"
        >
          ✏️ Pen
        </button>
        <button
          className={`btn toolbar-action-btn ${tool === 'eraser' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setTool('eraser')}
          title="Eraser"
        >
          🧹 Eraser
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ── COLOR PICKER ── */}
      {/* Hidden when eraser is active — eraser always draws white */}
      {tool === 'pen' && (
        <div className="toolbar-item">
          <label className="toolbar-label">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-input"
            title="Pick a color"
          />
        </div>
      )}

      {/* ── STROKE SIZE ── */}
      <div className="toolbar-item">
        <label className="toolbar-label">
          Size: <strong>{strokeSize}px</strong>
        </label>
        <input
          type="range"
          min="1"
          max="40"
          value={strokeSize}
          onChange={(e) => setStrokeSize(parseInt(e.target.value))}
          className="size-slider"
          title="Brush size"
        />
      </div>

      {/* ── PREVIEW DOT ── */}
      <div
        className="stroke-preview"
        style={{
          width: `${Math.min(strokeSize, 30)}px`,
          height: `${Math.min(strokeSize, 30)}px`,
          backgroundColor: tool === 'eraser' ? '#cccccc' : color,
        }}
        title="Current brush preview"
      />

      <div className="toolbar-divider" />

      {/* ── CLEAR CANVAS ── */}
      {/* Danger color to signal this is destructive — it clears everything */}
      <button
        className="btn btn-sm btn-outline-danger toolbar-action-btn"
        onClick={onClear}
        title="Clear entire canvas"
      >
        🗑 Clear
      </button>

    </div>
  );
};

export default Toolbar;