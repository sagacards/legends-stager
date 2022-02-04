import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
  } from "react-router-dom";
import SideBySidePage from 'pages/side-by-side';
import StagerPage from 'pages/stager';
import AnimatedPage from 'pages/animated';
import TestPage from 'pages/test';
import StagingPage from 'pages/new';

export default function App() {
    return <Router>
        <Routes>
            {/* <Route path="/stager" element={<StagerPage />} /> */}
            {/* <Route path="/animated" element={<AnimatedPage />} /> */}
            {/* <Route path="/test" element={<TestPage />} /> */}
            {/* <Route path="/" element={<SideBySidePage />} /> */}
            <Route path="/" element={<StagingPage />} />
        </Routes>
    </Router>
};
