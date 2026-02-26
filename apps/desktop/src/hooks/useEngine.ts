import { useEffect, useRef, useCallback } from 'react';
import { useEngineStore, parseInfoLine } from '../stores/engineStore';

/**
 * Engine state machine to prevent WASM crashes.
 * 
 * The Stockfish lite WASM build crashes with "RuntimeError: unreachable" when 
 * it receives `position`, `go`, or `setoption` while a search is in progress.
 * 
 * State transitions:
 *   IDLE  ──(go)──►  SEARCHING
 *   SEARCHING ──(stop)──►  STOPPING
 *   STOPPING  ──(bestmove)──►  CONFIGURING
 *   CONFIGURING ──(readyok)──►  IDLE  (then process queue)
 *   IDLE ──(setoption+isready)──► CONFIGURING
 */

type EnginePhase = 'IDLE' | 'SEARCHING' | 'STOPPING' | 'CONFIGURING';

interface PendingAction {
    type: 'analyze' | 'setOption';
    fen?: string;
    option?: string;
    value?: string | number;
}

export function useEngine() {
    const workerRef = useRef<Worker | null>(null);
    const phaseRef = useRef<EnginePhase>('IDLE');
    const currentFenRef = useRef<string>('');
    const queueRef = useRef<PendingAction[]>([]);

    const {
        isReady, isRunning, error, depth, multiPV, lines, currentDepth,
        setReady, setRunning, setError, clearLines, updateLine, setCurrentDepth,
    } = useEngineStore();

    // ── Process the next queued action ──────────────────────────
    const processQueue = useCallback((worker: Worker) => {
        if (phaseRef.current !== 'IDLE') return;

        const queue = queueRef.current;
        if (queue.length === 0) return;

        // Collect all setOption actions first, then the last analyze action
        const optionActions: PendingAction[] = [];
        let analyzeAction: PendingAction | null = null;

        // Drain queue — only keep the LAST analyze request (skip intermediate ones)
        while (queue.length > 0) {
            const action = queue.shift()!;
            if (action.type === 'setOption') {
                optionActions.push(action);
            } else if (action.type === 'analyze') {
                analyzeAction = action; // always overwrite — latest position wins
            }
        }

        // Send all option changes  
        if (optionActions.length > 0) {
            for (const opt of optionActions) {
                worker.postMessage(`setoption name ${opt.option} value ${opt.value}`);
            }
        }

        // If we have a position to analyze, send it
        if (analyzeAction && analyzeAction.fen) {
            currentFenRef.current = analyzeAction.fen;
            clearLines();
            const d = useEngineStore.getState().depth;
            worker.postMessage(`position fen ${analyzeAction.fen}`);
            worker.postMessage(`go depth ${d}`);
            phaseRef.current = 'SEARCHING';
            setRunning(true);
        } else if (optionActions.length > 0) {
            // Options changed but no analyze — send isready to confirm, then re-analyze current position
            if (currentFenRef.current) {
                // Queue re-analysis of current position
                queueRef.current.push({ type: 'analyze', fen: currentFenRef.current });
            }
            worker.postMessage('isready');
            phaseRef.current = 'CONFIGURING';
        }
    }, [clearLines, setRunning]);

    // ── Request engine to stop, then process queue ──────────────
    const requestStop = useCallback((worker: Worker) => {
        if (phaseRef.current === 'SEARCHING') {
            worker.postMessage('stop');
            phaseRef.current = 'STOPPING';
            setRunning(false);
        }
        // If already STOPPING or CONFIGURING, just wait — queue will be processed eventually
    }, [setRunning]);

    // ── Initialize engine worker ────────────────────────────────
    useEffect(() => {
        const worker = new Worker('/stockfish/stockfish-18-lite-single.js');

        worker.onmessage = (event) => {
            const line = typeof event.data === 'string' ? event.data : event.data?.toString();
            if (!line) return;

            // UCI handshake completed
            if (line === 'uciok') {
                setReady(true);
                setError(null);
                // Configure defaults — engine is idle at this point
                worker.postMessage('setoption name MultiPV value 3');
                worker.postMessage('isready');
                phaseRef.current = 'CONFIGURING';
                return;
            }

            // Engine confirmed it's ready
            if (line === 'readyok') {
                if (phaseRef.current === 'CONFIGURING') {
                    phaseRef.current = 'IDLE';
                    processQueue(worker);
                }
                return;
            }

            // Parse info lines for eval data
            if (line.startsWith('info')) {
                const parsed = parseInfoLine(line);
                if (parsed) {
                    updateLine(parsed);
                    setCurrentDepth(parsed.depth);
                }
            }

            // Search finished
            if (line.startsWith('bestmove')) {
                setRunning(false);
                if (phaseRef.current === 'SEARCHING' || phaseRef.current === 'STOPPING') {
                    // Send isready to ensure engine is fully settled before next command
                    worker.postMessage('isready');
                    phaseRef.current = 'CONFIGURING';
                }
            }
        };

        worker.onerror = (err) => {
            setError(err.message || 'Engine error');
            setReady(false);
            phaseRef.current = 'IDLE';
        };

        workerRef.current = worker;
        worker.postMessage('uci');

        return () => {
            worker.postMessage('quit');
            worker.terminate();
            workerRef.current = null;
            phaseRef.current = 'IDLE';
            queueRef.current = [];
            setReady(false);
            setRunning(false);
        };
    }, []);

    // ── Public API ──────────────────────────────────────────────

    const sendCommand = useCallback((cmd: string) => {
        workerRef.current?.postMessage(cmd);
    }, []);

    const setPosition = useCallback((fen: string) => {
        const worker = workerRef.current;
        if (!worker) return;

        // Queue this analysis request
        queueRef.current.push({ type: 'analyze', fen });

        if (phaseRef.current === 'SEARCHING') {
            // Stop current search — bestmove → readyok → processQueue will pick up the new FEN
            requestStop(worker);
        } else if (phaseRef.current === 'IDLE') {
            processQueue(worker);
        }
        // If STOPPING or CONFIGURING, just wait — processQueue will fire when ready
    }, [processQueue, requestStop]);

    const stop = useCallback(() => {
        const worker = workerRef.current;
        if (!worker) return;
        queueRef.current = []; // Cancel all pending
        if (phaseRef.current === 'SEARCHING') {
            requestStop(worker);
        }
        setRunning(false);
    }, [setRunning, requestStop]);

    const start = useCallback(() => {
        if (currentFenRef.current) {
            setPosition(currentFenRef.current);
        }
    }, [setPosition]);

    const updateMultiPV = useCallback((newMultiPV: number) => {
        const worker = workerRef.current;
        if (!worker) return;

        useEngineStore.getState().setMultiPV(newMultiPV);

        // Queue the option change + re-analysis
        queueRef.current.push({ type: 'setOption', option: 'MultiPV', value: newMultiPV });
        if (currentFenRef.current) {
            queueRef.current.push({ type: 'analyze', fen: currentFenRef.current });
        }

        if (phaseRef.current === 'SEARCHING') {
            requestStop(worker);
        } else if (phaseRef.current === 'IDLE') {
            processQueue(worker);
        }

        clearLines();
    }, [clearLines, processQueue, requestStop]);

    return {
        isReady, isRunning, error, lines, currentDepth, depth, multiPV,
        setPosition, start, stop, sendCommand, updateMultiPV,
    };
}
