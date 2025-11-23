import { useState } from 'react';
import Dashboard from './components/Dashboard';
import FoodEntry from './components/FoodEntry';
import BloodSugarEntry from './components/BloodSugarEntry';
import CorrelationView from './components/CorrelationView';
import './App.css';

type Tab = 'dashboard' | 'food' | 'bloodSugar' | 'correlation';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍽️ Food Log Diary</h1>
        <nav className="nav-tabs">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={activeTab === 'food' ? 'active' : ''}
            onClick={() => setActiveTab('food')}
          >
            Add Food
          </button>
          <button
            className={activeTab === 'bloodSugar' ? 'active' : ''}
            onClick={() => setActiveTab('bloodSugar')}
          >
            Blood Sugar
          </button>
          <button
            className={activeTab === 'correlation' ? 'active' : ''}
            onClick={() => setActiveTab('correlation')}
          >
            Analysis
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'food' && <FoodEntry />}
        {activeTab === 'bloodSugar' && <BloodSugarEntry />}
        {activeTab === 'correlation' && <CorrelationView />}
      </main>
    </div>
  );
}

export default App;


