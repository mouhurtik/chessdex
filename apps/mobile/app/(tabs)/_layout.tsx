import { Tabs } from 'expo-router';
import { theme } from '../../styles/theme';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.bgSecondary },
                headerTintColor: theme.colors.textPrimary,
                tabBarStyle: { backgroundColor: theme.colors.bgSecondary, borderTopColor: theme.colors.borderColor },
                tabBarActiveTintColor: theme.colors.accentPrimary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
            }}
        >
            <Tabs.Screen name="analysis" options={{ title: 'Analysis' }} />
            <Tabs.Screen name="games" options={{ title: 'Games' }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        </Tabs>
    );
}
