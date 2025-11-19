import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, GripHorizontal, Clock, AlertCircle, FileText, X, History, ChevronRight, ChevronDown, Target, Square, Pencil, Check, Eye, EyeOff, Trophy, CheckCircle2 } from 'lucide-react';

// --- Color Palette ---
const COLORS = [
  { bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-800', bar: 'bg-rose-500', sessionBar: 'bg-rose-300', modalBg: 'bg-rose-50', dot: 'bg-rose-500', glow: 'shadow-rose-500/50' },
  { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800', bar: 'bg-orange-500', sessionBar: 'bg-orange-300', modalBg: 'bg-orange-50', dot: 'bg-orange-500', glow: 'shadow-orange-500/50' },
  { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-800', bar: 'bg-amber-500', sessionBar: 'bg-amber-300', modalBg: 'bg-amber-50', dot: 'bg-amber-500', glow: 'shadow-amber-500/50' },
  { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-800', bar: 'bg-emerald-500', sessionBar: 'bg-emerald-300', modalBg: 'bg-emerald-50', dot: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
  { bg: 'bg-teal-100', border: 'border-teal-200', text: 'text-teal-800', bar: 'bg-teal-500', sessionBar: 'bg-teal-300', modalBg: 'bg-teal-50', dot: 'bg-teal-500', glow: 'shadow-teal-500/50' },
  { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-800', bar: 'bg-cyan-500', sessionBar: 'bg-cyan-300', modalBg: 'bg-cyan-50', dot: 'bg-cyan-500', glow: 'shadow-cyan-500/50' },
  { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800', bar: 'bg-blue-500', sessionBar: 'bg-blue-300', modalBg: 'bg-blue-50', dot: 'bg-blue-500', glow: 'shadow-blue-500/50' },
  { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-800', bar: 'bg-indigo-500', sessionBar: 'bg-indigo-300', modalBg: 'bg-indigo-50', dot: 'bg-indigo-500', glow: 'shadow-indigo-500/50' },
  { bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-800', bar: 'bg-violet-500', sessionBar: 'bg-violet-300', modalBg: 'bg-violet-50', dot: 'bg-violet-500', glow: 'shadow-violet-500/50' },
  { bg: 'bg-fuchsia-100', border: 'border-fuchsia-200', text: 'text-fuchsia-800', bar: 'bg-fuchsia-500', sessionBar: 'bg-fuchsia-300', modalBg: 'bg-fuchsia-50', dot: 'bg-fuchsia-500', glow: 'shadow-fuchsia-500/50' },
];

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  
  if (h > 0) return `${h}:${mStr}:${sStr}`;
  return `${mStr}:${sStr}`;
};

const formatHistoryDate = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Flexible Parser
const parseFlexibleInput = (input, defaultUnit = 'h') => {
  if (!input) return 0;
  const str = input.toString().trim().toLowerCase();
  
  if (str.includes(':')) {
    const parts = str.split(':');
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    return (h * 60) + m;
  }

  if (str.includes('h')) return Math.round(parseFloat(str) * 60);
  if (str.includes('m')) return Math.round(parseFloat(str));

  const val = parseFloat(str);
  if (isNaN(val)) return 0;

  if (defaultUnit === 'h') return Math.round(val * 60);
  return Math.round(val);
};

// --- Reusable Input Component ---
const SmartInput = ({ valueMinutes, onCommit, className, placeholder, unit = 'h' }) => {
  const [text, setText] = useState('');
  
  useEffect(() => {
    if (unit === 'h' && valueMinutes > 0) {
      const h = parseFloat((valueMinutes / 60).toFixed(2));
      setText(h + 'h');
    } else if (unit === 'm' && valueMinutes > 0) {
       setText(valueMinutes); 
    } else {
       setText('');
    }
  }, [valueMinutes, unit]);

  const handleBlur = () => {
    const mins = parseFlexibleInput(text, unit);
    if (mins >= 0) onCommit(mins);
    
    if (unit === 'h' && mins > 0) {
      setText(parseFloat((mins / 60).toFixed(2)) + 'h');
    } else if (unit === 'h') {
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  return (
    <input
      type="text"
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
    />
  );
};

export default function App() {
  // --- State ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('timeblock-tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(t => ({ 
        notes: '', 
        history: [], 
        currentSession: 0, 
        sessionGoal: 0,
        showTimer: true, // Default to showing the timer numbers
        ...t 
      }));
    }
    return [
      { id: '1', title: 'Deep Work', quotaMinutes: 600, elapsed: 3600, isRunning: false, colorIndex: 7, notes: '- Finish the Q3 report', history: [], currentSession: 0, sessionGoal: 0, showTimer: true },
      { id: '2', title: 'Email Triaging', quotaMinutes: 60, elapsed: 0, isRunning: false, colorIndex: 4, notes: '', history: [], currentSession: 0, sessionGoal: 0, showTimer: true },
    ];
  });

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null); 
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true); 
  
  const [editingHistoryId, setEditingHistoryId] = useState(null);

  // --- Timer Logic ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(currentTasks => 
        currentTasks.map(task => {
          if (task.isRunning) {
            return { 
              ...task, 
              elapsed: task.elapsed + 1,
              currentSession: (task.currentSession || 0) + 1 
            };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('timeblock-tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    setIsColorPickerOpen(false);
    setEditingHistoryId(null); 
  }, [activeTaskId]);

  // --- Handlers ---
  const addTask = () => {
    const newColorIndex = Math.floor(Math.random() * COLORS.length);
    const newTask = {
      id: crypto.randomUUID(),
      title: 'New Task',
      quotaMinutes: 60, 
      elapsed: 0,
      isRunning: false,
      colorIndex: newColorIndex,
      notes: '',
      history: [],
      currentSession: 0,
      sessionGoal: 0,
      showTimer: true
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const toggleTimer = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, isRunning: !t.isRunning };
      }
      return t;
    }));
  };

  const toggleCardView = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, showTimer: !t.showTimer } : t
    ));
  };

  const stopSession = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (t.currentSession > 0) {
           const sessionEntry = {
            id: crypto.randomUUID(),
            type: 'session',
            amount: t.currentSession,
            timestamp: Date.now()
          };
          return { 
            ...t, 
            isRunning: false, 
            currentSession: 0, 
            sessionGoal: 0, 
            history: [sessionEntry, ...t.history] 
          };
        } else {
           return { ...t, isRunning: false, currentSession: 0, sessionGoal: 0 };
        }
      }
      return t;
    }));
  };

  const resetTotalTimer = (id) => {
    setTasks(tasks.map(t => 
        t.id === id ? { ...t, elapsed: 0, isRunning: false, currentSession: 0, sessionGoal: 0, history: [] } : t
    ));
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };
  
  const addManualTime = (id, minsToAdd) => {
    const secondsToAdd = minsToAdd * 60;
    const logEntry = {
        id: crypto.randomUUID(),
        type: 'manual',
        amount: secondsToAdd,
        timestamp: Date.now()
    };

    setTasks(tasks.map(t => 
        t.id === id ? { 
            ...t, 
            elapsed: Math.max(0, t.elapsed + secondsToAdd),
            history: [logEntry, ...t.history]
        } : t
    ));
  };

  // --- History Edit Handlers ---
  const deleteHistoryEntry = (taskId, entryId) => {
    setTasks(tasks.map(t => {
        if (t.id !== taskId) return t;
        
        const entryToRemove = t.history.find(h => h.id === entryId);
        if (!entryToRemove) return t;

        return {
            ...t,
            elapsed: Math.max(0, t.elapsed - entryToRemove.amount),
            history: t.history.filter(h => h.id !== entryId)
        };
    }));
  };

  const updateHistoryEntry = (taskId, entryId, newMinutes) => {
    setTasks(tasks.map(t => {
        if (t.id !== taskId) return t;
        
        const entryToUpdate = t.history.find(h => h.id === entryId);
        if (!entryToUpdate) return t;

        const newAmountSeconds = newMinutes * 60;
        const diff = newAmountSeconds - entryToUpdate.amount;

        return {
            ...t,
            elapsed: Math.max(0, t.elapsed + diff), // Adjust total based on diff
            history: t.history.map(h => h.id === entryId ? { ...h, amount: newAmountSeconds } : h)
        };
    }));
    setEditingHistoryId(null);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null) return;
    if (draggedItemIndex !== index) {
      const newTasks = [...tasks];
      const draggedItem = newTasks[draggedItemIndex];
      newTasks.splice(draggedItemIndex, 1);
      newTasks.splice(index, 0, draggedItem);
      setTasks(newTasks);
      setDraggedItemIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);
  const activeColors = activeTask ? COLORS[activeTask.colorIndex % COLORS.length] : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans selection:bg-slate-700">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10 flex justify-end">
        <button 
          onClick={addTask}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Block
        </button>
      </header>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {tasks.map((task, index) => {
          const colors = COLORS[task.colorIndex % COLORS.length];
          
          // --- Calculations ---
          const quotaSeconds = task.quotaMinutes * 60;
          const totalProgressPercent = Math.min(100, (task.elapsed / quotaSeconds) * 100);
          
          // Session Goal Logic
          const sessionGoalSeconds = (task.sessionGoal || 0) * 60;
          const hasSessionGoal = sessionGoalSeconds > 0;
          const currentSessionSeconds = task.currentSession || 0;
          
          const sessionProgressPercent = hasSessionGoal 
            ? Math.min(100, (currentSessionSeconds / sessionGoalSeconds) * 100)
            : 0;

          // Visual States
          const isOvertime = task.elapsed > quotaSeconds;
          const isQuotaMet = task.elapsed >= quotaSeconds;
          const isSessionMet = hasSessionGoal && currentSessionSeconds >= sessionGoalSeconds;
          const hasNotes = task.notes && task.notes.trim().length > 0;

          // Card classes
          const cardGlowClass = isSessionMet ? 'shadow-emerald-400/40 ring-2 ring-emerald-400' : 'hover:shadow-xl';
          
          return (
            <div 
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                relative group
                ${colors.bg} ${colors.border} border-2
                rounded-3xl p-6
                transition-all duration-300 ease-out
                ${cardGlowClass} hover:scale-[1.02]
                cursor-grab active:cursor-grabbing
                flex flex-col justify-between
                min-h-[260px]
              `}
            >
              {/* Controls Overlay (Drag) - Eye button removed */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="text-slate-400/50 cursor-grab">
                    <GripHorizontal className="w-5 h-5" />
                 </div>
              </div>

              {/* Top Section */}
              <div className="space-y-4 z-10">
                <input 
                  value={task.title}
                  onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                  className={`w-full bg-transparent text-xl font-bold ${colors.text} placeholder-slate-400/50 outline-none border-none focus:ring-0 p-0 truncate text-center`}
                  placeholder="Task Name"
                />
                
                {/* Quota display logic - Hidden in Focus Mode to reduce noise? Or kept minimal */}
                <div className={`flex items-center justify-center gap-2 opacity-80 ${!task.showTimer ? 'invisible' : ''}`}>
                   <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>Quota</span>
                   <SmartInput
                      valueMinutes={task.quotaMinutes}
                      onCommit={(mins) => updateTask(task.id, 'quotaMinutes', mins)}
                      unit="h"
                      className={`w-20 bg-white/40 backdrop-blur-sm rounded-lg px-2 py-1 text-sm font-mono font-semibold ${colors.text} outline-none focus:ring-2 focus:ring-white/50 text-center`}
                   />
                </div>
              </div>

              {/* Middle Content Area - CLICKABLE TO TOGGLE FOCUS */}
              <div 
                onClick={() => toggleCardView(task.id)}
                className="flex flex-col items-center justify-center flex-1 my-2 cursor-pointer select-none hover:opacity-80 transition-opacity"
                title={task.showTimer ? "Click to Enter Focus Mode" : "Click to Show Timer"}
              >
                {task.showTimer ? (
                    // Standard View: Timer
                    <>
                        <div className={`text-5xl font-mono font-bold tracking-tight ${isOvertime ? 'text-red-500' : colors.text}`}>
                        {formatTime(task.elapsed)}
                        </div>
                        {isOvertime && (
                        <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-1 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            <span>OVER LIMIT</span>
                        </div>
                        )}
                    </>
                ) : (
                    // Focus View: Minimal
                    <div className="flex flex-col items-center justify-center space-y-4 w-full">
                        {isSessionMet && (
                             <div className="flex items-center gap-2 text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full animate-in zoom-in">
                                <Trophy className="w-5 h-5 fill-current" />
                                <span className="text-sm font-bold">Goal Met!</span>
                             </div>
                        )}
                        {/* We just leave space empty or show motivational icon if idle */}
                        {!isSessionMet && <div className={`w-2 h-2 rounded-full ${colors.dot} opacity-50`} />}
                    </div>
                )}
              </div>

              {/* Bottom Controls & Bars */}
              <div className="space-y-3 z-10 w-full">
                
                {/* Progress Bars Container */}
                <div className="space-y-1">
                    {/* Main Total Progress Bar */}
                    <div className="h-3 w-full bg-white/40 rounded-full overflow-hidden relative">
                        <div 
                            className={`h-full transition-all duration-500 ease-linear ${isOvertime ? 'bg-red-500' : colors.bar}`}
                            style={{ width: `${totalProgressPercent}%` }}
                        />
                        {isOvertime && (
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:20px_20px] animate-stripes pointer-events-none" />
                        )}
                    </div>

                    {/* Session Goal Bar */}
                    {hasSessionGoal && (
                        <div className="pt-1 flex items-center gap-2">
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden relative flex-1">
                                <div 
                                    className={`
                                        h-full transition-all duration-200 ease-linear 
                                        ${isSessionMet ? 'bg-emerald-400' : colors.sessionBar}
                                    `}
                                    style={{ width: `${sessionProgressPercent}%` }}
                                />
                            </div>
                            {isSessionMet && <Trophy className="w-3 h-3 text-emerald-600 animate-bounce" />}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    {/* Play/Pause */}
                    <button 
                        onClick={() => toggleTimer(task.id)}
                        className={`p-3 rounded-xl transition-colors ${task.isRunning ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-800 hover:bg-white/80'} shadow-sm`}
                    >
                        {task.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    
                    {/* Stop (End Session) */}
                    <button 
                        onClick={() => stopSession(task.id)}
                        className={`p-3 rounded-xl transition-colors bg-white/40 hover:bg-white/80 ${colors.text} shadow-sm`}
                        title="Stop Session & Log Time"
                    >
                        <Square className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTaskId(task.id)}
                        className={`p-3 rounded-xl transition-colors hover:bg-white/50 ${colors.text} ${hasNotes ? 'bg-white/30' : ''}`}
                        title="Notes, History & Details"
                      >
                        <FileText className={`w-5 h-5 ${hasNotes ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button 
                      onClick={() => removeTask(task.id)}
                      className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-100/50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center mt-20 opacity-40">
          <div className="inline-block p-6 rounded-full bg-slate-800 mb-4">
             <Clock className="w-12 h-12 text-slate-500" />
          </div>
          <p className="text-slate-400 text-lg">No tasks yet. Add a block to get started.</p>
        </div>
      )}

      {/* Expanded Task Modal */}
      {activeTask && activeColors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className={`
              w-full max-w-2xl h-[85vh] flex flex-col
              ${activeColors.bg} ${activeColors.border} border-4
              rounded-3xl shadow-2xl shadow-black/50
              relative overflow-hidden
              animate-in zoom-in-95 duration-200
            `}
          >
            {/* Modal Header */}
            <div className={`p-6 flex items-start justify-between border-b ${activeColors.border} bg-white/20 relative z-20`}>
              <div className="flex-1 mr-4">
                <input 
                  value={activeTask.title}
                  onChange={(e) => updateTask(activeTask.id, 'title', e.target.value)}
                  className={`w-full bg-transparent text-3xl font-bold ${activeColors.text} placeholder-slate-400/50 outline-none border-none focus:ring-0 p-0`}
                  placeholder="Task Name"
                />
                <div className="flex items-center gap-4 mt-2 text-sm font-medium opacity-75">
                   <span className={`${activeColors.text}`}>Goal: {(activeTask.quotaMinutes / 60).toFixed(1)}h</span>
                   <span className={`${activeColors.text}`}>•</span>
                   <span className={`${activeColors.text} font-mono`}>
                      Total: {formatTime(activeTask.elapsed)}
                   </span>
                </div>
              </div>

              {/* Controls: Reset, Color Picker, Close */}
              <div className="flex items-center gap-2">
                
                {/* Reset Button (Total) */}
                <button 
                  onClick={() => resetTotalTimer(activeTask.id)}
                  className={`
                    w-10 h-10 rounded-full ${activeColors.text} bg-white/30
                    hover:bg-white/50 transition-colors flex items-center justify-center
                  `}
                  title="Reset Total Progress"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Color Picker */}
                <div className="relative">
                  <button 
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    className={`
                      w-10 h-10 rounded-full ${activeColors.dot} 
                      border-4 border-white/50 shadow-sm 
                      hover:scale-105 transition-transform
                      flex items-center justify-center
                    `}
                    title="Change Color"
                  />
                  
                  {isColorPickerOpen && (
                    <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 grid grid-cols-5 gap-2 w-[200px] animate-in fade-in zoom-in-95 z-50">
                        {COLORS.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              updateTask(activeTask.id, 'colorIndex', i);
                              setIsColorPickerOpen(false);
                            }}
                            className={`
                              w-8 h-8 rounded-full ${c.dot}
                              border-2 transition-transform
                              ${activeTask.colorIndex === i ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent hover:scale-110'}
                            `}
                          />
                        ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setActiveTaskId(null)}
                  className={`p-2 rounded-full hover:bg-black/10 transition-colors ${activeColors.text}`}
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* Notes Section (Main Area) */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3 opacity-70">
                  <FileText className={`w-4 h-4 ${activeColors.text}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${activeColors.text}`}>Notes</span>
                </div>
                <textarea
                  value={activeTask.notes}
                  onChange={(e) => updateTask(activeTask.id, 'notes', e.target.value)}
                  placeholder="- Add bullet points&#10;- Brainstorm ideas&#10;- Keep track of progress..."
                  className={`
                    flex-1 w-full resize-none
                    bg-white/40 rounded-xl p-4
                    ${activeColors.text} placeholder-slate-500/40
                    text-lg leading-relaxed
                    outline-none focus:ring-2 focus:ring-white/50
                    border-none
                  `}
                />
              </div>

              {/* Sidebar Controls */}
              <div className={`p-6 md:w-72 flex flex-col gap-6 border-t md:border-t-0 md:border-l ${activeColors.border} bg-white/10 overflow-y-auto`}>
                
                {/* Timer Display (Small in Sidebar) */}
                <div className="text-center p-4 bg-white/30 rounded-2xl shadow-sm">
                  <div className={`text-3xl font-mono font-bold tracking-tight mb-2 ${activeTask.elapsed > activeTask.quotaMinutes * 60 ? 'text-red-600' : activeColors.text}`}>
                    {formatTime(activeTask.elapsed)}
                  </div>
                  <div className="flex justify-center gap-2">
                    <button 
                        onClick={() => toggleTimer(activeTask.id)}
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center justify-center gap-2 ${activeTask.isRunning ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-800 hover:bg-white/90'}`}
                      >
                        {activeTask.isRunning ? 'Pause' : 'Start'}
                    </button>
                     <button 
                        onClick={() => stopSession(activeTask.id)}
                        className={`p-2 rounded-lg bg-white/50 hover:bg-white/80 ${activeColors.text}`}
                        title="Stop & Log"
                    >
                        <Square className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Settings Group */}
                <div className="space-y-4">
                    
                    {/* Quota */}
                    <div className="space-y-1">
                    <label className={`text-xs font-bold uppercase tracking-wider ${activeColors.text} opacity-80`}>
                        Total Quota
                    </label>
                    <SmartInput
                        valueMinutes={activeTask.quotaMinutes}
                        onCommit={(mins) => updateTask(activeTask.id, 'quotaMinutes', mins)}
                        unit="h"
                        placeholder="e.g. 1.5"
                        className={`w-full bg-white/40 rounded-lg py-2 text-center font-mono font-bold ${activeColors.text} outline-none focus:ring-2 focus:ring-white/50`}
                    />
                    </div>

                    {/* Session Goal (Intention) */}
                    <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase tracking-wider ${activeColors.text} opacity-80 flex items-center gap-1`}>
                            <Target className="w-3 h-3" /> Session Goal
                        </label>
                        <SmartInput
                            valueMinutes={activeTask.sessionGoal}
                            onCommit={(mins) => updateTask(activeTask.id, 'sessionGoal', mins)}
                            unit="m"
                            placeholder="e.g. 30m"
                            className={`w-full bg-white/40 rounded-lg py-2 px-3 text-center font-mono font-bold ${activeColors.text} placeholder-${activeColors.text}/40 outline-none focus:ring-2 focus:ring-white/50`}
                        />
                    </div>

                    {/* Log Offline Time */}
                    <div className="space-y-1">
                    <label className={`text-xs font-bold uppercase tracking-wider ${activeColors.text} opacity-80 flex items-center gap-1`}>
                        <History className="w-3 h-3" /> Log Offline Time
                    </label>
                    <SmartInput
                        valueMinutes={0}
                        onCommit={(mins) => addManualTime(activeTask.id, mins)}
                        unit="m"
                        placeholder=""
                        className={`w-full bg-white/40 rounded-lg py-2 px-3 font-mono font-bold ${activeColors.text} placeholder-${activeColors.text}/40 outline-none focus:ring-2 focus:ring-white/50`}
                    />
                    </div>
                </div>

                {/* History Log */}
                <div className="border-t border-white/20 pt-4 mt-2">
                    <button 
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className={`flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider ${activeColors.text} opacity-80 mb-2 hover:opacity-100`}
                    >
                        <span className="flex items-center gap-1"><History className="w-3 h-3" /> History</span>
                        {isHistoryOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    
                    {isHistoryOpen && (
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {activeTask.history.length === 0 ? (
                                <div className={`text-xs opacity-50 italic ${activeColors.text}`}>No history yet</div>
                            ) : (
                                activeTask.history.map((entry) => {
                                    const isEditing = editingHistoryId === entry.id;
                                    const mins = Math.round(entry.amount / 60);
                                    
                                    return (
                                    <div key={entry.id} className="group/item flex justify-between items-center text-xs bg-white/30 p-2 rounded-lg hover:bg-white/40 transition-colors">
                                        <div className="flex items-center gap-2">
                                           <span className={`${activeColors.text} opacity-70 font-mono`}>
                                              {formatHistoryDate(entry.timestamp)}
                                           </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                           {isEditing ? (
                                              <div className="flex items-center gap-1">
                                                <SmartInput
                                                  valueMinutes={mins}
                                                  onCommit={(newVal) => updateHistoryEntry(activeTask.id, entry.id, newVal)}
                                                  unit="m"
                                                  className={`w-10 bg-white rounded px-1 py-0.5 text-center font-bold ${activeColors.text}`}
                                                />
                                              </div>
                                           ) : (
                                              <span className={`${activeColors.text} font-bold`}>
                                                  {entry.type === 'manual' ? '+' : ''}{mins}m
                                              </span>
                                           )}
                                           
                                           {/* Edit Controls (Visible on Hover) */}
                                           {!isEditing && (
                                             <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button 
                                                  onClick={() => setEditingHistoryId(entry.id)}
                                                  className={`p-1 hover:bg-white/50 rounded ${activeColors.text}`}
                                                  title="Edit"
                                                >
                                                  <Pencil className="w-3 h-3" />
                                                </button>
                                                <button 
                                                  onClick={() => deleteHistoryEntry(activeTask.id, entry.id)}
                                                  className={`p-1 hover:bg-red-100 rounded text-red-500`}
                                                  title="Delete"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                             </div>
                                           )}
                                        </div>
                                    </div>
                                )})
                            )}
                        </div>
                    )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes stripes {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
        .animate-stripes {
          animation: stripes 1s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 10px;
        }
      `}</style>
    </div>
  );
}