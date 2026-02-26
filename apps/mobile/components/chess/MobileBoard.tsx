import React, { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../../styles/theme';

type MobileBoardProps = {
  fen?: string;
};

const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function MobileBoard({ fen = defaultFen }: MobileBoardProps) {
  const html = useMemo(
    () => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/chessground@9.2.1/assets/chessground.base.css" />
    <link rel="stylesheet" href="https://unpkg.com/chessground@9.2.1/assets/chessground.cburnett.css" />
    <style>
      html, body, #board { margin: 0; width: 100%; height: 100%; background: ${theme.colors.bgPrimary}; }
      .cg-wrap { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="board"></div>
    <script src="https://unpkg.com/chessground@9.2.1/dist/chessground.min.js"></script>
    <script>
      const board = document.getElementById('board');
      const fen = ${JSON.stringify(fen)};
      Chessground(board, { fen, coordinates: false, movable: { free: false } });
    </script>
  </body>
</html>
        `,
    [fen]
  );

  return (
    <View style={{ width: '100%', aspectRatio: 1, backgroundColor: theme.colors.bgPrimary }}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
      />
    </View>
  );
}
