import React, { useRef, useEffect, useState } from 'react';
import { Palette, Eraser, Undo, Redo, Save, X, Minus, Square } from 'lucide-react';

const DoodleCanvas = ({ onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    
    setContext(ctx);
    
    // Save initial state
    saveCanvasState();
  }, []);

  // Update context when color or brush size changes
  useEffect(() => {
    if (context) {
      context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      context.lineWidth = brushSize;
    }
  }, [color, brushSize, tool, context]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e) => {
    if (!context) return;
    
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      context.closePath();
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  const clearCanvas = () => {
    if (!context) return;
    
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const previousState = new Image();
      previousState.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(previousState, 0, 0);
      };
      previousState.src = history[historyStep - 1];
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const nextState = new Image();
      nextState.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(nextState, 0, 0);
      };
      nextState.src = history[historyStep + 1];
      setHistoryStep(historyStep + 1);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    }
  };

  // Color palette options
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
  ];

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        {/* Color Palette */}
        <div className="flex items-center gap-1">
          <Palette size={16} className="text-gray-600" />
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool('pen');
              }}
              className={`w-6 h-6 rounded-full border-2 ${
                color === c && tool === 'pen' ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: c }}
              title={`Color: ${c}`}
            />
          ))}
        </div>
        
        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="text-sm w-6">{brushSize}</span>
        </div>
        
        {/* Tools */}
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded-lg flex items-center gap-1 ${
            tool === 'pen' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
          }`}
          title="Pen tool"
        >
          <Palette size={16} />
          <span className="hidden sm:inline text-xs">Pen</span>
        </button>
        
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-lg flex items-center gap-1 ${
            tool === 'eraser' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
          }`}
          title="Eraser tool"
        >
          <Eraser size={16} />
          <span className="hidden sm:inline text-xs">Eraser</span>
        </button>
        
        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={historyStep <= 0}
          className={`p-2 rounded-lg flex items-center gap-1 ${
            historyStep <= 0 ? 'text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Undo"
        >
          <Undo size={16} />
          <span className="hidden sm:inline text-xs">Undo</span>
        </button>
        
        <button
          onClick={redo}
          disabled={historyStep >= history.length - 1}
          className={`p-2 rounded-lg flex items-center gap-1 ${
            historyStep >= history.length - 1 ? 'text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Redo"
        >
          <Redo size={16} />
          <span className="hidden sm:inline text-xs">Redo</span>
        </button>
        
        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-1"
          title="Clear canvas"
        >
          <Square size={16} />
          <span className="hidden sm:inline text-xs">Clear</span>
        </button>
      </div>
      
      {/* Canvas */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-80 bg-white cursor-crosshair"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:border-gray-400 flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-lg hover:shadow-md flex items-center gap-2"
        >
          <Save size={16} />
          Save Doodle
        </button>
      </div>
    </div>
  );
};

export default DoodleCanvas;