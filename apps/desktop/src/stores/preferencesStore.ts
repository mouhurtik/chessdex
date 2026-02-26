import { create } from 'zustand';

/* ─── Board Themes ────────────────────────────────────────── */

export interface BoardTheme {
    id: string;
    name: string;
    lightSquare: string;
    darkSquare: string;
    lastMoveLight: string;
    lastMoveDark: string;
    coordColor: string;
    /** true = available to free users */
    free: boolean;
}

export const BOARD_THEMES: BoardTheme[] = [
    {
        id: 'classic',
        name: 'Classic',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        lastMoveLight: '#cdd26a',
        lastMoveDark: '#aaa23a',
        coordColor: '#8b704a',
        free: true,
    },
    {
        id: 'blue',
        name: 'Ice Blue',
        lightSquare: '#dee3e6',
        darkSquare: '#8ca2ad',
        lastMoveLight: '#a0c4d4',
        lastMoveDark: '#6e98a8',
        coordColor: '#6e8a96',
        free: true,
    },
    {
        id: 'green',
        name: 'Forest',
        lightSquare: '#ffffdd',
        darkSquare: '#86a666',
        lastMoveLight: '#d4e157',
        lastMoveDark: '#8bc34a',
        coordColor: '#6a8c44',
        free: true,
    },
    {
        id: 'purple',
        name: 'Royal',
        lightSquare: '#e8d0ff',
        darkSquare: '#9f6abf',
        lastMoveLight: '#d1a3ff',
        lastMoveDark: '#8a52b0',
        coordColor: '#7a4fa8',
        free: false,
    },
    {
        id: 'dark',
        name: 'Midnight',
        lightSquare: '#6b6966',
        darkSquare: '#413e3b',
        lastMoveLight: '#7a7572',
        lastMoveDark: '#524e4b',
        coordColor: '#888580',
        free: false,
    },
    {
        id: 'walnut',
        name: 'Walnut',
        lightSquare: '#d6c4a8',
        darkSquare: '#8b6e4e',
        lastMoveLight: '#c4b896',
        lastMoveDark: '#7a6040',
        coordColor: '#7a6040',
        free: false,
    },
];

/* ─── Piece Sets ──────────────────────────────────────────── */

export interface PieceSet {
    id: string;
    name: string;
    /** CSS class that chessground expects (matches the theme CSS filename) */
    cssClass: string;
    free: boolean;
}

export const PIECE_SETS: PieceSet[] = [
    { id: 'cburnett', name: 'CBurnett', cssClass: 'cburnett', free: true },
    { id: 'merida', name: 'Merida', cssClass: 'merida', free: true },
    { id: 'alpha', name: 'Alpha', cssClass: 'alpha', free: false },
];

/* ─── Engine Depth Presets ────────────────────────────────── */

export const ENGINE_DEPTH_OPTIONS = [10, 15, 20, 25, 30, 40] as const;

/* ─── Preferences Store ───────────────────────────────────── */

interface PreferencesState {
    boardThemeId: string;
    pieceSetId: string;
    engineDepth: number;
    multiPV: number;
    showCoordinates: boolean;
    showLegalMoves: boolean;
    animationSpeed: 'none' | 'fast' | 'normal' | 'slow';
    boardOrientation: 'white' | 'black';

    // Derived
    getBoardTheme: () => BoardTheme;
    getPieceSet: () => PieceSet;

    // Actions
    setBoardTheme: (id: string) => void;
    setPieceSet: (id: string) => void;
    setEngineDepth: (depth: number) => void;
    setMultiPV: (n: number) => void;
    setShowCoordinates: (show: boolean) => void;
    setShowLegalMoves: (show: boolean) => void;
    setAnimationSpeed: (speed: 'none' | 'fast' | 'normal' | 'slow') => void;
    setBoardOrientation: (o: 'white' | 'black') => void;
}

const STORAGE_KEY = 'chessdex-preferences';

function loadFromStorage(): Partial<PreferencesState> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {};
}

function saveToStorage(state: Partial<PreferencesState>) {
    try {
        const { boardThemeId, pieceSetId, engineDepth, multiPV, showCoordinates, showLegalMoves, animationSpeed, boardOrientation } = state as any;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            boardThemeId, pieceSetId, engineDepth, multiPV,
            showCoordinates, showLegalMoves, animationSpeed, boardOrientation,
        }));
    } catch { /* ignore */ }
}

const saved = loadFromStorage();

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
    boardThemeId: saved.boardThemeId ?? 'classic',
    pieceSetId: saved.pieceSetId ?? 'cburnett',
    engineDepth: (saved as any).engineDepth ?? 20,
    multiPV: (saved as any).multiPV ?? 3,
    showCoordinates: (saved as any).showCoordinates ?? true,
    showLegalMoves: (saved as any).showLegalMoves ?? true,
    animationSpeed: (saved as any).animationSpeed ?? 'normal',
    boardOrientation: (saved as any).boardOrientation ?? 'white',

    getBoardTheme: () => BOARD_THEMES.find(t => t.id === get().boardThemeId) || BOARD_THEMES[0],
    getPieceSet: () => PIECE_SETS.find(p => p.id === get().pieceSetId) || PIECE_SETS[0],

    setBoardTheme: (id) => { set({ boardThemeId: id }); saveToStorage({ ...get(), boardThemeId: id }); },
    setPieceSet: (id) => { set({ pieceSetId: id }); saveToStorage({ ...get(), pieceSetId: id }); },
    setEngineDepth: (depth) => { set({ engineDepth: depth }); saveToStorage({ ...get(), engineDepth: depth }); },
    setMultiPV: (n) => { set({ multiPV: n }); saveToStorage({ ...get(), multiPV: n }); },
    setShowCoordinates: (show) => { set({ showCoordinates: show }); saveToStorage({ ...get(), showCoordinates: show }); },
    setShowLegalMoves: (show) => { set({ showLegalMoves: show }); saveToStorage({ ...get(), showLegalMoves: show }); },
    setAnimationSpeed: (speed) => { set({ animationSpeed: speed }); saveToStorage({ ...get(), animationSpeed: speed }); },
    setBoardOrientation: (o) => { set({ boardOrientation: o }); saveToStorage({ ...get(), boardOrientation: o }); },
}));
