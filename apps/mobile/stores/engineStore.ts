import { create } from 'zustand';

export interface EngineLine {
    depth: number;
    score: number;
    scoreType: 'cp' | 'mate';
    pv: string[];
    pvUci: string;
    nodes: number;
    nps: number;
    multipv: number;
}

interface EngineState {
    isReady: boolean;
    isRunning: boolean;
    error: string | null;
    depth: number;
    multiPV: number;
    lines: EngineLine[];
    currentDepth: number;
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
    isReady: false,
    isRunning: false,
    error: null,
    depth: 22,
    multiPV: 3,
    lines: [],
    currentDepth: 0,
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
