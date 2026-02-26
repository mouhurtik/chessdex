# ChessDex — Local Development Guide

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (install: `npm install -g pnpm`)
- **Rust toolchain** (for Tauri desktop — optional for web-only dev)

## Install Dependencies

From the project root:

```bash
cd c:\Users\User\Desktop\OpenChess\chessdex
pnpm install
```

This installs all workspace dependencies for shared, desktop, and mobile packages.

---

## Desktop Web App

### Start Dev Server

```bash
pnpm --filter @chessdex/desktop dev
```

Opens at **http://localhost:1420** — includes hot reload.

### Start as Tauri Desktop App

```bash
pnpm --filter @chessdex/desktop tauri dev
```

Launches a native desktop window with full Tauri API access (file system, SQLite, etc.).

### Build for Production

```bash
pnpm --filter @chessdex/shared build
pnpm --filter @chessdex/desktop build
```

---

## Mobile App (Expo)

### Start Development Server

```bash
cd apps/mobile
npx expo start
```

### Run on Device/Emulator

- **iOS Simulator**: Press `i` in the Expo terminal
- **Android Emulator**: Press `a` in the Expo terminal
- **Physical Device**: Scan the QR code with the Expo Go app

### Build for Production

```bash
cd apps/mobile
npx expo build:android  # or build:ios
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm -r build` | Build all packages |
| `pnpm --filter @chessdex/desktop dev` | Desktop dev server |
| `pnpm --filter @chessdex/shared build` | Build shared package |
| `cd apps/desktop && npx tsc --noEmit` | Type check desktop |

---

## Project Structure

```
chessdex/
├── packages/shared/     # @chessdex/shared — types, PGN parser, FEN utils
├── apps/desktop/        # @chessdex/desktop — Vite + React web app (+ Tauri)
└── apps/mobile/         # @chessdex/mobile — Expo React Native app
```
