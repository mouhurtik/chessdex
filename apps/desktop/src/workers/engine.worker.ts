/**
 * Stockfish Engine Web Worker
 * 
 * Loads Stockfish 18 WASM (lite-single variant, ~7MB) from public/ directory.
 * Pre-fetches the WASM binary to avoid path resolution issues.
 * 
 * Messages IN:  { type: 'init' | 'command', payload?: string }
 * Messages OUT: { type: 'ready' | 'uci-line' | 'error', payload?: string }
 */

/* eslint-disable no-restricted-globals */

const ctx: Worker = self as any;

let sendToEngine: ((cmd: string) => void) | null = null;
let messageQueue: string[] = [];

ctx.onmessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'init':
            initEngine();
            break;
        case 'command':
            if (sendToEngine) {
                sendToEngine(payload);
            } else {
                messageQueue.push(payload);
            }
            break;
    }
};

async function initEngine() {
    try {
        // Step 1: Pre-fetch the WASM binary before loading the JS
        const wasmResponse = await fetch('/stockfish/stockfish.wasm');
        if (!wasmResponse.ok) {
            throw new Error(`Failed to fetch WASM: ${wasmResponse.status} ${wasmResponse.statusText}`);
        }
        const wasmBinary = await wasmResponse.arrayBuffer();

        // Step 2: Load the stockfish JS factory
        (self as any).importScripts('/stockfish/stockfish-18-lite-single.js');

        const Stockfish = (self as any).Stockfish;
        if (typeof Stockfish !== 'function') {
            throw new Error('Stockfish factory not found');
        }

        // Step 3: Create engine with pre-loaded WASM binary
        const engine = await Stockfish({
            wasmBinary: new Uint8Array(wasmBinary),
            listener: (line: string) => {
                ctx.postMessage({ type: 'uci-line', payload: line });
            },
        });

        // Step 4: Set up command interface
        sendToEngine = (cmd: string) => {
            if (engine.processCommand) {
                engine.processCommand(cmd);
            } else if (engine.postMessage) {
                engine.postMessage(cmd);
            }
        };

        // Flush queued commands
        for (const cmd of messageQueue) {
            sendToEngine(cmd);
        }
        messageQueue = [];

        // Initialize UCI protocol
        sendToEngine('uci');
        ctx.postMessage({ type: 'ready' });

    } catch (error: any) {
        ctx.postMessage({
            type: 'error',
            payload: error?.message || 'Failed to initialize Stockfish',
        });
    }
}
