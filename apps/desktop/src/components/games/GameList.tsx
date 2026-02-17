import React from 'react';
import type { Game } from '@chessdex/shared';

interface GameListProps {
    games: Game[];
    activeIndex: number | null;
    onSelectGame: (index: number) => void;
    fileName?: string;
}

const GameList: React.FC<GameListProps> = ({ games, activeIndex, onSelectGame, fileName }) => {
    if (games.length === 0) {
        return (
            <div className="empty-state">
                <p>No games found</p>
            </div>
        );
    }

    return (
        <div className="game-list">
            {fileName && (
                <div className="game-list-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                    </svg>
                    <span>{fileName}</span>
                    <span className="game-count">{games.length} game{games.length !== 1 ? 's' : ''}</span>
                </div>
            )}
            <div className="game-list-items">
                {games.map((game, index) => {
                    const white = game.headers?.White || 'Unknown';
                    const black = game.headers?.Black || 'Unknown';
                    const result = game.headers?.Result || '*';
                    const date = game.headers?.Date || '';
                    const eco = game.headers?.ECO || '';
                    const event = game.headers?.Event || '';

                    return (
                        <div
                            key={index}
                            className={`game-list-item ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => onSelectGame(index)}
                        >
                            <div className="game-list-players">
                                <span className="game-list-white">
                                    <span className="piece-icon white-icon">♔</span>
                                    {white}
                                </span>
                                <span className="game-list-vs">vs</span>
                                <span className="game-list-black">
                                    <span className="piece-icon black-icon">♚</span>
                                    {black}
                                </span>
                            </div>
                            <div className="game-list-meta">
                                <span className={`game-list-result ${result === '1-0' ? 'white-win' : result === '0-1' ? 'black-win' : 'draw'}`}>
                                    {result}
                                </span>
                                {eco && <span className="game-list-eco">{eco}</span>}
                                {date && <span className="game-list-date">{date}</span>}
                                {event && event !== '?' && <span className="game-list-event">{event}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GameList;
