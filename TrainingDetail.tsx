import React, { useState, useEffect } from 'react';
import { TrainingSession, Participant, TrainingStatus } from '../types';
import SignaturePad from './SignaturePad';
import CertificateTemplate from './CertificateTemplate';
import AttendanceSheetTemplate from './AttendanceSheetTemplate';
import { generateTrainingObjectives } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  PenTool, 
  ShieldCheck, 
  Loader2,
  FileText,
  Printer,
  FileSpreadsheet,
  User,
  Edit2,
  Check,
  X,
  UserPlus,
  Building2
} from 'lucide-react';

interface TrainingDetailProps {
  session: TrainingSession;
  onBack: () => void;
  onUpdateSession: (updatedSession: TrainingSession) => void;
}

const AVAILABLE_TRAINERS = [
  "Rali El kohen",
  "Mylène Maignant"
];

const TrainingDetail: React.FC<TrainingDetailProps> = ({ session, onBack, onUpdateSession }) => {
  const [signingParticipantId, setSigningParticipantId] = useState<string | null>(null);
  const [isTrainerSigning, setIsTrainerSigning] = useState(false);
  const [generatingCert, setGeneratingCert] = useState<string | null>(null); // Participant ID
  
  // Trainer Edit State
  const [isEditingTrainer, setIsEditingTrainer] = useState(false);
  const [editedTrainerName, setEditedTrainerName] = useState(session.trainerName);

  // Company Edit State
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editedCompanyName, setEditedCompanyName] = useState(session.companyName);

  // Add Participant State
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');

  // View State (Certificate or Attendance Sheet)
  const [viewMode, setViewMode] = useState<'cert' | 'attendance' | null>(null);
  
  // Certificate Data State
  const [certData, setCertData] = useState<{
    participantName: string;
    objectives: string[];
  } | null>(null);

  // Sync local state when session prop changes
  useEffect(() => {
    setEditedTrainerName(session.trainerName);
    setEditedCompanyName(session.companyName);
  }, [session.trainerName, session.companyName]);

  const handleSignClick = (participantId: string) => {
    setSigningParticipantId(participantId);
  };

  const handleSignatureSave = (signatureData: string) => {
    if (signingParticipantId) {
      // Participant Signature
      const updatedParticipants = session.participants.map(p => 
        p.id === signingParticipantId 
          ? { ...p, hasSigned: true, signature: signatureData, isPresent: true } 
          : p
      );
      
      onUpdateSession({
        ...session,
        participants: updatedParticipants
      });
      setSigningParticipantId(null);
    } else if (isTrainerSigning) {
      // Trainer Signature (Finalize Session)
      onUpdateSession({
        ...session,
        status: TrainingStatus.COMPLETED,
        trainerSignature: signatureData
      });
      setIsTrainerSigning(false);
      // Automatically open attendance sheet to show the result
      setViewMode('attendance');
    }
  };

  const handleSaveTrainerName = () => {
    if (editedTrainerName.trim() === '') return;
    
    // If name changed, we might want to invalidate the signature if it existed
    const hasChanged = editedTrainerName !== session.trainerName;
    
    onUpdateSession({
        ...session,
        trainerName: editedTrainerName,
        // Optional: clear signature if name changed to prevent mismatch
        trainerSignature: hasChanged ? undefined : session.trainerSignature,
        status: hasChanged && session.status === TrainingStatus.COMPLETED ? TrainingStatus.IN_PROGRESS : session.status
    });
    setIsEditingTrainer(false);
  };

  const handleSaveCompanyName = () => {
    if (editedCompanyName.trim() === '') return;
    onUpdateSession({
        ...session,
        companyName: editedCompanyName
    });
    setIsEditingCompany(false);
  };

  const handleAddParticipant = () => {
    if (newParticipantName.trim() === '') return;

    const newParticipant: Participant = {
        id: uuidv4(),
        name: newParticipantName,
        email: '', // Default empty as requested to remove display
        role: '',  // Default empty
        hasSigned: false,
        isPresent: false
    };

    onUpdateSession({
        ...session,
        participants: [...session.participants, newParticipant]
    });

    setNewParticipantName('');
    setIsAddParticipantOpen(false);
  };

  const handleGenerateCertificate = async (participant: Participant) => {
    setGeneratingCert(participant.id);
    // Generate educational objectives based on training name
    const objectives = await generateTrainingObjectives(session.trainingName);
    
    setCertData({
        participantName: participant.name,
        objectives: objectives
    });
    setViewMode('cert');
    setGeneratingCert(null);
  };

  const handleShowAttendanceSheet = () => {
    setViewMode('attendance');
  };

  const closeModal = () => {
    setViewMode(null);
    setCertData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const initiateFinalization = () => {
    // Open trainer signature pad immediately to finalize
    setIsTrainerSigning(true);
  };

  const formatDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('/');
  };

  const signingParticipant = session.participants.find(p => p.id === signingParticipantId);
  const progress = Math.round((session.participants.filter(p => p.hasSigned).length / session.participants.length) * 100) || 0;

  // Prepare options for the dropdown, ensuring the current value is present even if not in predefined list
  const trainerOptions = Array.from(new Set([...AVAILABLE_TRAINERS, editedTrainerName])).filter(Boolean);

  return (
    <div className="animate-fade-in pb-12 print:p-0">
      {/* Header - Hide when printing */}
      <div className="flex flex-col space-y-4 mb-6 print:hidden">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <ArrowLeft size={24} />
                </button>
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{session.trainingName}</h1>
                    
                    <div className="flex items-center text-gray-500 mt-1 flex-wrap gap-2">
                        {isEditingCompany ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={editedCompanyName}
                                    onChange={(e) => setEditedCompanyName(e.target.value)}
                                    className="text-sm px-2 py-1 rounded border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                                    autoFocus
                                />
                                <button onClick={handleSaveCompanyName} className="p-1 text-green-600 hover:bg-green-100 rounded">
                                    <Check size={16} />
                                </button>
                                <button onClick={() => { setIsEditingCompany(false); setEditedCompanyName(session.companyName); }} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => setIsEditingCompany(true)}>
                                <span className="font-medium hover:text-indigo-600 transition-colors border-b border-transparent group-hover:border-indigo-200">
                                    {session.companyName}
                                </span>
                                <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                        <span>•</span>
                        <span>{formatDate(session.date)}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === TrainingStatus.COMPLETED 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                    {session.status === TrainingStatus.COMPLETED ? 'Clôturée' : 'En cours'}
                </span>
            </div>
        </div>

        {/* Trainer Info Row */}
        <div className="ml-14 flex items-center bg-gray-50 p-2 rounded-lg w-fit border border-gray-100">
            <User size={16} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-500 mr-2">Formateur :</span>
            
            {isEditingTrainer ? (
                <div className="flex items-center space-x-2">
                    <select 
                        value={editedTrainerName}
                        onChange={(e) => setEditedTrainerName(e.target.value)}
                        className="text-sm px-2 py-1 rounded border border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 cursor-pointer pr-8"
                        autoFocus
                    >
                        {trainerOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <button onClick={handleSaveTrainerName} className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <Check size={16} />
                    </button>
                    <button onClick={() => { setIsEditingTrainer(false); setEditedTrainerName(session.trainerName); }} className="p-1 text-red-600 hover:bg-red-100 rounded">
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => setIsEditingTrainer(true)}>
                    <span className="font-medium text-gray-800 border-b border-transparent group-hover:border-gray-400 transition-all">
                        {session.trainerName}
                    </span>
                    <Edit2 size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
        </div>
      </div>

      {/* Progress Bar - Hide when printing */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 print:hidden transition-colors">
        <div className="flex justify-between items-end mb-2">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Émargement</h3>
                <p className="text-sm text-gray-500">Signatures collectées</p>
            </div>
            <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Participants List - Hide when printing */}
      <div className="space-y-4 print:hidden">
        <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-gray-800">Participants</h3>
             {session.status !== TrainingStatus.COMPLETED && (
                <button 
                    onClick={() => setIsAddParticipantOpen(true)}
                    className="text-sm flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <UserPlus size={16} />
                    <span>Ajouter</span>
                </button>
             )}
        </div>

        <div className="grid grid-cols-1 gap-4">
            {session.participants.map((participant) => (
            <div key={participant.id} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between transition-all ${participant.hasSigned ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'}`}>
                
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${participant.hasSigned ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {participant.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{participant.name}</h4>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    
                    {/* Status Indicator */}
                    <div className="flex items-center space-x-1">
                        {participant.hasSigned ? (
                            <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                                <CheckCircle size={14} className="mr-1" /> Signé
                            </span>
                        ) : (
                            <span className="flex items-center text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded">
                                <XCircle size={14} className="mr-1" /> En attente
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    {session.status !== TrainingStatus.COMPLETED && (
                        <button
                            onClick={() => handleSignClick(participant.id)}
                            disabled={participant.hasSigned}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                participant.hasSigned 
                                ? 'text-gray-400 cursor-default' 
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            }`}
                        >
                            <PenTool size={16} />
                            <span>{participant.hasSigned ? 'Signé' : 'Faire signer'}</span>
                        </button>
                    )}

                    {/* Signature Preview */}
                    {participant.signature && (
                        <div className="h-10 w-24 border border-gray-200 bg-gray-50 rounded overflow-hidden">
                            <img src={participant.signature} alt="Signature" className="h-full w-full object-contain" />
                        </div>
                    )}
                    
                    {/* Generate Cert Button - Only if signed */}
                    {session.status === TrainingStatus.COMPLETED && participant.hasSigned && (
                        <button
                            onClick={() => handleGenerateCertificate(participant)}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Générer Attestation"
                        >
                            {generatingCert === participant.id ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                        </button>
                    )}
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10 flex justify-between items-center print:hidden transition-colors">
          <div className="text-sm text-gray-500 hidden sm:block">
            {session.status === TrainingStatus.COMPLETED 
                ? "Session clôturée. Vous pouvez télécharger la feuille d'émargement."
                : "Assurez-vous que tous les participants présents ont signé."}
          </div>
          
          <div className="flex space-x-3 ml-auto">
            {session.status === TrainingStatus.COMPLETED ? (
                <button
                    onClick={handleShowAttendanceSheet}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-transform transform hover:-translate-y-1 shadow-md"
                >
                    <FileSpreadsheet size={20} />
                    <span>Télécharger l'Émargement</span>
                </button>
            ) : (
                <button
                    onClick={initiateFinalization}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-transform transform hover:-translate-y-1 shadow-md"
                >
                    <ShieldCheck size={20} />
                    <span>Clôturer & Signer</span>
                </button>
            )}
          </div>
      </div>

      {/* Signature Modal (Participant or Trainer) */}
      {(signingParticipantId || isTrainerSigning) && (
        <SignaturePad
          participantName={signingParticipantId ? signingParticipant?.name || '' : session.trainerName}
          onSave={handleSignatureSave}
          onCancel={() => {
              setSigningParticipantId(null);
              setIsTrainerSigning(false);
          }}
        />
      )}

      {/* Add Participant Modal */}
      {isAddParticipantOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                  <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                          <UserPlus size={18} />
                          Ajouter un participant
                      </h3>
                      <button onClick={() => setIsAddParticipantOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
                          <X size={18} />
                      </button>
                  </div>
                  <div className="p-6">
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nom et Prénom</label>
                              <input 
                                  type="text" 
                                  value={newParticipantName}
                                  onChange={(e) => setNewParticipantName(e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                  placeholder="ex: Jean Dupont"
                                  autoFocus
                              />
                          </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                          <button 
                              onClick={() => setIsAddParticipantOpen(false)}
                              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                          >
                              Annuler
                          </button>
                          <button 
                              onClick={handleAddParticipant}
                              disabled={!newParticipantName.trim()}
                              className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${!newParticipantName.trim() ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                          >
                              Ajouter
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Certificate / Attendance Sheet Modal */}
      {viewMode && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-0 sm:p-4 animate-fade-in overflow-y-auto">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[100vh] sm:max-h-[95vh]">
                  
                  {/* Toolbar */}
                  <div className="bg-indigo-900 p-4 text-white flex justify-between items-center print:hidden rounded-t-xl">
                      <div className="flex items-center space-x-3">
                          {viewMode === 'cert' ? <FileText size={24} /> : <FileSpreadsheet size={24} />}
                          <h2 className="text-lg font-bold">
                              {viewMode === 'cert' ? "Aperçu de l'Attestation" : "Feuille d'Émargement"}
                          </h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={handlePrint} className="p-2 hover:bg-indigo-800 rounded transition-colors text-white" title="Imprimer">
                            <Printer size={20} />
                        </button>
                        <button onClick={closeModal} className="p-2 hover:bg-indigo-800 rounded transition-colors text-white">
                            <XCircle size={24} />
                        </button>
                      </div>
                  </div>

                  {/* Document Container */}
                  <div className="overflow-y-auto bg-gray-100 p-4 sm:p-8 flex-1 flex justify-center">
                       {viewMode === 'cert' && certData ? (
                           <CertificateTemplate 
                              participantName={certData.participantName}
                              companyName={session.companyName}
                              trainingName={session.trainingName}
                              date={formatDate(session.date)}
                              duration="7h"
                              objectives={certData.objectives}
                           />
                       ) : (
                           <AttendanceSheetTemplate 
                              sessionDate={formatDate(session.date)}
                              companyName={session.companyName}
                              trainingName={session.trainingName}
                              participants={session.participants}
                              trainerName={session.trainerName}
                              trainerSignature={session.trainerSignature}
                           />
                       )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default TrainingDetail;