import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Dashboard from './components/SuperDashboard';
import TrainingDetail from './components/TrainingDetail';
import NewTrainingModal from './components/NewTrainingModal';
import CalendarView from './components/CalendarView';
import MySessionsView from './components/MySessionsView';
import NotificationPanel from './components/NotificationPanel';
import { TrainingSession, TrainingStatus, Notification } from './types';
import { requestNotificationPermission, checkNotifications } from './services/notificationService';
import { LayoutDashboard, Calendar as CalendarIcon, Home, Briefcase, Bell } from 'lucide-react';

// Mock initial data
const INITIAL_TRAININGS: TrainingSession[] = [
  {
    id: '1',
    companyName: 'TechSolutions SAS',
    trainingName: 'Introduction à l\'IA Générative',
    date: '2023-10-28',
    status: TrainingStatus.IN_PROGRESS,
    trainerName: 'Rali El kohen',
    participants: [
      { id: 'p1', name: 'Alice Martin', email: 'alice@tech.com', role: 'Dev', hasSigned: true, signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', isPresent: true },
      { id: 'p2', name: 'Bob Wilson', email: 'bob@tech.com', role: 'Manager', hasSigned: false, isPresent: false },
      { id: 'p3', name: 'Charlie Davis', email: 'charlie@tech.com', role: 'CTO', hasSigned: false, isPresent: false }
    ]
  },
  {
    id: '2',
    companyName: 'Groupe Bernard',
    trainingName: 'Automatisation avec Python',
    date: '2023-10-15',
    status: TrainingStatus.COMPLETED,
    trainerName: 'Marie Curie',
    trainerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    participants: [
      { id: 'p4', name: 'David Lee', email: 'david@bernard.fr', role: 'Analyst', hasSigned: true, signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', isPresent: true },
      { id: 'p5', name: 'Eva Green', email: 'eva@bernard.fr', role: 'HR', hasSigned: true, signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', isPresent: true }
    ]
  }
];

type ViewMode = 'dashboard' | 'calendar' | 'mySessions';

const CURRENT_USER_NAME = "Rali El kohen";

const App: React.FC = () => {
  const [trainings, setTrainings] = useState<TrainingSession[]>(INITIAL_TRAININGS);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Initial Permission Request and periodic check
  useEffect(() => {
    requestNotificationPermission();

    const runCheck = () => {
        const newAlerts = checkNotifications(trainings, notifications);
        if (newAlerts.length > 0) {
            setNotifications(prev => [...newAlerts, ...prev]);
        }
    };

    // Run immediately
    runCheck();

    // Run every minute
    const interval = setInterval(runCheck, 60000);
    return () => clearInterval(interval);
  }, [trainings, notifications]);

  const handleSelectTraining = (id: string) => {
    setSelectedTrainingId(id);
    setIsNotificationPanelOpen(false); // Close panel if open
  };

  const handleCreateTraining = (newSessions: TrainingSession[]) => {
    setTrainings([...newSessions, ...trainings]);
    setIsModalOpen(false);
    if (newSessions.length > 0) {
        setSelectedTrainingId(newSessions[0].id);
    }
  };

  const handleUpdateSession = (updatedSession: TrainingSession) => {
    setTrainings(trainings.map(t => t.id === updatedSession.id ? updatedSession : t));
  };

  // Notification Handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const activeSession = trainings.find(t => t.id === selectedTrainingId);
  const myTrainings = trainings.filter(t => t.trainerName === CURRENT_USER_NAME);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    if (selectedTrainingId && activeSession) {
      return (
        <TrainingDetail 
            session={activeSession} 
            onBack={() => setSelectedTrainingId(null)}
            onUpdateSession={handleUpdateSession}
        />
      );
    }

    switch (currentView) {
      case 'calendar':
        return (
          <CalendarView 
            trainings={trainings}
            onSelectTraining={handleSelectTraining}
          />
        );
      case 'mySessions':
        return (
          <MySessionsView 
            trainings={myTrainings} 
            onSelectTraining={handleSelectTraining}
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard 
              trainings={trainings} 
              onSelectTraining={handleSelectTraining}
              onNewTraining={() => setIsModalOpen(true)}
          />
        );
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 pb-20 md:pb-0">
        
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-8">
                <div className="flex items-center cursor-pointer" onClick={() => { setSelectedTrainingId(null); setCurrentView('dashboard'); }}>
                  <img 
                    src="https://res.cloudinary.com/subframe/image/upload/v1711417513/uploads/2024-03-26/11_02_44.png" 
                    alt="Moon Logo" 
                    className="h-10 object-contain"
                  />
                </div>
                
                {/* Main Navigation (Desktop) */}
                <div className="hidden md:flex items-center space-x-1">
                  <button 
                    onClick={() => { setSelectedTrainingId(null); setCurrentView('dashboard'); }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'dashboard' && !selectedTrainingId 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <LayoutDashboard size={18} />
                    <span>Tableau de bord</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedTrainingId(null); setCurrentView('calendar'); }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'calendar' && !selectedTrainingId
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <CalendarIcon size={18} />
                    <span>Calendrier</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedTrainingId(null); setCurrentView('mySessions'); }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'mySessions' && !selectedTrainingId
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Briefcase size={18} />
                    <span>Mes sessions</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                 {/* Notification Bell */}
                 <div className="relative">
                    <button 
                        onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors relative"
                    >
                        <Bell size={20} />
                        {unreadNotifications > 0 && (
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>
                    {isNotificationPanelOpen && (
                        <NotificationPanel 
                            notifications={notifications}
                            onMarkAsRead={markNotificationAsRead}
                            onClearAll={clearNotifications}
                            onClose={() => setIsNotificationPanelOpen(false)}
                            onSelectNotification={handleSelectTraining}
                        />
                    )}
                 </div>

                 <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        RE
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{CURRENT_USER_NAME}</span>
                 </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation */}
        {!selectedTrainingId && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
            <div className="grid grid-cols-3 h-16">
              {/* Left: Calendar */}
              <button 
                onClick={() => setCurrentView('calendar')}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  currentView === 'calendar' 
                    ? 'text-indigo-600' 
                    : 'text-gray-500'
                }`}
              >
                <CalendarIcon size={24} />
                <span className="text-[10px] font-medium">Calendrier</span>
              </button>

              {/* Center: Home */}
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  currentView === 'dashboard' 
                    ? 'text-indigo-600' 
                    : 'text-gray-500'
                }`}
              >
                <Home size={28} />
                <span className="text-[10px] font-medium">Accueil</span>
              </button>

              {/* Right: Mes Sessions */}
              <button 
                onClick={() => setCurrentView('mySessions')}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  currentView === 'mySessions' 
                    ? 'text-indigo-600' 
                    : 'text-gray-500'
                }`}
              >
                <Briefcase size={24} />
                <span className="text-[10px] font-medium">Mes sessions</span>
              </button>
            </div>
          </div>
        )}

        {isModalOpen && (
            <NewTrainingModal 
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateTraining}
            />
        )}
      </div>
    </Router>
  );
};

export default App;
