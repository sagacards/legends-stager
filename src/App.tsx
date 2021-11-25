import React from 'react';
import IndexPage from './pages/index';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
  } from "react-router-dom";
import SideBySidePage from 'pages/side-by-side';
import StagerPage from 'pages/stager';
import AnimatedPage from 'pages/animated';

export default function App() {
    return <Router>
        <Routes>
            <Route path="/stager" element={<StagerPage />} />
            <Route path="/side-by-side" element={<SideBySidePage />} />
            <Route path="/animated" element={<AnimatedPage />} />
            <Route path="/" element={<IndexPage />} />
        </Routes>
    </Router>
};
