import { useState, useRef, useEffect } from "react";
import faceRecognitionService from './FaceRecognitionService';
import { Camera, Loader2, ScanFace } from "lucide-react";

const FaceDetectionTest = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("Click 'Start Test' to begin");
  const [detectionResult, setDetectionResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded || modelsLoading) return;
      
      setModelsLoading(true);
      setDetectionStatus("Loading face recognition models...");
      try {
        await faceRecognitionService.loadModels();
        setModelsLoaded(true);
        setModelsLoading(false);
        setDetectionStatus("Models loaded successfully! Click 'Start Camera' to test.");
      } catch (err) {
        console.error("Error loading face models:", err);
        setModelsLoading(false);
        setDetectionStatus(`Failed to load models: ${err.message}`);
      }
    };

    loadModels();
  }, [modelsLoaded, modelsLoading]);

  const startCamera = async () => {
    if (modelsLoading) {
      setDetectionStatus("Please wait while models are loading...");
      return;
    }

    if (!modelsLoaded) {
      setDetectionStatus("Models not loaded. Please refresh the page.");
      return;
    }

    try {
      setDetectionStatus("Accessing camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setDetectionStatus("Camera started! Position your face in the frame.");
    } catch (err) {
      console.error("Error accessing camera:", err);
      setDetectionStatus("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsProcessing(false);
    setDetectionStatus("Camera stopped.");
  };

  const testDetection = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    setIsProcessing(true);
    setDetectionStatus("Detecting face...");
    setDetectionResult(null);
    
    try {
      // Clear previous canvas drawings
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      // Detect face with visualization
      const detections = await faceRecognitionService.detectFaceWithVisualization(videoRef.current, canvasRef.current);

      if (!detections) {
        setDetectionStatus("No face detected. Please try again.");
        setIsProcessing(false);
        return;
      }

      setDetectionStatus("Face detected successfully!");
      setDetectionResult({
        confidence: detections.detection.detection.score,
        landmarks: detections.detection.landmarks ? 'Available' : 'Not available'
      });
    } catch (err) {
      console.error("Error detecting face:", err);
      setDetectionStatus(`Detection failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Face Detection Test</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6">
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 p-3 bg-purple-50 rounded-lg">
            <ScanFace className="w-5 h-5 text-purple-500" />
            <span className="text-purple-700 font-medium">{detectionStatus}</span>
          </div>
        </div>

        {detectionResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Detection Results:</h3>
            <p className="text-green-700">Confidence: {(detectionResult.confidence * 100).toFixed(2)}%</p>
            <p className="text-green-700">Landmarks: {detectionResult.landmarks}</p>
          </div>
        )}

        <div className="relative mb-6 mx-auto" style={{ width: '100%', maxWidth: '500px' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-auto max-h-96 rounded-lg border-2 border-purple-200"
          />
          <canvas 
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            style={{ display: isProcessing ? 'block' : 'none' }}
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
              setModelsLoaded(false);
              setModelsLoading(false);
            }}
            disabled={modelsLoading || isProcessing}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Reset Models
          </button>
          
          <button
            onClick={startCamera}
            disabled={modelsLoading || isProcessing}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Start Camera
          </button>
          
          <button
            onClick={testDetection}
            disabled={!modelsLoaded || isProcessing}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 inline animate-spin mr-1" /> Detecting...
              </>
            ) : (
              "Test Detection"
            )}
          </button>
          
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Stop Camera
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h3>
        <ul className="text-yellow-700 text-sm list-disc pl-5 space-y-1">
          <li>Ensure you have good lighting</li>
          <li>Position your face directly in front of the camera</li>
          <li>Remove any obstructions (glasses, masks, etc.) if possible</li>
          <li>If models fail to load, refresh the page and try again</li>
          <li>Check browser console for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default FaceDetectionTest;