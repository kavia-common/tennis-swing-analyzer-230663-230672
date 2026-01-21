# tennis-swing-analyzer-230663-230672

## Tennis Swing Frontend (React)

This repo contains a lightweight React (CRA) frontend that lets you upload a tennis swing video and view estimated:

- Swing direction (forehand / backhand / neutral)
- Swing angle (degrees)
- Swing speed (mph)

### Running

```bash
cd tennis_swing_frontend
npm start
```

Open http://localhost:3000

### Backend API integration (optional)

The frontend will try to call a backend endpoint:

- `POST {BASE_URL}/analyze` using `multipart/form-data` with field name `file`

Configure the backend base URL via either of:

- `REACT_APP_API_BASE` (preferred)
- `REACT_APP_BACKEND_URL` (fallback)

If neither is set, the app runs fully in **Demo mode**.

### Demo mode behavior

- If no backend URL is configured, **Demo Analysis** is used automatically.
- If a backend is configured but the request fails, the UI falls back to **Demo Analysis** so the app remains usable.
- Demo results are deterministic based on the uploaded filename (so you can test repeatably).

### Expected backend response

The UI expects JSON fields similar to:

```json
{ "direction": "forehand", "angle": 28, "speed": 78, "feedback": "..." }
```

It also defensively accepts alternative key names like `swing_direction`, `swingAngle`, `swing_speed`, etc.
