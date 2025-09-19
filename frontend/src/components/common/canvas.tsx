import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Brush, Square, Circle, Minus, Eraser, Palette, RotateCcw, Download, Maximize2, Minimize2 } from 'lucide-react';

interface ICanvasModal {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id: number;
    username: string;
  };
}

interface DrawingTool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
}

const drawingTools: DrawingTool[] = [
  { id: 'brush', icon: Brush, name: 'Brush' },
  { id: 'line', icon: Minus, name: 'Line' },
  { id: 'rectangle', icon: Square, name: 'Rectangle' },
  { id: 'circle', icon: Circle, name: 'Circle' },
  { id: 'eraser', icon: Eraser, name: 'Eraser' },
];

const colors = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
];

const brushSizes = [2, 5, 10, 15, 20];

function ToolButton({ 
  tool, 
  isActive, 
  onClick 
}: { 
  tool: DrawingTool; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  const IconComponent = tool.icon;
  
  return (
    <motion.button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-500/80 text-white' 
          : 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={tool.name}
    >
      <IconComponent className="w-4 h-4" />
    </motion.button>
  );
}

function ColorPicker({ 
  selectedColor, 
  onColorChange 
}: { 
  selectedColor: string; 
  onColorChange: (color: string) => void; 
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Palette className="w-3 h-3 text-white/60" />
        <span className="text-white/60 text-xs">Color</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {colors.map((color) => (
          <motion.button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-6 h-6 rounded border-2 transition-all ${
              selectedColor === color ? 'border-white scale-110' : 'border-white/30'
            }`}
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}

function BrushSizePicker({ 
  selectedSize, 
  onSizeChange 
}: { 
  selectedSize: number; 
  onSizeChange: (size: number) => void; 
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Brush className="w-3 h-3 text-white/60" />
        <span className="text-white/60 text-xs">Size</span>
      </div>
      <div className="flex gap-1">
        {brushSizes.map((size) => (
          <motion.button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedSize === size ? 'border-white bg-white/20' : 'border-white/30'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div 
              className="rounded-full bg-white"
              style={{ 
                width: Math.max(2, size / 3), 
                height: Math.max(2, size / 3) 
              }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function DrawingCanvas({ 
  onDrawingStart, 
  onDrawingEnd, 
  isFullscreen 
}: { 
  onDrawingStart: () => void; 
  onDrawingEnd: () => void; 
  isFullscreen: boolean; 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState('brush');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPos({ x, y });
    onDrawingStart();

    if (activeTool === 'brush' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    if (activeTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    
    if (activeTool === 'line') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'rectangle') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        startPos.x, 
        startPos.y, 
        x - startPos.x, 
        y - startPos.y
      );
    } else if (activeTool === 'circle') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      const radius = Math.sqrt(
        Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    setIsDrawing(false);
    onDrawingEnd();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `drawing_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 p-2 border-b border-white/10 overflow-x-auto">
        {drawingTools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => setActiveTool(tool.id)}
          />
        ))}
        <div className="w-px h-6 bg-white/20 mx-1" />
        <motion.button
          onClick={clearCanvas}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Clear Canvas"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={downloadCanvas}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Download"
        >
          <Download className="w-4 h-4" />
        </motion.button>
      </div>
      
      <div className="flex-1 flex">
        <div className="w-20 p-2 border-r border-white/10 space-y-3">
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
          <BrushSizePicker
            selectedSize={brushSize}
            onSizeChange={setBrushSize}
          />
        </div>
        
        <div className={`flex-1 ${isFullscreen ? 'p-4' : 'p-2'}`}>
          <canvas
            ref={canvasRef}
            className="w-full h-full bg-white/5 rounded-xl cursor-crosshair border border-white/10"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={() => {
              if (isDrawing) {
                setIsDrawing(false);
                onDrawingEnd();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CanvasModal({
  isOpen,
  onClose,
  currentUser
}: ICanvasModal) {
  const constraintsRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);

  const handleDrawingStart = () => {
    setIsDraggingDisabled(true);
  };

  const handleDrawingEnd = () => {
    setIsDraggingDisabled(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <motion.div
        drag={!isDraggingDisabled && !isFullscreen}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        whileDrag={{ scale: 1.02, rotate: 1 }}
        className={`${
          isFullscreen 
            ? 'fixed inset-4' 
            : 'absolute top-20 left-80 w-96 h-80'
        } bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden transition-all duration-300`}
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          ...(isFullscreen && { x: 0, y: 0 })
        }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative h-full flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          
          <div className="relative flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {!isFullscreen && (
                <GripVertical className="w-4 h-4 text-white/40 cursor-move" />
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                  <Brush className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium">Drawing Canvas</h3>
                  <p className="text-white/60 text-xs">
                    {currentUser ? `${currentUser.username}` : 'Guest User'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-white/60 group-hover:text-white" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-white/60 group-hover:text-white" />
                )}
              </motion.button>
              <motion.button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-white/60 group-hover:text-white" />
              </motion.button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <DrawingCanvas 
              onDrawingStart={handleDrawingStart}
              onDrawingEnd={handleDrawingEnd}
              isFullscreen={isFullscreen}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}