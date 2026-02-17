import { useEffect, useRef, useCallback } from 'react';
import { useEngineStore, parseInfoLine } from '../stores/engineStore';

/**
 * React hook for controlling the Stockfish engine.
 * 
 * The stockfish npm package provides a standalone JS file that runs as its own
 * Web Worker — it auto-detects the worker environment and sets up UCI message
 * passing via postMessage/onmessage. We use it directly as the Worker URL.
 * 
 * Key: We must wait for 'readyok' after 'stop' before sending new commands,
 * otherwise the lite WASM build will crash with RuntimeError: unreachable.
 */
export function useEngine() {
    const workerRef = useRef<Worker | null>(null);
    const currentFenRef = useRef<string>('');
    const pendingFenRef = useRef<string | null>(null);
    const waitingForReadyRef = useRef(false);

    const {
        isReady, isRunning, error, depth, multiPV, lines, currentDepth,
        setReady, setRunning, setError, clearLines, updateLine, setCurrentDepth,
    } = useEngineStore();

    // Internal: start analysis for a given FEN (only call when engine is idle/ready)
    const startAnalysis = useCallback((fen: string, worker: Worker) => {
        const d = useEngineStore.getState().depth;
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(`go depth ${d}`);
        setRunning(true);
    }, [setRunning]);

    // Initialize engine worker
    useEffect(() => {
        const worker = new Worker('/stockfish/stockfish-18-lite-single.js');

        let uciOk = false;

        worker.onmessage = (event) => {
            const line = typeof event.data === 'string' ? event.data : event.data?.toString();
            if (!line) return;

            // UCI handshake completed
            if (line === 'uciok') {
                uciOk = true;
                setReady(true);
                setError(null);
                // Configure defaults
                worker.postMessage('setoption name MultiPV value 3');
                worker.postMessage('isready');
                return;
            }

            if (line === 'readyok') {
                // If we were waiting for ready after a stop, now start the pending analysis
                if (waitingForReadyRef.current) {
                    waitingForReadyRef.current = false;
                    const pendingFen = pendingFenRef.current;
                    pendingFenRef.current = null;
                    if (pendingFen) {
                        currentFenRef.current = pendingFen;
                        clearLines();
                        startAnalysis(pendingFen, worker);
                    }
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

            // bestmove means search finished
            if (line.startsWith('bestmove')) {
                setRunning(false);
                // If a new position came in while we were searching, analyze it now
                const pendingFen = pendingFenRef.current;
                if (pendingFen) {
                    pendingFenRef.current = null;
                    currentFenRef.current = pendingFen;
                    clearLines();
                    startAnalysis(pendingFen, worker);
                }
            }
        };

        worker.onerror = (err) => {
            setError(err.message || 'Engine error');
            setReady(false);
        };

        workerRef.current = worker;

        // Start UCI handshake
        worker.postMessage('uci');

        return () => {
            worker.postMessage('quit');
            worker.terminate();
            workerRef.current = null;
            setReady(false);
            setRunning(false);
        };
    }, []);

    // Send UCI command
    const sendCommand = useCallback((cmd: string) => {
        workerRef.current?.postMessage(cmd);
    }, []);

    // Set position and start analysis (safe — waits for engine to be ready)
    const setPosition = useCallback((fen: string) => {
        const worker = workerRef.current;
        if (!worker) return;

        const storeState = useEngineStore.getState();

        // If engine is currently running or waiting for ready, queue this FEN
        if (storeState.isRunning || waitingForReadyRef.current) {
            pendingFenRef.current = fen;
            // Send stop if running (readyok handler will pick up the pending FEN)
            if (storeState.isRunning) {
                worker.postMessage('stop');
                worker.postMessage('isready');
                waitingForReadyRef.current = true;
                setRunning(false);
            }
            return;
        }

        // Engine is idle — start immediately
        currentFenRef.current = fen;
        clearLines();
        startAnalysis(fen, worker);
    }, [sendCommand, clearLines, setRunning, startAnalysis]);

    // Stop analysis
    const stop = useCallback(() => {
        const worker = workerRef.current;
        if (!worker) return;
        worker.postMessage('stop');
        worker.postMessage('isready');
        waitingForReadyRef.current = true;
        pendingFenRef.current = null; // Cancel any pending
        setRunning(false);
    }, [setRunning]);

    // Start analysis on current position
    const start = useCallback(() => {
        if (currentFenRef.current) {
            setPosition(currentFenRef.current);
        }
    }, [setPosition]);

    // Update multiPV setting
    const updateMultiPV = useCallback((newMultiPV: number) => {
        const worker = workerRef.current;
        if (!worker) return;

        const wasRunning = useEngineStore.getState().isRunning;
        if (wasRunning) {
            worker.postMessage('stop');
        }

        useEngineStore.getState().setMultiPV(newMultiPV);
        worker.postMessage(`setoption name MultiPV value ${newMultiPV}`);

        // Queue re-analysis after ready
        if (currentFenRef.current) {
            pendingFenRef.current = currentFenRef.current;
            worker.postMessage('isready');
            waitingForReadyRef.current = true;
            setRunning(false);
        }
    }, [setRunning]);

    return {
        // State
        isReady,
        isRunning,
        error,
        lines,
        currentDepth,
        depth,
        multiPV,

        // Actions
        setPosition,
        start,
        stop,
        sendCommand,
        updateMultiPV,
    };
}
