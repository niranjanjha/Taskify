import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pending from './pages/PendingPage';
import Complete from './pages/CompletePage';
import ZenSpacePage from './pages/ZenSpacePage';
import AnalyticsPage from './pages/AnalyticsPage'; // Added Analytics
import CollaboratedTasksPage from './pages/CollaboratedTasksPage'; // Added Collaborated Tasks
import ConnectPage from './pages/ConnectPage'; // Added Connect feature
import TodoPage from './pages/TodoPage'; // Added To Do feature
import Meetings from './pages/Meetings'; // Added Meetings feature
import LandingPage from './components/LandingPage';

import Profile from './components/Profile';
import Login from './components/Login';
import SignUp from './components/SignUp';
import FaceTest from './components/FaceTest'; // Added Face Test
import FaceDetectionTest from './components/FaceDetectionTest'; // Added Face Detection Test
import FacePreviewTest from './components/FacePreviewTest'; // Added Face Preview Test
import FaceDebug from './components/FaceDebug'; // Added Face Debug
import CSSDebugTest from './components/CSSDebugTest'; // Added CSS Debug Test
import ComprehensiveDebugTest from './components/ComprehensiveDebugTest'; // Added Comprehensive Debug Test
import IsolatedFaceTest from './components/IsolatedFaceTest'; // Added Isolated Face Test
import ModelPathTest from './components/ModelPathTest'; // Added Model Path Test
import FaceDebugChecklist from './components/FaceDebugChecklist'; // Added Face Debug Checklist
import IntegrationDebugTest from './components/IntegrationDebugTest'; // Added Integration Debug Test
import FaceDebugGuide from './components/FaceDebugGuide'; // Added Face Debug Guide
import FaceDetectionDebugger from './components/FaceDetectionDebugger'; // Added Face Detection Debugger
import DebugFaceLogin from './components/DebugFaceLogin'; // Added Debug Face Login
import FaceDetectionSpecificTest from './components/FaceDetectionSpecificTest'; // Added Face Detection Specific Test
import FixedFaceLogin from './components/FixedFaceLogin'; // Added Fixed Face Login
import './index.css';

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleAuthSubmit = data => {
    const user = {
      email: data.email,
      name: data.name || 'User',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`
    };
    setCurrentUser(user);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/landing', { replace: true });
  };

  const ProtectedLayout = () => (
    <Layout user={currentUser} onLogout={handleLogout}>
      <Outlet />
    </Layout>
  );

  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/face-test" element={<FaceTest />} /> {/* Added Face Test route */}
      <Route path="/face-detection-test" element={<FaceDetectionTest />} /> {/* Added Face Detection Test route */}
      <Route path="/face-preview-test" element={<FacePreviewTest />} /> {/* Added Face Preview Test route */}
      <Route path="/face-debug" element={<FaceDebug />} /> {/* Added Face Debug route */}
      <Route path="/css-debug" element={<CSSDebugTest />} /> {/* Added CSS Debug Test route */}
      <Route path="/comprehensive-debug" element={<ComprehensiveDebugTest />} /> {/* Added Comprehensive Debug Test route */}
      <Route path="/isolated-face-test" element={<IsolatedFaceTest />} /> {/* Added Isolated Face Test route */}
      <Route path="/model-path-test" element={<ModelPathTest />} /> {/* Added Model Path Test route */}
      <Route path="/face-debug-checklist" element={<FaceDebugChecklist />} /> {/* Added Face Debug Checklist route */}
      <Route path="/integration-debug" element={<IntegrationDebugTest />} /> {/* Added Integration Debug Test route */}
      <Route path="/face-debug-guide" element={<FaceDebugGuide />} /> {/* Added Face Debug Guide route */}
      <Route path="/face-detection-debugger" element={<FaceDetectionDebugger />} /> {/* Added Face Detection Debugger route */}
      <Route path="/debug-face-login" element={<DebugFaceLogin />} /> {/* Added Debug Face Login route */}
      <Route path="/face-detection-specific-test" element={<FaceDetectionSpecificTest />} /> {/* Added Face Detection Specific Test route */}
      <Route path="/fixed-face-login" element={<FixedFaceLogin />} /> {/* Added Fixed Face Login route */}
      <Route
        path="/login"
        element={
          <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-fuchsia-50 to-purple-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGw0MCA0ME00MCAwTDAgNDAiIHN0cm9rZT0iI2Q5ZTBmMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] opacity-10"></div>
            <div className="relative z-10 w-full max-w-md">
              <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
            </div>
          </div>
        }
      />
      <Route
        path="/signup"
        element={
          <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-fuchsia-50 to-purple-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGw0MCA0ME00MCAwTDAgNDAiIHN0cm9rZT0iI2Q5ZTBmMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] opacity-10"></div>
            <div className="relative z-10 w-full max-w-md">
              <SignUp onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/login')} />
            </div>
          </div>
        }
      />

      <Route
        element={
          currentUser
            ? <ProtectedLayout />
            : <Navigate to="/landing" replace />
        }>

        <Route index element={<Dashboard />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="pending" element={<Pending />} />
        <Route path="complete" element={<Complete />} />
        <Route path="collaborated" element={<CollaboratedTasksPage />} /> {/* Added Collaborated Tasks route */}
        <Route path="connect" element={<ConnectPage />} /> {/* Added Connect route */}
        <Route path="zen" element={<ZenSpacePage />} />
        <Route path="analytics" element={<AnalyticsPage />} /> {/* Added Analytics route */}
        <Route path="todo" element={<TodoPage />} /> {/* Added To Do route */}
        <Route
          path="profile"
          element={<Profile user={currentUser} setCurrentUser={setCurrentUser} onLogout={handleLogout} />}
        />
      </Route>

      <Route path="*" element={<Navigate to={currentUser ? '/' : '/landing'} replace />} />
    </Routes>
  );
};

export default App;