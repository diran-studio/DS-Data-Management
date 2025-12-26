
import React, { useState, useEffect, useCallback } from 'react';
import { 
  CitadelEvent, 
  AppState, 
  EventStatus, 
  SourceType, 
  EventType 
} from './types';
import { db } from './services/db';
import { NAV_ITEMS, BASE_FOLDERS } from './constants';
import { 
  Sidebar, 
  InboxView, 
  TimelineView, 
  SearchView, 
  SettingsView, 
  SetupWizard,
  ChatAgent,
  MobileCaptureView
} from './components/UI';
import { ShieldAlert, Smartphone, Monitor } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    isSetup: false,
    rootPath: null,
    apiKey: null,
    events: [],
    selectedEventId: null,
    isMobileView: false
  });
  const [activeTab, setActiveTab] = useState('inbox');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const saved = await db.getAppState();
      const events = await db.getAllEvents();
      if (saved) {
        setAppState({ ...saved, events, isMobileView: false });
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSetupComplete = async (rootPath: string, apiKey: string | null) => {
    const newState = {
      isSetup: true,
      rootPath,
      apiKey,
      events: [],
      selectedEventId: null,
      isMobileView: false
    };
    await db.saveAppState(newState);
    setAppState(newState);
  };

  const updateEvents = async () => {
    const events = await db.getAllEvents();
    setAppState(prev => ({ ...prev, events }));
  };

  const handleImportFile = async (file: File) => {
    const id = crypto.randomUUID();
    const newEvent: CitadelEvent = {
      id,
      created_at: Date.now(),
      source: SourceType.UPLOAD,
      event_type: EventType.OTHER,
      title: file.name,
      summary: 'Imported file pending classification...',
      user_answers: {},
      tags: [],
      files: [{
        id: crypto.randomUUID(),
        original_filename: file.name,
        hash: 'sha256_placeholder',
        size: file.size,
        mime_type: file.type,
        storage_path: `Inbox/${new Date().toISOString().slice(0, 7)}/${file.name}`
      }],
      entities: { people: [], orgs: [], places: [] },
      status: EventStatus.DRAFT
    };
    
    await db.saveEvent(newEvent);
    await updateEvents();
  };

  const toggleViewMode = () => {
    setAppState(prev => ({ ...prev, isMobileView: !prev.isMobileView }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full mb-4"></div>
          <p className="text-sm font-medium">Initializing Citadel...</p>
        </div>
      </div>
    );
  }

  if (!appState.isSetup) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (appState.isMobileView) {
    return (
      <MobileCaptureView 
        onExit={toggleViewMode} 
        onSave={async (event: CitadelEvent) => {
          await db.saveEvent(event);
          await updateEvents();
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-[#ededed] overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        navItems={NAV_ITEMS}
      />

      <div className="flex-1 flex flex-col min-w-0 border-r border-[#222]">
        <header className="h-14 border-b border-[#222] flex items-center justify-between px-6 bg-[#0d0d0d] z-10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight">Citadel</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">v1.0.0</span>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleViewMode}
               className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 text-xs transition-all"
             >
               <Smartphone size={14} />
               <span>Simulate Mobile Capture</span>
             </button>
             <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#1a1a1a] border border-[#333] cursor-default">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-xs text-gray-400 font-mono truncate max-w-[100px]">{appState.rootPath}</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6">
          {activeTab === 'inbox' && (
            <InboxView 
              events={appState.events.filter(e => e.status === EventStatus.DRAFT)} 
              onImport={handleImportFile}
              onUpdate={updateEvents}
            />
          )}
          {activeTab === 'timeline' && <TimelineView events={appState.events} />}
          {activeTab === 'search' && <SearchView events={appState.events} />}
          {activeTab === 'settings' && (
            <SettingsView 
              appState={appState} 
              onUpdate={(updates: any) => {
                const newState = { ...appState, ...updates };
                setAppState(newState);
                db.saveAppState(newState);
              }}
            />
          )}
        </main>
      </div>

      <div className="w-[400px] flex-shrink-0 flex flex-col bg-[#0d0d0d]">
        <ChatAgent events={appState.events} apiKey={appState.apiKey} />
      </div>
    </div>
  );
};

export default App;
