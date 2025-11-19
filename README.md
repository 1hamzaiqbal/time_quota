# time_quota

vibecoded app to visualize impending doom

## Local dev server

1. Install dependencies once:
   ```bash
   npm install
   ```
2. Start Vite:
   ```bash
   npm run dev
   ```
3. Open the printed `http://localhost:5173` link (or `http://your-ip:5173` if you add `-- --host`). Pin the tab in Chrome if you want it always accessible.

The board persists everything (tasks, sessions, history, goals, etc.) into `localStorage` under the `timeblock-tasks` key. Reloading the page or reopening the pinned tab will pick up right where you left off.

## Production build

If you want a static bundle you can host somewhere (or run without the dev server) run:

```bash
npm run build
npm run preview
```

Then open the preview URL. You can also serve the generated `dist/` directory with any static host.
