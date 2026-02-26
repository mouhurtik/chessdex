import { Chess } from 'chess.js';
import type { Square } from 'chess.js';

export function uciToSan(fen: string, uciMoves: string[]): string[] {
    const chess = new Chess(fen);
    const sans: string[] = [];

    for (const uci of uciMoves) {
        if (uci.length < 4) break;
        const from = uci.slice(0, 2) as Square;
        const to = uci.slice(2, 4) as Square;
        const promotion = uci.length > 4 ? uci[4] : undefined;
        try {
            const move = chess.move({ from, to, promotion });
            if (!move) break;
            sans.push(move.san);
        } catch {
            break;
        }
    }

    return sans;
}
