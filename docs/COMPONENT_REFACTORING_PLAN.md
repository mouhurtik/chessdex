# Component Refactoring Plan

## Goals
- Reduce coupling between analysis UI and engine state.
- Improve routing consistency and navigation behavior.
- Enable reuse of chessboard and move list in other screens.

## Plan
- Extract analysis panel sections into smaller components.
- Introduce a dedicated navigation helper for Games -> Analysis.
- Add a shared hook for loading a game into the analysis board.
