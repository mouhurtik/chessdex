import { create } from 'zustand';
import type { Game } from '@chessdex/shared';
import { parsePgn } from '@chessdex/shared';
import { importPgnFile } from '../lib/fs';

interface PgnFile {
    name: string;         // filename or display name
    path: string;         // full path or identifier
    games: Game[];        // parsed games
    gameCount: number;
}

interface GamesState {
    // Loaded PGN files
    files: PgnFile[];
    activeFileIndex: number | null;
    activeGameIndex: number | null;

    // Current game loaded in analysis board
    currentGame: Game | null;

    // Loading state
    isLoading: boolean;
    error: string | null;

    // Actions
    importFile: () => Promise<void>;
    loadFileContent: (path: string, content: string, name: string) => void;
    selectFile: (index: number) => void;
    selectGame: (fileIndex: number, gameIndex: number) => void;
    clearCurrentGame: () => void;
    removeFile: (index: number) => void;
}

export const useGamesStore = create<GamesState>((set, get) => ({
    files: [],
    activeFileIndex: null,
    activeGameIndex: null,
    currentGame: null,
    isLoading: false,
    error: null,

    importFile: async () => {
        set({ isLoading: true, error: null });
        try {
            const result = await importPgnFile();
            if (!result) {
                set({ isLoading: false });
                return;
            }

            const { path, content } = result;
            const name = path.split(/[/\\]/).pop() || path;
            get().loadFileContent(path, content, name);
        } catch (error: any) {
            set({ error: error?.message || 'Failed to import file', isLoading: false });
        }
    },

    loadFileContent: (path, content, name) => {
        try {
            const games = parsePgn(content);
            const file: PgnFile = {
                name,
                path,
                games,
                gameCount: games.length,
            };

            set((state) => ({
                files: [...state.files, file],
                activeFileIndex: state.files.length,
                isLoading: false,
                error: null,
            }));
        } catch (error: any) {
            set({ error: error?.message || 'Failed to parse PGN', isLoading: false });
        }
    },

    selectFile: (index) => {
        set({ activeFileIndex: index, activeGameIndex: null });
    },

    selectGame: (fileIndex, gameIndex) => {
        const { files } = get();
        const file = files[fileIndex];
        if (!file || gameIndex < 0 || gameIndex >= file.games.length) return;

        set({
            activeFileIndex: fileIndex,
            activeGameIndex: gameIndex,
            currentGame: file.games[gameIndex],
        });
    },

    clearCurrentGame: () => {
        set({ currentGame: null, activeGameIndex: null });
    },

    removeFile: (index) => {
        set((state) => {
            const files = state.files.filter((_, i) => i !== index);
            const activeFileIndex =
                state.activeFileIndex === index
                    ? null
                    : state.activeFileIndex !== null && state.activeFileIndex > index
                        ? state.activeFileIndex - 1
                        : state.activeFileIndex;

            return {
                files,
                activeFileIndex,
                activeGameIndex: state.activeFileIndex === index ? null : state.activeGameIndex,
                currentGame: state.activeFileIndex === index ? null : state.currentGame,
            };
        });
    },
}));
