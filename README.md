# 🎨 Collaborative Whiteboard

A real-time multiplayer drawing app where multiple users can draw on a shared canvas simultaneously. Each room has a unique URL — share it and start drawing together instantly. No account required.

**[Live Demo →](https://collaborative-whiteboard-liard-pi.vercel.app/)** &nbsp;|&nbsp; **[Backend API →](https://whiteboard-server-329x.onrender.com)**


---

## Features

- **Real-time drawing sync** — strokes from any user appear on everyone's canvas instantly via WebSockets
- **Room system** — each whiteboard has a unique URL; rooms are fully isolated from each other
- **Live cursor tracking** — colored dots show every other user's mouse position in real time
- **Pen and eraser** — switch tools with a single click
- **Color picker** — full color spectrum for the pen
- **Stroke size** — adjustable brush thickness with live preview
- **Undo / Redo** — per-user history with `Ctrl+Z` / `Ctrl+Y` keyboard shortcuts
- **Clear canvas** — wipe the board with a confirmation dialog
- **User count** — live badge showing how many people are in the room
- **Copy link** — one click to copy the room URL to clipboard
- **Coordinate normalization** — drawings render correctly across different screen sizes

---

## Tech Stack

**Frontend**
- React 18 (Vite)
- Socket.io Client
- React Router v6
- Bootstrap 5

**Backend**
- Node.js
- Express
- Socket.io

**Deployment**
- Frontend → Vercel
- Backend → Render

---

## Project Structure

```
whiteboard/
├── client/                         # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx          # Drawing logic, undo/redo, socket draw events
│   │   │   ├── Toolbar.jsx         # Pen, eraser, color, size, clear controls
│   │   │   └── Cursor.jsx          # Single remote user cursor dot
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing page — create or join a room
│   │   │   └── RoomPage.jsx        # Whiteboard page — owns tool state and cursor state
│   │   ├── App.jsx                 # Router only
│   │   ├── App.css                 # All custom styles
│   │   ├── main.jsx                # Entry point — mounts app, imports Bootstrap
│   │   └── socket.js               # Shared Socket.io client instance
│   ├── .env                        # Local env vars (not committed)
│   ├── vercel.json                 # SPA rewrite rule for Vercel
│   └── package.json
│
└── server/
    ├── index.js                    # Express + Socket.io server
    └── package.json
```

---

## How It Works

### Drawing sync

```
User draws a stroke segment
        ↓
Canvas.jsx emits 'draw' event with normalized coordinates + room ID
        ↓
Server receives it → socket.to(roomId).emit('draw', data)
        ↓
All other users in the same room receive and render the segment
```

Coordinates are **normalized to 0–1** before being sent (divided by canvas width/height) and scaled back up on receipt. This ensures strokes appear at the correct relative position regardless of screen size.

### Room isolation

Socket.io's built-in room system is used. When a user opens `/room/:roomId`, their client emits `join-room`. The server calls `socket.join(roomId)` and from that point, all draw and cursor events are routed only to that room via `socket.to(roomId).emit(...)`.

### Undo / Redo

The canvas has no built-in memory — it's just pixels. After every completed stroke, a full pixel snapshot (`ImageData`) is saved to a history array. Undo restores the previous snapshot via `putImageData`. Redo moves forward. History is capped at 50 snapshots to limit memory usage.

### Live cursors

Every `mousemove` event emits a normalized cursor position to the server. The server broadcasts it to all other users in the room. Each remote user is represented as a `<Cursor />` component — a colored dot with a label — rendered on a transparent `pointer-events: none` overlay above the canvas so it never blocks drawing.

---

## Local Setup

**Prerequisites:** Node.js 18+ and npm

**1. Clone the repository**

```bash
git clone https://github.com/Mayankkvv/collaborative-whiteboard
cd collaborative-whiteboard
```

**2. Start the backend**

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:3001`

**3. Start the frontend**

Open a second terminal:

```bash
cd client
npm install
```

Create a `.env` file inside `client/`:

```
VITE_SERVER_URL=http://localhost:3001
```

Then run:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

**4. Test locally**

Open `http://localhost:5173` in two browser windows. Create a room in one, join it in the other — drawing in one window should appear in the other.

---

## Environment Variables

### `client/.env` (local development)

| Variable | Description |
|---|---|
| `VITE_SERVER_URL` | Full URL of the backend server |

In Vite, environment variables exposed to the browser must start with `VITE_`. This variable is read in `socket.js` via `import.meta.env.VITE_SERVER_URL`.

### Vercel (production)

Set `VITE_SERVER_URL` to your Render backend URL in the Vercel project dashboard under **Settings → Environment Variables**.

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the **Root Directory** to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Deploy and copy the live URL

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~60 seconds to respond. This is a free tier limitation, not a bug.

### Frontend — Vercel

1. Import your GitHub repository on [Vercel](https://vercel.com)
2. Set the **Root Directory** to `client`
3. Framework preset: `Vite`
4. Add environment variable: `VITE_SERVER_URL` = your Render URL
5. Deploy

`vercel.json` handles SPA routing — all URLs are rewritten to `index.html` so React Router can take over. Without this, refreshing any `/room/:id` URL returns a 404.

---

## Key Design Decisions

**Why Vite instead of Create React App?**
CRA is deprecated. Vite is the current industry standard — faster dev server, faster builds, actively maintained.

**Why normalize drawing coordinates?**
Raw pixel coordinates are screen-size dependent. A point at `x=1500` on a 1920px screen is off-screen on a 1280px screen. Normalizing to `0–1` and scaling on receipt makes drawings look correct everywhere.

**Why `useRef` for `isDrawing` and `lastPos`?**
`useState` triggers a re-render on every change. Mouse events fire 60+ times per second during drawing. Using `useRef` avoids thousands of unnecessary re-renders, keeping drawing smooth and lag-free.

**Why `socket.js` as a separate module?**
If the socket connection were created inside a component, a new connection would be made on every re-render. A module-level singleton ensures the entire app shares one connection.

**Why draw locally before server confirms?**
Waiting for the server to echo back the stroke before rendering it locally adds 50–200ms of visible lag per segment. Local-first rendering keeps your own drawing instant while still syncing to everyone else.

