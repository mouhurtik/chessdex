import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parsePgn } from '@chessdex/shared';
import { theme } from '../../styles/theme';

export default function GamesScreen() {
    const [fileName, setFileName] = useState<string | null>(null);
    const [gamesCount, setGamesCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const importPgn = async () => {
        try {
            setError(null);
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/x-chess-pgn', 'text/plain'],
                copyToCacheDirectory: true,
            });
            if (result.canceled || result.assets.length === 0) return;
            const file = result.assets[0];
            const content = await FileSystem.readAsStringAsync(file.uri);
            const games = parsePgn(content);
            setFileName(file.name || 'PGN');
            setGamesCount(games.length);
        } catch (err: any) {
            setError(err?.message || 'Failed to import PGN');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary, padding: 16 }}>
            <Pressable
                onPress={importPgn}
                style={{
                    backgroundColor: theme.colors.accentPrimary,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    alignSelf: 'flex-start',
                }}
            >
                <Text style={{ color: 'white', fontSize: 12 }}>Import PGN</Text>
            </Pressable>

            <ScrollView style={{ marginTop: 16 }}>
                {error ? (
                    <Text style={{ color: theme.colors.accentDanger, fontSize: 12 }}>{error}</Text>
                ) : fileName ? (
                    <View>
                        <Text style={{ color: theme.colors.textPrimary, fontSize: 12 }}>{fileName}</Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{gamesCount} games</Text>
                    </View>
                ) : (
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>No PGN loaded</Text>
                )}
            </ScrollView>
        </View>
    );
}
