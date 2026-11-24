import React from 'react';
import Navbar from '../components/Navbar';

export default function LiveMonitor() {
  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-text-primary transition-all duration-300 pt-18">
      <Navbar />
    </div>
  );
}
