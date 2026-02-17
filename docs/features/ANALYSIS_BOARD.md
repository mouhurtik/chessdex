# Analysis Board

## Purpose
- Provide a playable chessboard with engine analysis and move navigation.

## Implementation
- Chessboard UI: [Chessboard.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/components/chess/Chessboard.tsx#L1-L218)
- Analysis screen: [AnalysisBoard.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/components/analysis/AnalysisBoard.tsx#L17-L291)
- Engine control: [useEngine.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/hooks/useEngine.ts#L1-L198)

## Known Gaps
- No persistence of analysis lines between sessions.
- No game load flow from the Games list into the analysis board state.
