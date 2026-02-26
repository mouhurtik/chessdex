import { useEffect } from 'react';
import { usePreferencesStore } from '../../stores/preferencesStore';

/**
 * Applies the user's selected board theme by injecting/updating a <style>
 * tag in <head>.
 *
 * Chessground v9 renders the entire 8×8 board using a CSS conic-gradient
 * on the `cg-board::before` pseudo-element (not on `cg-board` itself).
 * The gradient creates a 2×2 tile (dark-light / light-dark) and
 * `background-size: 25% 25%` tiles it across the full board.
 *
 * We override this with the user's chosen theme colors.
 */
export default function BoardThemeInjector() {
    const theme = usePreferencesStore(s => s.getBoardTheme());

    useEffect(() => {
        const STYLE_ID = 'chessdex-board-theme';
        let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

        if (!el) {
            el = document.createElement('style');
            el.id = STYLE_ID;
            document.head.appendChild(el);
        }

        const dark = theme.darkSquare;
        const light = theme.lightSquare;

        el.textContent = `
/* ChessDex board theme: ${theme.name} */

/* The board pattern lives on the ::before pseudo-element */
cg-board::before {
    background-image: conic-gradient(
        ${dark} 25%,
        ${light} 0deg,
        ${light} 50%,
        ${dark} 0deg,
        ${dark} 75%,
        ${light} 0deg
    ) !important;
    background-size: 25% 25% !important;
}

/* Also override the element itself in case some versions use it */
cg-board {
    background-image: conic-gradient(
        ${dark} 25%,
        ${light} 0deg,
        ${light} 50%,
        ${dark} 0deg,
        ${dark} 75%,
        ${light} 0deg
    ) !important;
    background-size: 25% 25% !important;
}

/* Last-move highlight squares */
cg-board square.last-move {
    background-color: ${theme.lastMoveLight} !important;
}

/* Coordinate labels */
coords.ranks coord,
coords.files coord {
    color: ${theme.coordColor} !important;
}
`;
    }, [theme]);

    return null;
}
