# Frontend (React + Vite)

This is the web UI for uploading or recording audio, sending it to the backend for transcription and summarization, and displaying results.

## Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Type-check and build for production
- `npm run preview`: Preview production build
- `npm run lint`, `npm run lint:fix`: Lint code
- `npm run format`: Prettier format

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173`

Ensure the backend is running and configure the backend URL via Vite env vars.

### Backend URL configuration (Vite env)

- Create a `.env` file in the `frontend/` directory with:

  ```
  VITE_BACKEND_URL=http://127.0.0.1:8000
  ```

- In code, access it with `import.meta.env.VITE_BACKEND_URL` (Vite convention). Example:

  ```ts
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const res = await fetch(`${baseUrl}/process-audio/`, { method: 'POST', body: formData });
  ```

Notes:
- Vite only exposes variables prefixed with `VITE_`.
- `.env` files should not be committed (already covered by the root `.gitignore`).
- You can create environment-specific files like `.env.development` and `.env.production`.

## Production Build

```bash
npm run build
npm run preview
```

## Notes

- Audio recording uses the `MediaRecorder` API and works in modern browsers.
- Styling uses Tailwind classes.
