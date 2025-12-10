import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  participantName: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, participantName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
      }
    }
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleSave = () => {
    if (canvasRef.current && hasSignature) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transition-colors duration-300">
        <div className="bg-blue-600 p-4 text-white">
          <h3 className="text-lg font-bold">Signature requise</h3>
          <p className="text-blue-100 text-sm">Veuillez signer ci-dessous : {participantName}</p>
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white cursor-crosshair touch-none">
            {/* Canvas always stays white as it simulates paper */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[250px]"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Signez avec votre souris ou votre doigt.</p>
        </div>

        <div className="flex justify-between p-4 bg-white">
            <button 
              onClick={clearCanvas}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500 px-4 py-2 rounded-md transition-colors"
            >
              <Eraser size={18} />
              <span>Effacer</span>
            </button>
            
            <div className="flex space-x-3">
              <button 
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={!hasSignature}
                className={`flex items-center space-x-2 px-6 py-2 rounded-md text-white transition-all ${
                  hasSignature ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Check size={18} />
                <span>Valider</span>
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;