import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const STATE_FILE_PATH = path.join(process.cwd(), 'shield-state.json');

app.use(express.json());

interface ShieldState {
  dailyTargetMinutes: number;
  usedMinutes: number;
  isMonitoring: boolean;
  lastUpdated: number;
  flashlightOn: boolean;
  soundMode: 'ring' | 'vibrate' | 'silent';
}

// Helpers to load & save state
function loadState(): ShieldState {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading state from file, falling back:", error);
  }
  
  return {
    dailyTargetMinutes: 120, // default 2 hours
    usedMinutes: 0,
    isMonitoring: false,
    lastUpdated: Date.now(),
    flashlightOn: false,
    soundMode: 'ring'
  };
}

function saveState(state: ShieldState) {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error saving state to file:", error);
  }
}

// Get State Endpoint with dynamic server-side time tracking recalculation
app.get('/api/shield-state', (req, res) => {
  const state = loadState();
  const now = Date.now();
  
  if (state.isMonitoring) {
    // Calculate elapsed real-world time in minutes since the last timestamp check
    const elapsedMs = now - state.lastUpdated;
    if (elapsedMs > 0) {
      const elapsedMins = elapsedMs / 60000;
      state.usedMinutes = Math.min(state.dailyTargetMinutes, state.usedMinutes + elapsedMins);
      
      if (state.usedMinutes >= state.dailyTargetMinutes) {
        state.isMonitoring = false;
        state.usedMinutes = state.dailyTargetMinutes;
      }
    }
  }
  
  state.lastUpdated = now;
  saveState(state);
  res.json(state);
});

// Update State Endpoint
app.post('/api/shield-state', (req, res) => {
  const current = loadState();
  const { dailyTargetMinutes, usedMinutes, isMonitoring, flashlightOn, soundMode } = req.body;
  const now = Date.now();
  
  // Before overwriting, sync potential time elapsed up to this point
  if (current.isMonitoring) {
    const elapsedMs = now - current.lastUpdated;
    if (elapsedMs > 0) {
      const elapsedMins = elapsedMs / 60000;
      current.usedMinutes = Math.min(current.dailyTargetMinutes, current.usedMinutes + elapsedMins);
    }
  }

  // Merge client requests
  if (dailyTargetMinutes !== undefined) {
    current.dailyTargetMinutes = Number(dailyTargetMinutes);
  }
  if (usedMinutes !== undefined) {
    current.usedMinutes = Number(usedMinutes);
  }
  if (isMonitoring !== undefined) {
    current.isMonitoring = Boolean(isMonitoring);
  }
  if (flashlightOn !== undefined) {
    current.flashlightOn = Boolean(flashlightOn);
  }
  if (soundMode !== undefined) {
    if (soundMode === 'ring' || soundMode === 'vibrate' || soundMode === 'silent') {
      current.soundMode = soundMode;
    }
  }
  
  // Double guard check limits
  if (current.usedMinutes >= current.dailyTargetMinutes) {
    current.isMonitoring = false;
    current.usedMinutes = current.dailyTargetMinutes;
  }
  
  current.lastUpdated = now;
  saveState(current);
  res.json(current);
});

async function startServer() {
  // Vite dev middleware if not in production mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite proxy...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Unbreakable ZenLock backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
