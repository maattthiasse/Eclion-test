import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, MapPin } from 'lucide-react';
import { TrainingSession } from '../types';

interface CalendarViewProps {
  trainings: TrainingSession[];
  onSelectTraining: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ trainings, onSelectTraining }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper to get day of week for the 1st of the month (0 = Sunday, 1 = Monday, etc.)
  // We adjust so 0 = Monday for French standard
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate); // 0=Mon, ... 5=Sat, 6=Sun
  const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const renderCalendarDays = () => {
    const days = [];
    
    // Logic for padding:
    // If the month starts on a weekday (Mon-Fri, index 0-4), we need padding to shift the 1st to the correct column.
    // If the month starts on a weekend (Sat-Sun, index 5-6), the first visible day of the month will be the following Monday (or the 1st if we ignored week logic, but here we strictly align to columns).
    
    const paddingCount = firstDayIndex >= 5 ? 0 : firstDayIndex;

    // Empty cells for days before the 1st
    for (let i = 0; i < paddingCount; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      // Check if this specific day is a weekend
      const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dayOfWeek = currentDayDate.getDay(); // 0=Sun, 6=Sat

      // Skip rendering if it's a weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      const dateStr = `${monthYear}-${String(d).padStart(2, '0')}`;
      const daysTrainings = trainings.filter(t => t.date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={d} className={`h-32 border border-gray-100 p-2 overflow-y-auto hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
              {d}
            </span>
          </div>
          
          <div className="space-y-1">
            {daysTrainings.map(t => (
              <div 
                key={t.id}
                onClick={() => onSelectTraining(t.id)}
                className="cursor-pointer text-xs p-1.5 rounded border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-sm group"
              >
                <div className="font-semibold text-indigo-900 truncate" title={t.trainingName}>
                  {t.trainingName}
                </div>
                <div className="flex items-center text-indigo-700 mt-1 truncate">
                    <MapPin size={10} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{t.companyName}</span>
                </div>
                <div className="flex items-center text-gray-500 mt-0.5 truncate border-t border-indigo-200/50 pt-0.5">
                    <User size={10} className="mr-1 flex-shrink-0" />
                    <span className="truncate italic">{t.trainerName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendrier des formations</h1>
        
        <div className="flex items-center space-x-4 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-lg font-medium text-gray-800 w-40 text-center select-none">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-colors duration-300">
        {/* Days Header - Only Weekdays */}
        <div className="grid grid-cols-5 border-b border-gray-200 bg-gray-50">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid - 5 Columns */}
        <div className="grid grid-cols-5 bg-white">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;