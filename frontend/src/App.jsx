import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BeyondHeaven from './pages/BeyondHeaven';
import CardamomStore from './pages/CardamomStore';
import Thottam from './pages/Thottam';
import ReportsHub from './pages/reports/ReportsHub';
import ResortReport from './pages/reports/ResortReport';
import StoreReport from './pages/reports/StoreReport';
import ThottamReport from './pages/reports/ThottamReport';
import MasterReport from './pages/reports/MasterReport';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/beyond-heaven" element={
            <ProtectedRoute>
              <Layout>
                <BeyondHeaven />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/store" element={
            <ProtectedRoute>
              <Layout>
                <CardamomStore />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/thottam" element={
            <ProtectedRoute>
              <Layout>
                <Thottam />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <ReportsHub />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports/resort" element={
            <ProtectedRoute>
              <Layout>
                <ResortReport />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports/store" element={
            <ProtectedRoute>
              <Layout>
                <StoreReport />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports/thottam" element={
            <ProtectedRoute>
              <Layout>
                <ThottamReport />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports/master" element={
            <ProtectedRoute>
              <Layout>
                <MasterReport />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
