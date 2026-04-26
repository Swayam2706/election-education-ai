import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Loading } from './components/Loading';

// Critical pages - load immediately
import Home from './pages/Home';
import Login from './pages/Login';

// Lazy load non-critical pages
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Learn = lazy(() => import('./pages/Learn'));
const LearnArticle = lazy(() => import('./pages/LearnArticle'));
const Quiz = lazy(() => import('./pages/Quiz'));
const QuizDetail = lazy(() => import('./pages/QuizDetail'));
const Chat = lazy(() => import('./pages/Chat'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Eligibility = lazy(() => import('./pages/Eligibility'));
const FAQ = lazy(() => import('./pages/FAQ'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AnimationsDemo = lazy(() => import('./pages/AnimationsDemo'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Suspense fallback={<Loading fullScreen />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="learn" element={<Learn />} />
                <Route path="learn/:slug" element={<LearnArticle />} />
                <Route path="quiz" element={<Quiz />} />
                <Route path="quiz/:id" element={<QuizDetail />} />
                <Route path="timeline" element={<Timeline />} />
                <Route path="eligibility" element={<Eligibility />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="animations-demo" element={<AnimationsDemo />} />
                
                {/* Protected routes */}
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;