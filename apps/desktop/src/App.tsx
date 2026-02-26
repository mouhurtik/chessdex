import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AnalysisBoard from './components/analysis/AnalysisBoard';
import GamesPage from './components/games/GamesPage';
import DatabasePage from './components/database/DatabasePage';
import FilesPage from './components/files/FilesPage';
import SettingsPage from './components/settings/SettingsPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import BoardThemeInjector from './components/common/BoardThemeInjector';

function App() {
    const [analysisKey, setAnalysisKey] = useState(0);

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <BoardThemeInjector />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/analysis" replace />} />
                    <Route
                        path="analysis"
                        element={(
                            <ErrorBoundary onReset={() => setAnalysisKey((k) => k + 1)}>
                                <AnalysisBoard key={analysisKey} />
                            </ErrorBoundary>
                        )}
                    />
                    <Route path="games" element={<GamesPage />} />
                    <Route path="database" element={<DatabasePage />} />
                    <Route path="files" element={<FilesPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/analysis" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
