import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
  } from "react-router-dom";
import StagingPage from 'pages/index';

export default function App() {
    return <Router>
        <Routes>
            <Route path="/" element={<StagingPage />} />
        </Routes>
    </Router>
};
