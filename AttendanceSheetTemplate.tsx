import React from 'react';
import { Square, CheckSquare } from 'lucide-react';
import { Participant } from '../types';

interface AttendanceSheetTemplateProps {
  sessionDate: string;
  companyName: string;
  trainingName: string;
  participants: Participant[];
  trainerName: string;
  trainerSignature?: string;
}

const AttendanceSheetTemplate: React.FC<AttendanceSheetTemplateProps> = ({
  sessionDate,
  companyName,
  trainingName,
  participants,
  trainerName,
  trainerSignature
}) => {
  // Ensure we fill the page somewhat like the PDF if there are few participants
  const minRows = 8;
  const emptyRows = Math.max(0, minRows - participants.length);

  return (
    <div className="bg-white p-8 md:p-12 w-full max-w-4xl mx-auto shadow-none text-slate-900 font-sans text-sm leading-snug" id="attendance-print">
      
      {/* Header Section */}
      <div className="flex flex-col mb-8">
        {/* Logo */}
        <div className="mb-6">
           <span className="font-bold text-4xl text-[#1d4ed8] tracking-tight">dfm</span>
        </div>

        {/* Session Info Box */}
        <div className="border-2 border-black p-4 max-w-2xl mx-auto w-full">
            <h2 className="text-center font-bold text-lg mb-4 uppercase tracking-wide">SESSION DE FORMATION</h2>
            
            <div className="grid grid-cols-[100px_1fr] gap-y-1 text-sm">
            <div className="font-bold">Date</div>
            <div>: {sessionDate}</div>

            <div className="font-bold">Durée</div>
            <div>: 1 journées</div>

            <div className="font-bold">Horaires</div>
            <div>: 9 :30 à 17 :30</div>

            <div className="font-bold">Thème</div>
            <div className="font-bold">: {trainingName}</div>

            <div className="font-bold">Lieu</div>
            <div>: Site client</div>
            </div>
        </div>
      </div>

      <h3 className="text-center font-bold text-lg mb-6 uppercase tracking-wide">LISTE DE PRÉSENCE DES PARTICIPANTS</h3>

      {/* Table */}
      <div className="w-full border-t border-l border-black mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="border-r border-b border-black p-2 w-20 text-center font-bold">Date</th>
              <th className="border-r border-b border-black p-2 w-32 text-center font-bold">Société</th>
              <th className="border-r border-b border-black p-2 text-center font-bold">Prénom et Nom</th>
              <th className="border-r border-b border-black p-2 w-56 text-center font-bold text-xs leading-tight">Prise en compte règlement intérieur</th>
              <th className="border-r border-b border-black p-2 w-28 text-center font-bold leading-tight">Signature<br/>MATIN</th>
              <th className="border-r border-b border-black p-2 w-28 text-center font-bold leading-tight">Signature<br/>APRÈS-MIDI</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id}>
                <td className="border-r border-b border-black p-2 text-center text-xs h-16">{sessionDate}</td>
                <td className="border-r border-b border-black p-2 text-center text-xs break-words">{companyName}</td>
                <td className="border-r border-b border-black p-2 font-medium text-center">{p.name}</td>
                <td className="border-r border-b border-black p-2 text-[10px] leading-tight align-middle">
                  <div className="flex items-start">
                    {p.hasSigned ? <CheckSquare size={14} className="mt-0.5 mr-1 flex-shrink-0" /> : <Square size={14} className="mt-0.5 mr-1 flex-shrink-0" />}
                    <span>En cochant et en signant j'atteste avoir pris connaissance du règlement intérieur</span>
                  </div>
                </td>
                <td className="border-r border-b border-black p-1 text-center align-middle">
                   {p.hasSigned && p.signature ? (
                       <img src={p.signature} alt="Signature" className="h-12 w-auto mx-auto object-contain" />
                   ) : (
                       <span className="text-xs font-bold text-slate-400">ABSENT</span>
                   )}
                </td>
                <td className="border-r border-b border-black p-1 text-center align-middle">
                    {p.hasSigned && p.signature ? (
                       <img src={p.signature} alt="Signature" className="h-12 w-auto mx-auto object-contain" />
                   ) : (
                       <span className="text-xs font-bold text-slate-400">ABSENT</span>
                   )}
                </td>
              </tr>
            ))}
            
            {/* Empty rows to mimic the PDF structure */}
            {Array.from({ length: emptyRows }).map((_, idx) => (
                <tr key={`empty-${idx}`}>
                    <td className="border-r border-b border-black p-2 h-16"></td>
                    <td className="border-r border-b border-black p-2"></td>
                    <td className="border-r border-b border-black p-2"></td>
                    <td className="border-r border-b border-black p-2 text-[10px] leading-tight align-middle">
                        <div className="flex items-start">
                            <Square size={14} className="mt-0.5 mr-1 flex-shrink-0" />
                            <span>En cochant et en signant j'atteste avoir pris connaissance du règlement intérieur</span>
                        </div>
                    </td>
                    <td className="border-r border-b border-black p-2"></td>
                    <td className="border-r border-b border-black p-2"></td>
                </tr>
            ))}
            
            {/* Formateur Row - Blue Background */}
            <tr className="bg-blue-200">
                <td colSpan={2} className="border-r border-b border-black p-2 h-16 align-middle font-medium pl-4">
                    Formateur
                </td>
                <td colSpan={1} className="border-r border-b border-black p-2 align-middle font-bold text-center">
                    {trainerName}
                </td>
                <td className="border-r border-b border-black p-2 bg-white"></td>
                <td colSpan={2} className="border-r border-b border-black p-2 bg-white text-center align-middle">
                    {trainerSignature ? (
                        <img src={trainerSignature} alt="Signature Formateur" className="h-12 w-auto mx-auto object-contain" />
                    ) : null}
                </td>
            </tr>

            {/* DFM Row */}
            <tr>
                <td colSpan={2} className="border-r border-b border-black p-2 h-16 align-middle font-medium pl-4">
                    DFM
                </td>
                <td colSpan={1} className="border-r border-b border-black p-2"></td>
                <td className="border-r border-b border-black p-2"></td>
                <td colSpan={2} className="border-r border-b border-black p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Signatures */}
      <div className="flex justify-between items-end mb-12 px-4">
        <div className="text-sm">
             Date :
        </div>
        
        <div className="text-right text-sm">
            <p className="mb-4">Signature et cachet de l’organisme de formation :</p>
            {/* Space for stamp/signature */}
            <div className="h-20 w-48 ml-auto"></div>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="text-[10px] text-left text-gray-600 space-y-1 mt-auto pt-4 border-t-2 border-gray-300">
        <p>Siège: DFM – 13 rue Séjourné - 94000 Créteil</p>
        <p>N° d’enregistrement : </p>
        <p>N° SIRET 44451729600075</p>
        <p className="mt-2 pt-2">
            Notre politique de protection des données personnelles est disponible en suivant le lien :<br/>
            <a href="https://groupe-dfm.fr/politique-de-confidentialite" className="text-blue-600 underline">https://groupe-dfm.fr/politique-de-confidentialite</a>.
        </p>
      </div>

    </div>
  );
};

export default AttendanceSheetTemplate;