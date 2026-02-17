import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AnalysisBoard from './components/analysis/AnalysisBoard';
import GamesPage from './components/games/GamesPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/analysis" replace />} />
                    <Route path="analysis" element={<AnalysisBoard />} />
                    <Route path="games" element={<GamesPage />} />
                    <Route path="*" element={<Navigate to="/analysis" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
