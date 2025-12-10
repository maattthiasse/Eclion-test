import React, { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle, FileText } from 'lucide-react';
import { parseConventionDocument } from '../services/geminiService';
import { TrainingSession, TrainingStatus, Participant } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface NewTrainingModalProps {
  onClose: () => void;
  onCreate: (sessions: TrainingSession[]) => void;
}

const NewTrainingModal: React.FC<NewTrainingModalProps> = ({ onClose, onCreate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        
        try {
          const result = await parseConventionDocument(base64Data, file.type);
          
          const newSessions: TrainingSession[] = [];
          
          // Handle case where AI returns empty dates array or malformed data
          const datesToProcess = (result.dates && result.dates.length > 0) ? result.dates : [new Date().toISOString().split('T')[0]];

          // Create a session for each date found in the convention (Multi-day training support)
          datesToProcess.forEach((dateStr, index) => {
             const suffix = datesToProcess.length > 1 ? ` (Jour ${index + 1})` : '';
             
             newSessions.push({
                id: uuidv4(),
                companyName: result.companyName,
                trainingName: result.trainingName + suffix,
                date: dateStr, // Expecting YYYY-MM-DD from AI
                status: TrainingStatus.SCHEDULED,
                trainerName: 'Rali El kohen', 
                participants: result.participants.map(p => ({
                  id: uuidv4(),
                  name: p.name,
                  email: p.email,
                  role: p.role,
                  hasSigned: false,
                  isPresent: false
                }))
             });
          });

          onCreate(newSessions);
        } catch (err) {
            console.error(err);
          setError("Impossible d'analyser le document. Vérifiez que l'image est claire.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError("Erreur lors de la lecture du fichier.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transition-colors duration-300">
        
        {/* Decorative Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-center">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <FileText className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Nouvelle Formation</h2>
            <p className="text-blue-100 text-sm mt-1">Importez votre convention pour commencer</p>
        </div>

        <div className="p-8">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Analyse IA en cours...</p>
                    <p className="text-gray-400 text-sm mt-2">Extraction des dates et participants</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                        <Upload className="text-gray-400 group-hover:text-indigo-500 mb-3 transition-colors" size={40} />
                        <p className="text-gray-600 font-medium text-center">Cliquez pour importer la Convention</p>
                        <p className="text-gray-400 text-xs mt-2 text-center">(PDF, JPG, PNG)</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*,application/pdf"
                        />
                    </div>

                    {error && (
                        <div className="flex items-start space-x-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="text-center">
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NewTrainingModal;