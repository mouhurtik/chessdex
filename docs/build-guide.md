# Build Guide

## Prerequisites
- Node.js >= 18
- pnpm >= 9
- Rust toolchain for Tauri builds
- Windows: Microsoft C++ Build Tools for Rust if not already installed

## Install
```bash
pnpm install
```

## Desktop Development
```bash
pnpm dev:desktop
```

## Desktop Build
```bash
pnpm build:shared
pnpm build:desktop
```

## Troubleshooting
- If the Tauri dev server fails, ensure port 1420 is free. See [vite.config.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/vite.config.ts#L1-L26).
- If Rust build fails, run `rustup update` and ensure `cargo` is on PATH.
- If builds fail after adding shared changes, run `pnpm build:shared` first.

## Workspace Notes
- `build:shared` compiles the shared package TypeScript into dist. See [packages/shared/package.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/package.json#L14-L18).
- The desktop build runs `tsc` and `vite build` via the app package. See [apps/desktop/package.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/package.json#L7-L11).
- The root `lint` command currently fails because packages do not define `lint` scripts. See [package.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/package.json#L12-L13).
- The `clean` script uses `rm -rf`, which is not Windows-friendly. See [package.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/package.json#L11-L13).

## Mobile App
- The repo does not currently contain `apps/mobile`, so `pnpm dev:mobile` will fail.
- Either add the mobile app or remove the script from the root package.
