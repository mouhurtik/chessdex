import { Chess } from 'chess.js';
import type { Game, GameHeaders, MoveNode, Position } from './types.js';

/**
 * Parse a PGN string containing one or more games.
 * Returns an array of Game objects.
 */
export function parsePgn(pgn: string): Game[] {
    const games: Game[] = [];
    const gameTexts = splitPgnGames(pgn);

    for (const text of gameTexts) {
        try {
            const game = parseSingleGame(text);
            if (game) games.push(game);
        } catch (e) {
            console.warn('Failed to parse game:', e);
        }
    }

    return games;
}

/**
 * Split a multi-game PGN string into individual game texts.
 */
function splitPgnGames(pgn: string): string[] {
    const games: string[] = [];
    const lines = pgn.split('\n');
    let current: string[] = [];
    let inGame = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('[') && !inGame) {
            if (current.length > 0 && current.some(l => l.trim().length > 0)) {
                games.push(current.join('\n'));
            }
            current = [line];
            inGame = true;
        } else if (trimmed === '' && inGame) {
            current.push(line);
            // Check if we've seen a result marker in the current text
            const currentText = current.join('\n');
            if (/(?:1-0|0-1|1\/2-1\/2|\*)\s*$/.test(currentText.trim())) {
                games.push(currentText);
                current = [];
                inGame = false;
            }
        } else {
            current.push(line);
        }
    }

    if (current.length > 0 && current.some(l => l.trim().length > 0)) {
        games.push(current.join('\n'));
    }

    return games;
}

/**
 * Parse a single game PGN text into a Game object.
 */
function parseSingleGame(text: string): Game | null {
    const headers = parseHeaders(text);
    const moveText = extractMoveText(text);

    if (!moveText && Object.keys(headers).length === 0) {
        return null;
    }

    const chess = new Chess();
    const moves = new Map<string, MoveNode>();
    const rootMoveIds: string[] = [];

    // If there's a FEN header, use it as starting position
    if (headers.fen) {
        chess.load(headers.fen);
    }

    const startingPosition: Position = {
        fen: chess.fen(),
    };

    // Parse move text into move tree
    if (moveText) {
        parseMoveText(chess, moveText, moves, rootMoveIds);
    }

    const now = new Date().toISOString();

    return {
        id: generateId(),
        headers,
        startingPosition,
        moves,
        rootMoveIds,
        pgn: text,
        createdAt: now,
        updatedAt: now,
    };
}

/**
 * Parse PGN headers from text.
 */
function parseHeaders(text: string): GameHeaders {
    const headers: GameHeaders = {};
    const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
    let match;

    while ((match = headerRegex.exec(text)) !== null) {
        const key = match[1].toLowerCase();
        headers[key] = match[2];
    }

    // Map standard PGN headers to our typed fields
    return {
        event: headers.event,
        site: headers.site,
        date: headers.date,
        round: headers.round,
        white: headers.white,
        black: headers.black,
        result: headers.result,
        whiteElo: headers.whiteelo,
        blackElo: headers.blackelo,
        eco: headers.eco,
        opening: headers.opening,
        timeControl: headers.timecontrol,
    };
}

/**
 * Extract the move text portion from PGN (after headers).
 */
function extractMoveText(text: string): string {
    // Remove headers
    const withoutHeaders = text.replace(/\[.*?\]\s*/g, '').trim();
    return withoutHeaders;
}

/**
 * Parse move text and build the move tree.
 * For now, handles main line only. Variations (parenthesized) are a future enhancement.
 */
function parseMoveText(
    chess: Chess,
    moveText: string,
    moves: Map<string, MoveNode>,
    rootMoveIds: string[],
    parentId?: string
): void {
    // Strip comments and variations for initial parsing (main line only)
    const cleaned = moveText
        .replace(/\{[^}]*\}/g, '')       // Remove comments
        .replace(/\([^)]*\)/g, '')       // Remove variations (TODO: parse these later)
        .replace(/\$\d+/g, '')           // Remove NAGs
        .replace(/\d+\.{1,3}/g, '')      // Remove move numbers
        .replace(/(?:1-0|0-1|1\/2-1\/2|\*)\s*$/, '') // Remove result
        .trim();

    const sanMoves = cleaned.split(/\s+/).filter(s => s.length > 0);

    let prevId = parentId;
    let moveNumber = 1;
    let colorIndex = 0;

    for (const san of sanMoves) {
        try {
            const move = chess.move(san);
            if (!move) continue;

            const id = generateId();
            const color = move.color;
            if (color === 'w') moveNumber = Math.ceil((colorIndex + 1) / 2);

            const node: MoveNode = {
                id,
                move: move.san,
                from: move.from,
                to: move.to,
                promotion: move.promotion || undefined,
                position: { fen: chess.fen() },
                moveNumber,
                color,
                parent: prevId,
                children: [],
                comment: undefined,
                nag: undefined,
            };

            moves.set(id, node);

            if (!prevId) {
                rootMoveIds.push(id);
            } else {
                const parent = moves.get(prevId);
                if (parent) {
                    parent.children.push(id);
                }
            }

            prevId = id;
            colorIndex++;
        } catch {
            // Skip invalid moves
            continue;
        }
    }
}

/**
 * Convert a Game back to PGN text.
 */
export function gameToPgn(game: Game): string {
    const headerLines: string[] = [];
    const headers = game.headers;

    const headerOrder = ['event', 'site', 'date', 'round', 'white', 'black', 'result'];
    for (const key of headerOrder) {
        const value = headers[key as keyof GameHeaders];
        if (value) {
            const capitalKey = key.charAt(0).toUpperCase() + key.slice(1);
            headerLines.push(`[${capitalKey} "${value}"]`);
        }
    }

    // Build move text from tree (main line)
    const moveText = buildMoveText(game.moves, game.rootMoveIds);
    const result = headers.result || '*';

    return [...headerLines, '', `${moveText} ${result}`, ''].join('\n');
}

function buildMoveText(moves: Map<string, MoveNode>, rootIds: string[]): string {
    const parts: string[] = [];
    let currentIds = rootIds;

    while (currentIds.length > 0) {
        const node = moves.get(currentIds[0]);
        if (!node) break;

        if (node.color === 'w') {
            parts.push(`${node.moveNumber}. ${node.move}`);
        } else {
            if (parts.length === 0) {
                parts.push(`${node.moveNumber}... ${node.move}`);
            } else {
                parts.push(node.move);
            }
        }

        if (node.comment) {
            parts.push(`{${node.comment}}`);
        }

        currentIds = node.children;
    }

    return parts.join(' ');
}

// ─── Utility ────────────────────────────────────────────────────────

let idCounter = 0;

function generateId(): string {
    idCounter++;
    return `m_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

/**
 * Reset the ID counter (useful for testing).
 */
export function resetIdCounter(): void {
    idCounter = 0;
}
