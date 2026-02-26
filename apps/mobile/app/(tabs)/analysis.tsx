import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import MobileBoard from '../../components/chess/MobileBoard';
import { theme } from '../../styles/theme';
import { useEngineStore } from '../../stores/engineStore';

export default function AnalysisScreen() {
    const lines = useEngineStore((s) => s.lines);
    const currentDepth = useEngineStore((s) => s.currentDepth);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
            <MobileBoard />
            <View style={{ padding: 12 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>d/{currentDepth}</Text>
                <ScrollView style={{ marginTop: 8, maxHeight: 220 }}>
                    {lines.length === 0 ? (
                        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Engine idle</Text>
                    ) : (
                        lines.map((line) => (
                            <View key={line.multipv} style={{ marginBottom: 6 }}>
                                <Text style={{ color: theme.colors.textPrimary, fontSize: 12 }}>
                                    {line.scoreType === 'mate' ? `M${line.score}` : (line.score / 100).toFixed(2)} {line.pvUci}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
