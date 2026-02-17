// Type declarations for packages without built-in types

declare module 'stockfish' {
    interface StockfishEngine {
        postMessage(cmd: string): void;
        addMessageListener(callback: (line: string) => void): void;
    }

    type StockfishFactory = () => Promise<StockfishEngine>;

    const Stockfish: StockfishFactory;
    export default Stockfish;
}
