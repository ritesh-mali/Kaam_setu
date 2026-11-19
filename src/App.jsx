import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { WorkerSearchPage } from './pages/WorkerSearchPage';
import { WorkerProfileDetailPage } from './pages/WorkerProfileDetailPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPages } from './pages/AuthPages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/workers" element={<WorkerSearchPage />} />
              <Route path="/workers/:id" element={<WorkerProfileDetailPage />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/worker/dashboard" element={<WorkerDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/login" element={<AuthPages defaultMode="login" />} />
              <Route path="/register" element={<AuthPages defaultMode="register" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
