import React from 'react';

interface CertificateTemplateProps {
  participantName: string;
  companyName: string;
  trainingName: string;
  date: string;
  duration: string; // e.g., "7h"
  objectives: string[];
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  participantName,
  companyName,
  trainingName,
  date,
  duration,
  objectives
}) => {
  return (
    <div className="bg-white p-8 md:p-16 w-full max-w-4xl mx-auto shadow-none text-slate-900 font-sans leading-relaxed relative flex flex-col min-h-[800px]" id="certificate-print">
      
      {/* Header Logo */}
      <div className="mb-12">
        <span className="font-bold text-5xl text-[#1d4ed8] tracking-tight">dfm</span>
      </div>

      {/* Title Box */}
      <div className="border-2 border-[#1d4ed8] rounded-2xl py-6 px-8 text-center mb-12 mx-auto w-full max-w-3xl shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Attestation de fin de formation</h1>
      </div>

      {/* Legal Intro */}
      <div className="mb-10 text-sm md:text-base leading-relaxed">
        <p>
          DFM, organisme de formation certifié Qualiopi sous le N° d'enregistrement NDA : 11941164894 
          dont le N° SIRET est 44451729600075, atteste que :
        </p>
      </div>

      {/* Participant & Training Info */}
      <div className="space-y-6 mb-12 text-sm md:text-base">
        <div className="space-y-2">
            <div>
                <span className="font-bold text-slate-900">Nom du stagiaire : </span>
                <span className="font-medium text-slate-800">{participantName}</span>
            </div>
            
            <div>
                <span className="font-bold text-slate-900">Société : </span>
                <span className="font-medium text-slate-800">{companyName}</span>
            </div>
        </div>

        <div>
             <p>
                A bien suivi la formation : <span className="italic font-medium">{trainingName}</span>
            </p>
        </div>

        <div className="space-y-2">
            <div>
                <span className="font-bold text-slate-900">Durée : </span>
                <span>{duration}</span>
            </div>
            
            <div>
                <span className="font-bold text-slate-900">Dates : </span>
                <span>{date}</span>
            </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="mb-16 flex-1">
        <p className="underline mb-4 text-slate-900">Objectif de formation :</p>
        <ul className="list-none space-y-1 text-sm md:text-base text-slate-800 italic">
            {objectives.length > 0 ? objectives.map((obj, index) => (
                <li key={index}>{obj}</li>
            )) : (
                <>
                    <li>Maitriser la création et l’utilisation de prompts pour des résultats optimaux.</li>
                    <li>Explorer des cas concrets d’utilisation de l’IA.</li>
                    <li>Élaborer des stratégies personnalisées pour intégrer l’IA dans vos processus.</li>
                    <li>Conscientiser aux enjeux éthiques et à la protection des données dans l’utilisation de l’IA.</li>
                </>
            )}
        </ul>
      </div>

      {/* Footer Section */}
      <div className="mt-auto flex flex-col items-end w-full">
        
        {/* Date and Place */}
        <div className="mb-4 text-right">
            <p>Fait le <span className="bg-yellow-200 px-1 font-medium">{new Date().toLocaleDateString('fr-FR')}</span> à Créteil</p>
        </div>
        
        {/* Stamp & Signature Area */}
        <div className="relative w-56 h-32 mb-8">
             {/* Stamp Image simulation */}
             <div className="absolute top-0 right-0 w-48 h-24 border-2 border-blue-600 rounded-lg p-2 rotate-[-3deg] opacity-80 flex flex-col items-center justify-center">
                <span className="text-blue-700 font-bold text-xl uppercase tracking-widest">dfm</span>
                <span className="text-blue-600 text-[10px] mt-1">13 rue Séjourné - 94000 CRÉTEIL</span>
                <span className="text-blue-600 text-[10px]">Tél : 01 43 99 60 00 - Fax : 01 43 99 60 10</span>
                <span className="text-blue-600 text-[9px] mt-1">Siren 444 517 296 - N° de TVA : FR71444517296</span>
             </div>
             {/* Signature line simulation */}
             <div className="absolute bottom-4 right-10 w-24 h-12">
                 <svg viewBox="0 0 100 50" className="w-full h-full text-blue-800 opacity-70">
                     <path d="M10,25 Q30,5 50,25 T90,25" fill="none" stroke="currentColor" strokeWidth="2" />
                     <path d="M20,30 Q40,40 60,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                 </svg>
             </div>
        </div>

        {/* Footer Address Block */}
        <div className="text-right text-xs md:text-sm text-slate-700 leading-tight">
            <p className="italic">DFM 13 rue Séjourné 94000 Créteil</p>
            <p className="italic">NDA : 11941164894</p>
            <p className="italic">Siret : 44451729600075</p>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;