import React from 'react';
import { TrainingSession, TrainingStatus } from '../types';
import { Calendar, MapPin, ChevronRight, Briefcase, BookOpen } from 'lucide-react';

interface MySessionsViewProps {
  trainings: TrainingSession[];
  onSelectTraining: (id: string) => void;
}

const MySessionsView: React.FC<MySessionsViewProps> = ({ trainings, onSelectTraining }) => {
  // Sort by date (newest first)
  const sortedTrainings = [...trainings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusInfo = (status: TrainingStatus) => {
    switch (status) {
      case TrainingStatus.COMPLETED:
        return { label: 'Clôturée', className: 'bg-green-100 text-green-700 border-green-200' };
      case TrainingStatus.IN_PROGRESS:
        return { label: 'En cours', className: 'bg-blue-100 text-blue-700 border-blue-200' };
      case TrainingStatus.SCHEDULED:
      default:
        return { label: 'En attente', className: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
  };

  const formatDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('/');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="text-indigo-600" />
            Mes Sessions
        </h1>
        <p className="text-gray-500">Liste des formations qui vous sont attribuées.</p>
      </div>

      {sortedTrainings.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">Aucune session ne vous est attribuée pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTrainings.map((session) => {
            const statusInfo = getStatusInfo(session.status);
            
            return (
              <div 
                key={session.id}
                onClick={() => onSelectTraining(session.id)}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                          {session.companyName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${statusInfo.className}`}>
                          {statusInfo.label}
                      </span>
                  </div>
                  
                  <div className="flex flex-col space-y-1 text-sm text-gray-500">
                      <div className="flex items-center">
                          <BookOpen size={14} className="mr-1.5 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{session.trainingName}</span>
                      </div>
                      <div className="flex items-center text-indigo-600 font-medium">
                          <Calendar size={14} className="mr-1.5 flex-shrink-0" />
                          <span>{formatDate(session.date)}</span>
                      </div>
                  </div>
                </div>
                
                <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" size={20} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySessionsView;