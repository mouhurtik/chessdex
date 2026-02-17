import { create } from 'zustand';

export interface EngineLine {
    depth: number;
    score: number;          // centipawns (positive = white advantage)
    scoreType: 'cp' | 'mate';
    pv: string[];           // principal variation (SAN would need conversion)
    pvUci: string;          // raw PV string from engine
    nodes: number;
    nps: number;            // nodes per second
    multipv: number;        // line number (1-indexed)
}

interface EngineState {
    // Status
    isReady: boolean;
    isRunning: boolean;
    error: string | null;

    // Configuration
    depth: number;
    multiPV: number;

    // Results
    lines: EngineLine[];
    currentDepth: number;

    // Actions
    setReady: (ready: boolean) => void;
    setRunning: (running: boolean) => void;
    setError: (error: string | null) => void;
    setDepth: (depth: number) => void;
    setMultiPV: (multiPV: number) => void;
    updateLine: (line: EngineLine) => void;
    clearLines: () => void;
    setCurrentDepth: (depth: number) => void;
}

export const useEngineStore = create<EngineState>((set) => ({
    // Status
    isReady: false,
    isRunning: false,
    error: null,

    // Configuration
    depth: 22,
    multiPV: 3,

    // Results
    lines: [],
    currentDepth: 0,

    // Actions
    setReady: (ready) => set({ isReady: ready }),
    setRunning: (running) => set({ isRunning: running }),
    setError: (error) => set({ error }),
    setDepth: (depth) => set({ depth }),
    setMultiPV: (multiPV) => set({ multiPV }),
    updateLine: (line) =>
        set((state) => {
            const lines = [...state.lines];
            const idx = lines.findIndex((l) => l.multipv === line.multipv);
            if (idx >= 0) {
                lines[idx] = line;
            } else {
                lines.push(line);
                lines.sort((a, b) => a.multipv - b.multipv);
            }
            return { lines, currentDepth: Math.max(state.currentDepth, line.depth) };
        }),
    clearLines: () => set({ lines: [], currentDepth: 0 }),
    setCurrentDepth: (depth) => set({ currentDepth: depth }),
}));

/**
 * Parse a UCI "info" line into an EngineLine object.
 * Example: "info depth 20 seldepth 30 multipv 1 score cp 32 nodes 1234567 nps 2345678 pv e2e4 e7e5"
 */
export function parseInfoLine(line: string): EngineLine | null {
    if (!line.startsWith('info') || !line.includes('score') || !line.includes(' pv ')) {
        return null;
    }

    const tokens = line.split(' ');
    const get = (key: string): string | undefined => {
        const idx = tokens.indexOf(key);
        return idx >= 0 && idx + 1 < tokens.length ? tokens[idx + 1] : undefined;
    };

    const depth = parseInt(get('depth') || '0', 10);
    const multipv = parseInt(get('multipv') || '1', 10);
    const nodes = parseInt(get('nodes') || '0', 10);
    const nps = parseInt(get('nps') || '0', 10);

    // Parse score
    const scoreIdx = tokens.indexOf('score');
    let score = 0;
    let scoreType: 'cp' | 'mate' = 'cp';
    if (scoreIdx >= 0 && scoreIdx + 2 < tokens.length) {
        scoreType = tokens[scoreIdx + 1] as 'cp' | 'mate';
        score = parseInt(tokens[scoreIdx + 2], 10);
    }

    // Parse PV
    const pvIdx = tokens.indexOf('pv');
    const pv = pvIdx >= 0 ? tokens.slice(pvIdx + 1) : [];
    const pvUci = pv.join(' ');

    return { depth, score, scoreType, pv, pvUci, nodes, nps, multipv };
}

/**
 * Format a centipawn score for display.
 * e.g., 32 → "+0.32", -150 → "−1.50", mate 3 → "M3"
 */
export function formatScore(score: number, scoreType: 'cp' | 'mate'): string {
    if (scoreType === 'mate') {
        return score > 0 ? `M${score}` : `M${score}`;
    }
    const val = score / 100;
    const sign = val > 0 ? '+' : val < 0 ? '' : '';
    return `${sign}${val.toFixed(2)}`;
}

/**
 * Get CSS class for score coloring.
 */
export function scoreClass(score: number, scoreType: 'cp' | 'mate'): 'positive' | 'negative' | 'neutral' {
    if (scoreType === 'mate') {
        return score > 0 ? 'positive' : 'negative';
    }
    if (score > 15) return 'positive';
    if (score < -15) return 'negative';
    return 'neutral';
}
