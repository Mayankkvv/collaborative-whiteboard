// Cursor.jsx
// Renders a single remote user's cursor as a colored dot with a label
// This component is purely visual — it receives position and color as props
// and does nothing else

import React from 'react';

const Cursor = ({ x, y, color, label }) => {
  return (
    <div
      className="remote-cursor"
      style={{
        // Convert 0-1 normalized values back to percentage positions on screen
        // e.g. x=0.5 → left: 50% → horizontally centered
        left: `${x * 100}%`,
        top: `${y * 100}%`,

        // CSS custom property — lets child elements (dot, label) read this color
        // without us having to pass it as a prop to each one
        '--cursor-color': color,
      }}
    >
      {/* The colored circle dot */}
      <div className="cursor-dot" />

      {/* The name tag showing first 6 characters of socket ID */}
      <div className="cursor-label">{label}</div>
    </div>
  );
};

export default Cursor;