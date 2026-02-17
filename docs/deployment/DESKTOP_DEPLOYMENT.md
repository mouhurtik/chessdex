# Desktop Deployment Guide

## Build Pipeline
- Build shared package: `pnpm build:shared`
- Build desktop app: `pnpm build:desktop`

## Tauri Packaging
- Tauri uses `pnpm build` inside `apps/desktop` prior to bundling. See [tauri.conf.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src-tauri/tauri.conf.json#L7-L16).
- Tauri bundles per platform with icons from [src-tauri/icons](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src-tauri/icons).

## Local Release Steps
```bash
pnpm build:shared
pnpm build:desktop
```

## Notes
- Ensure Rust is installed and up to date.
- Confirm `frontendDist` matches the Vite build output. See [tauri.conf.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src-tauri/tauri.conf.json#L7-L16).
