
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight, 
  Folder, 
  File, 
  MessageSquare, 
  Send,
  X,
  ExternalLink,
  MoreVertical,
  Calendar,
  Filter,
  Search as SearchIcon,
  HardDrive,
  Cpu,
  RefreshCw,
  Camera,
  Clock,
  Smartphone,
  UploadCloud,
  ArrowLeft
} from 'lucide-react';
import { 
  CitadelEvent, 
  EventType, 
  EventStatus, 
  SourceType, 
  FileRecord 
} from '../types';
import { BASE_FOLDERS, QUESTIONS_BY_TYPE } from '../constants';
import { db } from '../services/db';
import { createAgent } from '../services/gemini';

// --- Sidebar Component ---
export const Sidebar = ({ activeTab, onTabChange, navItems }: any) => (
  <nav className="w-64 border-r border-[#222] bg-[#0d0d0d] flex flex-col">
    <div className="p-6 flex-1">
      <div className="space-y-1">
        {navItems.map((item: any) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id 
                ? 'bg-[#1a1a1a] text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515]'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-4">Storage</h3>
        <div className="space-y-0.5">
          {BASE_FOLDERS.map((folder, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between px-3 py-1.5 text-[13px] text-gray-400 group cursor-default"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-600">{folder.icon}</span>
                {folder.name}
              </div>
              {folder.special && (
                <span className="text-[9px] bg-[#1a1a1a] px-1.5 py-0.5 rounded text-gray-500 border border-[#333]">
                  {folder.special}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="p-4 border-t border-[#222]">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold">
          JD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate text-gray-300">Admin User</p>
          <p className="text-[10px] text-gray-500 truncate">Local Instance</p>
        </div>
      </div>
    </div>
  </nav>
);

// --- Inbox View ---
export const InboxView = ({ events, onImport, onUpdate }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = async (event: CitadelEvent) => {
    const updated = { ...event, status: EventStatus.CONFIRMED, transferred_to_desktop: true };
    await db.saveEvent(updated);
    onUpdate();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-sm text-gray-500">New captures waiting for classification.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          Import Files
        </button>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => {
            if (e.target.files) {
              Array.from(e.target.files).forEach(onImport);
            }
          }}
        />
      </div>

      {events.length === 0 ? (
        <div className="border-2 border-dashed border-[#222] rounded-2xl h-64 flex flex-col items-center justify-center text-gray-500">
          <Folder size={48} className="mb-4 text-[#222]" />
          <p>Drag and drop files here or click Import</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event: CitadelEvent) => (
            <div 
              key={event.id}
              className="bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden hover:border-[#333] transition-all"
            >
              <div className="p-5 flex gap-6">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0 border border-[#333] relative">
                  {event.is_mobile_capture && (
                    <Smartphone size={12} className="absolute top-1 left-1 text-blue-500" />
                  )}
                  {event.event_type === EventType.MEDIA ? (
                    <img src="https://picsum.photos/64/64" className="rounded shadow-sm" alt="Preview" />
                  ) : (
                    <File size={28} className="text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
                        <Calendar size={12} />
                        {new Date(event.created_at).toLocaleString()} • {event.files[0]?.mime_type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={event.event_type}
                        onChange={async (e) => {
                          const updated = { ...event, event_type: e.target.value as EventType };
                          await db.saveEvent(updated);
                          onUpdate();
                        }}
                        className="bg-[#1a1a1a] border border-[#333] text-xs px-2 py-1 rounded outline-none text-gray-300"
                      >
                        {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 italic">"{event.summary}"</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {(QUESTIONS_BY_TYPE[event.event_type] || QUESTIONS_BY_TYPE['other']).map((q, i) => (
                      <div key={i} className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{q}</label>
                        <input 
                          type="text" 
                          placeholder="Answer..."
                          className="w-full bg-[#0d0d0d] border-b border-[#222] py-1 text-sm outline-none focus:border-blue-500 transition-colors"
                          value={event.user_answers[q] || ''}
                          onChange={async (e) => {
                            const updated = { 
                              ...event, 
                              user_answers: { ...event.user_answers, [q]: e.target.value } 
                            };
                            await db.saveEvent(updated);
                            onUpdate();
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-4">
                    <div className="flex gap-2">
                      <button className="text-[10px] bg-[#1a1a1a] px-2 py-1 rounded text-gray-400 hover:text-white transition-colors border border-[#333]">
                        REVEAL IN DISK
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this event? This action is irreversible.')) {
                            await db.deleteEvent(event.id);
                            onUpdate();
                          }
                        }}
                        className="text-gray-500 hover:text-red-500 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleConfirm(event)}
                        className="flex items-center gap-2 bg-[#222] hover:bg-blue-900/30 hover:text-blue-400 px-4 py-2 rounded-lg text-sm transition-all border border-[#333] hover:border-blue-500/30"
                      >
                        <Check size={18} />
                        Confirm & Archive
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Mobile Capture View (Prototype) ---
export const MobileCaptureView = ({ onExit, onSave }: { onExit: () => void, onSave: (event: CitadelEvent) => Promise<void> }) => {
  const [step, setStep] = useState<'capture' | 'questions'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({
    "What is this?": "receipt",
    "Keep forever?": "yes",
    "Any tag?": ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCapture = () => {
    // Simulated camera capture
    setCapturedImage("https://picsum.photos/400/600");
    setStep('questions');
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    const id = crypto.randomUUID();
    const expires = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
    
    const event: CitadelEvent = {
      id,
      created_at: Date.now(),
      source: SourceType.CAMERA,
      event_type: answers["What is this?"] as EventType || EventType.OTHER,
      title: `Mobile Capture ${new Date().toLocaleDateString()}`,
      summary: `Temporarily stored capture from mobile device. Expires in 30 days.`,
      user_answers: answers,
      tags: answers["Any tag?"] ? [answers["Any tag?"]] : [],
      files: [{
        id: crypto.randomUUID(),
        original_filename: "mobile_capture.jpg",
        hash: "mobile_sha256",
        size: 500000,
        mime_type: "image/jpeg",
        storage_path: `Mobile/Temp/${id}.jpg`,
        expires_at: expires
      }],
      entities: { people: [], orgs: [], places: [] },
      status: EventStatus.DRAFT,
      is_mobile_capture: true,
      transferred_to_desktop: false
    };

    await onSave(event);
    alert("Captured! Transfer to Citadel Desktop within 30 days.");
    onExit();
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col z-[200]">
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#222]">
        <button onClick={onExit} className="p-2 -ml-2 text-gray-400">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-widest">Mobile Capture</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex flex-col p-6 overflow-y-auto">
        {step === 'capture' ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-8">
            <div className="w-full aspect-[3/4] bg-[#111] rounded-3xl border border-[#222] flex items-center justify-center relative overflow-hidden group cursor-pointer" onClick={handleCapture}>
              <Camera size={64} className="text-gray-800 group-hover:text-blue-500 transition-colors" />
              <div className="absolute bottom-6 text-xs text-gray-600 font-medium">TAP TO SCAN / PHOTO</div>
            </div>
            <p className="text-center text-gray-500 text-sm">
              Captured data is stored locally for 30 days until transferred to your Citadel Root.
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-8 animate-in slide-in-from-bottom duration-300">
            <img src={capturedImage!} className="w-full aspect-[3/2] object-cover rounded-2xl border border-[#222]" />
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">What is this?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['receipt', 'note', 'document', 'other'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setAnswers({...answers, "What is this?": t})}
                      className={`py-3 rounded-xl text-sm border transition-all ${answers["What is this?"] === t ? 'bg-blue-600 border-blue-500 text-white font-bold' : 'bg-[#1a1a1a] border-[#333] text-gray-400'}`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Keep Forever?</label>
                <div className="flex gap-2">
                  {['yes', 'no'].map(k => (
                    <button 
                      key={k}
                      onClick={() => setAnswers({...answers, "Keep forever?": k})}
                      className={`flex-1 py-3 rounded-xl text-sm border transition-all ${answers["Keep forever?"] === k ? 'bg-blue-600 border-blue-500 text-white font-bold' : 'bg-[#1a1a1a] border-[#333] text-gray-400'}`}
                    >
                      {k.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tags (optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Work, Travel..."
                  className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm outline-none focus:border-blue-500"
                  value={answers["Any tag?"]}
                  onChange={e => setAnswers({...answers, "Any tag?": e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleFinalSave}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20"
            >
              {isSaving ? <RefreshCw className="animate-spin" /> : <Check size={20} />}
              SAVE TO MOBILE VAULT
            </button>
          </div>
        )}
      </main>

      <footer className="p-6 bg-[#0d0d0d] border-t border-[#222] text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <Shield size={12} />
          Local-First Encryption Active
        </div>
      </footer>
    </div>
  );
};

// --- Timeline View ---
export const TimelineView = ({ events }: { events: CitadelEvent[] }) => {
  const grouped = useMemo(() => {
    const groups: Record<string, CitadelEvent[]> = {};
    events
      .filter(e => e.status === EventStatus.CONFIRMED)
      .sort((a, b) => b.created_at - a.created_at)
      .forEach(e => {
        const date = new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!groups[date]) groups[date] = [];
        groups[date].push(e);
      });
    return groups;
  }, [events]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Timeline</h1>
        <p className="text-sm text-gray-500">Your digital history in chronological order.</p>
      </div>

      <div className="space-y-12">
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month} className="relative pl-6 border-l border-[#222]">
            <div className="absolute top-0 -left-1.5 w-3 h-3 bg-[#333] rounded-full border border-black"></div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">{month}</h2>
            
            <div className="space-y-4">
              {items.map(event => (
                <div 
                  key={event.id}
                  className="bg-[#0d0d0d] border border-[#222] p-4 rounded-xl flex items-center justify-between hover:border-[#333] group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-gray-600 group-hover:text-blue-500 transition-colors">
                      <File size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{event.title}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {new Date(event.created_at).toLocaleDateString()} • {event.event_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {event.tags.map(t => (
                      <span key={t} className="text-[10px] bg-[#1a1a1a] px-1.5 py-0.5 rounded text-gray-500 border border-[#333]">#{t}</span>
                    ))}
                    <button className="text-gray-600 hover:text-white ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <Clock size={40} className="mx-auto mb-4 opacity-20" />
            <p>No confirmed events found. Start by processing items in your Inbox.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Search View ---
export const SearchView = ({ events }: { events: CitadelEvent[] }) => {
  const [query, setQuery] = useState('');
  
  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.summary.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [query, events]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text"
          autoFocus
          placeholder="Search by title, summary, or tags..."
          className="w-full bg-[#0d0d0d] border border-[#222] rounded-2xl pl-12 pr-6 py-4 text-lg outline-none focus:border-blue-500 transition-all shadow-xl shadow-black/40"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {results.map(event => (
          <div 
            key={event.id}
            className="p-4 bg-[#0d0d0d] border border-[#222] rounded-xl flex items-center justify-between hover:bg-[#111] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#1a1a1a] rounded-lg relative">
                {event.is_mobile_capture && (
                  <Smartphone size={8} className="absolute top-1 left-1 text-blue-500" />
                )}
                <File size={20} className="text-gray-400" />
              </div>
              <div>
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-1">{event.summary}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter ${
                event.status === EventStatus.CONFIRMED ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
              }`}>
                {event.status}
              </span>
              <ChevronRight size={16} className="text-gray-600" />
            </div>
          </div>
        ))}
        {query && results.length === 0 && (
          <div className="text-center py-20 text-gray-600">
             <SearchIcon size={40} className="mx-auto mb-4 opacity-20" />
             <p>No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Settings View ---
export const SettingsView = ({ appState, onUpdate }: any) => {
  const [key, setKey] = useState(appState.apiKey || '');

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <section className="space-y-6">
          <div className="p-6 bg-[#0d0d0d] border border-[#222] rounded-2xl">
            <h3 className="flex items-center gap-3 text-lg font-semibold mb-4">
              <HardDrive size={20} className="text-blue-500" />
              Citadel Root
            </h3>
            <p className="text-sm text-gray-500 mb-4">Your data is stored locally in this folder. Changing this will not move existing files.</p>
            <div className="flex items-center justify-between p-3 bg-black border border-[#222] rounded-lg font-mono text-xs">
              <span className="text-gray-400">{appState.rootPath}</span>
              <button className="text-blue-400 hover:underline">Change Root</button>
            </div>
          </div>

          <div className="p-6 bg-[#0d0d0d] border border-[#222] rounded-2xl">
            <h3 className="flex items-center gap-3 text-lg font-semibold mb-4">
              <Smartphone size={20} className="text-orange-500" />
              Mobile Connectivity
            </h3>
            <p className="text-sm text-gray-500 mb-4">Captured data from mobile is held for 30 days. Connect devices to transfer permanent copies.</p>
            <button className="w-full py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#222] transition-colors">
              GENERATE LINK CODE
            </button>
          </div>

          <div className="p-6 bg-[#0d0d0d] border border-[#222] rounded-2xl">
            <h3 className="flex items-center gap-3 text-lg font-semibold mb-4">
              <Cpu size={20} className="text-purple-500" />
              AI Configuration
            </h3>
            <p className="text-sm text-gray-500 mb-4">Provide your Gemini API key to enable semantic search, auto-classification, and the Chat Agent.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-2">Google Gemini API Key</label>
                <div className="flex gap-2">
                  <input 
                    type="password"
                    placeholder="Enter API Key..."
                    className="flex-1 bg-black border border-[#222] px-4 py-2 rounded-lg text-sm outline-none focus:border-purple-500 transition-all"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                  />
                  <button 
                    onClick={() => onUpdate({ apiKey: key })}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Setup Wizard ---
export const SetupWizard = ({ onComplete }: any) => {
  const [step, setStep] = useState(1);
  const [path, setPath] = useState('/Users/admin/CitadelRoot');
  const [key, setKey] = useState('');

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-[100]">
      <div className="max-w-md w-full bg-[#0d0d0d] border border-[#222] rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white rotate-12 shadow-xl shadow-blue-900/40">
            <Folder size={32} />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 text-center">
            <h1 className="text-2xl font-bold">Welcome to Citadel</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Citadel is a local-first event log. To begin, select a root folder where your vault will live.
            </p>
            <div className="text-left space-y-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Selected Path</label>
              <div className="p-4 bg-black border border-[#222] rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 truncate mr-4">{path}</span>
                <button className="text-blue-400 flex-shrink-0">BROWSE</button>
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              Next Step
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">AI Companion</h1>
              <p className="text-sm text-gray-400 mt-2">Optional: Add a Gemini key for semantic intelligence.</p>
            </div>
            <div className="space-y-4">
              <input 
                type="password"
                placeholder="Gemini API Key (Optional)"
                className="w-full bg-black border border-[#222] p-4 rounded-xl text-sm outline-none focus:border-purple-500 transition-all"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Base Folders to Create:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {BASE_FOLDERS.slice(0, 6).map(f => (
                    <div key={f.name} className="text-[11px] text-gray-400 flex items-center gap-2">
                      <Check size={12} className="text-blue-500" />
                      /{f.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#222] py-3 rounded-xl font-bold hover:bg-[#1a1a1a] transition-all">Back</button>
              <button 
                onClick={() => onComplete(path, key || null)}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all"
              >
                Finish Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Chat Agent Component ---
export const ChatAgent = ({ events, apiKey }: { events: CitadelEvent[], apiKey: string | null }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;
    
    const userMsg = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const agent = createAgent(apiKey);
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await agent.chat(input, history, events);
      const assistantMsg = { role: 'assistant', content: response || "I'm sorry, I couldn't process that.", timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with AI. Check your API key.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0d0d0d]">
        <Cpu size={48} className="text-gray-700 mb-6" />
        <h3 className="text-lg font-bold mb-2 text-gray-300">AI Disabled</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Provide a Gemini API key in settings to enable your personal agent.
        </p>
        <button className="text-xs bg-[#1a1a1a] px-4 py-2 rounded border border-[#333] text-gray-400">
          VISIT SETTINGS
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0d0d] border-l border-[#222]">
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <MessageSquare size={16} className="text-purple-500" />
          Citadel Assistant
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setMessages([])} className="text-gray-500 hover:text-white"><RefreshCw size={14} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-[0.2em] mb-8">Ready to assist</p>
            <div className="grid grid-cols-1 gap-3">
               <button onClick={() => setInput("Show me all receipts from 2024")} className="p-3 text-left bg-[#151515] hover:bg-[#1a1a1a] rounded-xl text-xs text-gray-400 border border-[#222] transition-colors">"Show me all receipts from 2024"</button>
               <button onClick={() => setInput("Organize my inbox")} className="p-3 text-left bg-[#151515] hover:bg-[#1a1a1a] rounded-xl text-xs text-gray-400 border border-[#222] transition-colors">"Organize my inbox"</button>
               <button onClick={() => setInput("Find my identity documents")} className="p-3 text-left bg-[#151515] hover:bg-[#1a1a1a] rounded-xl text-xs text-gray-400 border border-[#222] transition-colors">"Find my identity documents"</button>
            </div>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-[#1a1a1a] text-gray-300 border border-[#222] rounded-tl-none'
            }`}>
              {m.content}
            </div>
            <span className="text-[9px] text-gray-600 mt-1.5 font-mono">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-gray-500 text-[10px] italic animate-pulse">
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            Assistant is thinking...
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#222]">
        <div className="relative flex items-center">
          <input 
            type="text"
            className="w-full bg-black border border-[#333] rounded-xl pl-4 pr-12 py-3 text-sm outline-none focus:border-purple-600 transition-all placeholder:text-gray-700 shadow-[0_0_20px_rgba(0,0,0,0.4)]"
            placeholder="Ask anything about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:bg-gray-800"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[9px] text-center mt-3 text-gray-600 uppercase tracking-widest font-bold">
          CITADEL AI AGENT • ENCRYPTED SESSION
        </p>
      </div>
    </div>
  );
};

export const Shield = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);
