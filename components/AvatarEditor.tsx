import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

interface AvatarEditorProps {
  imageSrc: string;
  onSave: (base64: string) => void;
  onCancel: () => void;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Dragging Logic
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Output size (Standard avatar size)
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // The container is 250px x 250px in the UI
    const containerSize = 250; 
    
    // Logic to map the UI transformation to the Canvas
    // Center point
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Apply transformations
    // We translate to center, apply scale and position, then draw
    // The 'position' state corresponds to pixels in the 250px container.
    // We need to scale that movement up to the 300px canvas relative to the container.
    const ratio = size / containerSize;

    ctx.translate(cx, cy);
    ctx.translate(position.x * ratio, position.y * ratio);
    ctx.scale(scale, scale);
    
    // Draw image centered
    const img = imgRef.current;
    // We draw the image such that its center is at (0,0) in the current context
    // Maintain aspect ratio
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth, drawHeight;

    if (imgAspect > 1) {
        drawHeight = size;
        drawWidth = size * imgAspect;
    } else {
        drawWidth = size;
        drawHeight = size / imgAspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    // Convert to Base64 (JPEG 0.8 quality for compression)
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    onSave(base64);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl animate-fade-in flex flex-col items-center">
        <h3 className="text-xl font-bold text-white mb-4">Editar Foto de Perfil</h3>
        
        {/* Editor Area */}
        <div 
            ref={containerRef}
            className="relative w-[250px] h-[250px] rounded-full overflow-hidden border-4 border-indigo-500 bg-slate-900 shadow-inner mb-6 cursor-move touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
        >
            <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center'
                }}
            >
                <img 
                    ref={imgRef}
                    src={imageSrc} 
                    alt="Edit" 
                    className="max-w-none max-h-none pointer-events-none"
                    style={{
                        // Ensure image covers area initially
                        minWidth: '250px',
                        minHeight: '250px',
                        objectFit: 'cover'
                    }}
                    draggable={false}
                />
            </div>
            
            {/* Overlay hint */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                <Move className="text-white drop-shadow-lg" />
            </div>
        </div>

        {/* Controls */}
        <div className="w-full space-y-4 mb-6 px-4">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-1">
                <ZoomOut size={16} />
                <span>Zoom</span>
                <ZoomIn size={16} />
            </div>
            <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.1" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-center text-xs text-slate-500">
                Arraste a imagem para posicionar
            </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 w-full">
            <button 
                onClick={onCancel}
                className="flex-1 py-3 text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors font-medium flex items-center justify-center"
            >
                <X className="mr-2" size={18}/> Cancelar
            </button>
            <button 
                onClick={handleSave}
                className="flex-1 py-3 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors font-bold shadow-lg shadow-indigo-900/50 flex items-center justify-center"
            >
                <Check className="mr-2" size={18}/> Salvar
            </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;