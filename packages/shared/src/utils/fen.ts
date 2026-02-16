import { Chess } from 'chess.js';

/**
 * Validate a FEN string.
 */
export function isValidFen(fen: string): boolean {
    try {
        new Chess(fen);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get the starting position FEN.
 */
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/**
 * Extract just the piece placement from a FEN.
 */
export function fenToPlacement(fen: string): string {
    return fen.split(' ')[0];
}

/**
 * Check if a FEN represents a checkmate position.
 */
export function isCheckmate(fen: string): boolean {
    try {
        const chess = new Chess(fen);
        return chess.isCheckmate();
    } catch {
        return false;
    }
}

/**
 * Check if a FEN represents a stalemate position.
 */
export function isStalemate(fen: string): boolean {
    try {
        const chess = new Chess(fen);
        return chess.isStalemate();
    } catch {
        return false;
    }
}

/**
 * Get the side to move from a FEN.
 */
export function sideToMove(fen: string): 'w' | 'b' {
    const parts = fen.split(' ');
    return (parts[1] as 'w' | 'b') || 'w';
}

/**
 * Get the full move number from a FEN.
 */
export function fullMoveNumber(fen: string): number {
    const parts = fen.split(' ');
    return parseInt(parts[5] || '1', 10);
}
