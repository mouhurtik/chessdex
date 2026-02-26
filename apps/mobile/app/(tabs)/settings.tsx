import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../styles/theme';

export default function SettingsScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.bgPrimary, padding: 16 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 14 }}>Settings</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                Preferences and app configuration will appear here.
            </Text>
        </View>
    );
}
