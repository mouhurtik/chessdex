/**
 * Tauri File System Wrapper for PGN files
 * 
 * Provides functions to open, read, write, and list PGN files
 * using Tauri's native filesystem and dialog APIs.
 * 
 * Note: When running in browser (dev mode without Tauri),
 * these functions will fall back to a demo mode.
 */

// Tauri APIs - these will only work when running inside Tauri
let tauriDialog: typeof import('@tauri-apps/plugin-dialog') | null = null;
let tauriFs: typeof import('@tauri-apps/plugin-fs') | null = null;

async function loadTauriApis() {
    try {
        tauriDialog = await import('@tauri-apps/plugin-dialog');
        tauriFs = await import('@tauri-apps/plugin-fs');
        return true;
    } catch {
        console.warn('Tauri APIs not available — running in browser mode');
        return false;
    }
}

// Initialize on module load
const tauriReady = loadTauriApis();

/**
 * Check if running inside Tauri
 */
export function isTauri(): boolean {
    return !!(window as any).__TAURI_INTERNALS__;
}

/**
 * Open a file dialog to select PGN files
 */
export async function openPgnDialog(): Promise<string | null> {
    await tauriReady;

    if (tauriDialog) {
        const result = await tauriDialog.open({
            title: 'Open PGN File',
            multiple: false,
            filters: [{ name: 'PGN Files', extensions: ['pgn'] }],
        });
        return typeof result === 'string' ? result : null;
    }

    // Browser fallback — use File API
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pgn';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) { resolve(null); return; }
            // Store the file content in sessionStorage so we can read it later
            const content = await file.text();
            const key = `pgn:${file.name}`;
            sessionStorage.setItem(key, content);
            resolve(file.name);
        };
        input.click();
    });
}

/**
 * Read a PGN file from disk
 */
export async function readPgnFile(path: string): Promise<string> {
    await tauriReady;

    if (tauriFs) {
        const bytes = await tauriFs.readFile(path);
        return new TextDecoder().decode(bytes);
    }

    // Browser fallback
    const key = `pgn:${path}`;
    const content = sessionStorage.getItem(key);
    if (content) return content;

    throw new Error(`File not found: ${path}`);
}

/**
 * Write PGN content to a file with save dialog
 */
export async function savePgnDialog(content: string, defaultName?: string): Promise<string | null> {
    await tauriReady;

    if (tauriDialog && tauriFs) {
        const path = await tauriDialog.save({
            title: 'Save PGN File',
            defaultPath: defaultName || 'game.pgn',
            filters: [{ name: 'PGN Files', extensions: ['pgn'] }],
        });
        if (path) {
            await tauriFs.writeFile(path, new TextEncoder().encode(content));
            return path;
        }
        return null;
    }

    // Browser fallback — download via blob
    const blob = new Blob([content], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultName || 'game.pgn';
    a.click();
    URL.revokeObjectURL(url);
    return a.download;
}

/**
 * Read a PGN file and return both path and content
 */
export async function importPgnFile(): Promise<{ path: string; content: string } | null> {
    const path = await openPgnDialog();
    if (!path) return null;

    const content = await readPgnFile(path);
    return { path, content };
}
