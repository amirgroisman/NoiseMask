import React, { useState } from 'react';
import { Header, type MainTab } from './components/layout/Header';
import { MasterBar } from './components/layout/MasterBar';
import { SafetyModal } from './components/layout/SafetyModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { ManualLab } from './components/lab/ManualLab';
import { NoiseAnalysis } from './components/analysis/NoiseAnalysis';
import { ABExperimentView } from './components/experiments/ABExperimentView';
import { PresetManager } from './components/presets/PresetManager';
import { ExperimentLog } from './components/presets/ExperimentLog';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<MainTab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Safety Warning Modal */}
      <SafetyModal />

      {/* Top Sticky Header */}
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28">
        {currentTab === 'dashboard' && <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />}
        {currentTab === 'manual' && <ManualLab />}
        {currentTab === 'analysis' && <NoiseAnalysis />}
        {currentTab === 'ab' && <ABExperimentView />}
        {currentTab === 'presets' && (
          <div className="flex flex-col gap-8">
            <PresetManager />
            <ExperimentLog />
          </div>
        )}
      </main>

      {/* Bottom Persistent Audio Control Bar */}
      <MasterBar />
    </div>
  );
};

export default App;
