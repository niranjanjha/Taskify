import { useState, useRef, useEffect } from "react";
import * as faceapi from 'face-api.js';
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const FaceDetectionDebugger = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [detectionLogs, setDetectionLogs] = useState([]);
  const [streamActive, setStreamActive] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Add log message
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDetectionLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded || modelsLoading) return;
      
      setModelsLoading(true);
      addLog("Starting to load face recognition models...", 'info');
      
      try {
        // Load models with explicit paths
        addLog("Loading Tiny Face Detector model...", 'info');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector');
        
        addLog("Loading Face Landmark 68 model...", 'info');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
        
        addLog("Loading Face Recognition model...", 'info');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
        
        // Verify all models are loaded
        const models = {
          'Tiny Face Detector': faceapi.nets.tinyFaceDetector.isLoaded,
          'Face Landmark 68': faceapi.nets.faceLandmark68Net.isLoaded,
          'Face Recognition': faceapi.nets.faceRecognitionNet.isLoaded
        };
        
        const allLoaded = Object.values(models).every(Boolean);
        
        if (allLoaded) {
          setModelsLoaded(true);
          setModelsLoading(false);
          addLog("All face recognition models loaded successfully!", 'success');
          toast.success("Face recognition models loaded successfully!");
        } else {
          const failed = Object.entries(models)
            .filter(([_, loaded]) => !loaded)
            .map(([name, _]) => name);
          throw new Error(`Failed to load models: ${failed.join(', ')}`);
        }
      } catch (err) {
        addLog(`Error loading face models: ${err.message}`, 'error');
        setModelsLoading(false);
        toast.error(`Failed to load face recognition models: ${err.message}`);
      }
    };

    loadModels();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [modelsLoaded, modelsLoading]);

  // Start camera for face capture
  const startCamera = async () => {
    if (modelsLoading) {
      toast.info("Please wait while face recognition models are loading...");
      return;
    }

    if (!modelsLoaded) {
      toast.error("Face recognition models failed to load. Please refresh the page.");
      return;
    }

    try {
      addLog("Requesting camera access...", 'info');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      addLog("Camera access granted", 'success');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreamActive(true);
        addLog("Video stream attached to video element", 'info');
      }
    } catch (err) {
      addLog(`Error accessing camera: ${err.message}`, 'error');
      toast.error("Unable to access camera. Please check permissions and ensure you're using HTTPS or localhost.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setStreamActive(false);
    setDetectionResult(null);
    addLog("Camera stopped", 'info');
  };

  // Handle video play event to match canvas dimensions
  const handleVideoPlay = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      const width = video.videoWidth || video.width || 640;
      const height = video.videoHeight || video.height || 480;
      
      canvas.width = width;
      canvas.height = height;
      
      addLog(`Video dimensions: ${width}x${height}`, 'info');
      addLog(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`, 'info');
    }
  };

  // Single face detection attempt
  const detectFaceOnce = async () => {
    if (!videoRef.current || !modelsLoaded) {
      return;
    }

    try {
      // Ensure video is ready
      if (videoRef.current.readyState < 2) {
        addLog("Video not ready yet, skipping detection", 'warning');
        return;
      }

      addLog("Attempting face detection...", 'info');
      
      // Clear previous canvas drawings
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      // Make sure canvas dimensions match video
      handleVideoPlay();
      
      // Detect face with landmarks
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      
      addLog(`Detection result: ${detections ? 'Face detected' : 'No face detected'}`, detections ? 'success' : 'warning');
      
      if (detections) {
        // Draw detection results on canvas
        if (canvasRef.current) {
          const displaySize = { 
            width: videoRef.current.videoWidth || videoRef.current.width || canvasRef.current.width, 
            height: videoRef.current.videoHeight || videoRef.current.height || canvasRef.current.height 
          };
          
          // Ensure canvas dimensions match video
          canvasRef.current.width = displaySize.width;
          canvasRef.current.height = displaySize.height;
          
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
          
          addLog("Detection results drawn on canvas", 'info');
        }
        
        setDetectionResult({
          message: "Face detected successfully!",
          detections: detections,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        setDetectionResult({
          message: "No face detected. Please try again.",
          detections: null,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      return detections;
    } catch (err) {
      addLog(`Error during face detection: ${err.message}`, 'error');
      setDetectionResult({
        message: `Error detecting face: ${err.message}`,
        detections: null,
        timestamp: new Date().toLocaleTimeString()
      });
      return null;
    }
  };

  // Start continuous detection
  const startContinuousDetection = () => {
    if (!streamActive || !modelsLoaded) {
      toast.error("Camera not active or models not loaded");
      return;
    }
    
    setIsProcessing(true);
    setDetectionResult(null);
    addLog("Starting continuous face detection...", 'info');
    
    // Run detection immediately
    detectFaceOnce();
    
    // Run detection every 500ms
    detectionIntervalRef.current = setInterval(() => {
      detectFaceOnce();
    }, 500);
  };

  // Stop continuous detection
  const stopContinuousDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsProcessing(false);
    addLog("Continuous face detection stopped", 'info');
  };

  // Clear logs
  const clearLogs = () => {
    setDetectionLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Face Detection Debugger</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Camera Preview</h2>
          
          <div className="relative mb-4" style={{ width: '100%', height: '300px' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              onPlay={handleVideoPlay}
              onLoadedMetadata={handleVideoPlay}
              className="w-full h-full rounded-lg border-2 border-purple-200 bg-black"
              style={{
                display: streamActive ? 'block' : 'none',
                objectFit: 'cover'
              }}
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              style={{ 
                display: streamActive ? 'block' : 'none'
              }}
            />
            {!streamActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Camera not active</p>
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          
          {detectionResult && (
            <div className={`p-3 rounded-lg mb-4 ${
              detectionResult.detections 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-center ${
                detectionResult.detections 
                  ? 'text-green-700' 
                  : 'text-yellow-700'
              }`}>
                {detectionResult.message}
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                {detectionResult.timestamp}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={startCamera}
              disabled={modelsLoading || streamActive}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                modelsLoading || streamActive
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Camera className="w-4 h-4" /> Start Camera
            </button>
            
            <button
              onClick={stopCamera}
              disabled={!streamActive}
              className={`px-4 py-2 rounded-lg font-medium ${
                !streamActive
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Stop Camera
            </button>
            
            <button
              onClick={startContinuousDetection}
              disabled={!streamActive || isProcessing}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                !streamActive || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Loader2 className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} /> 
              {isProcessing ? 'Detecting...' : 'Start Detection'}
            </button>
            
            <button
              onClick={stopContinuousDetection}
              disabled={!isProcessing}
              className={`px-4 py-2 rounded-lg font-medium ${
                !isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              Stop Detection
            </button>
          </div>
          
          {modelsLoading && (
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading face recognition models...</span>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Detection Logs</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
            {detectionLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No logs yet. Start camera and detection to see logs.</p>
            ) : (
              <div className="space-y-2">
                {detectionLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-sm ${
                      log.type === 'error' ? 'bg-red-100 text-red-800' :
                      log.type === 'success' ? 'bg-green-100 text-green-800' :
                      log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <span className="font-mono text-xs">{log.timestamp}</span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Debugging Tips</h3>
                <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Make sure your face is well-lit and centered in the frame</li>
                  <li>Check that the video preview is visible before starting detection</li>
                  <li>Look at the logs to see what's happening during detection</li>
                  <li>If detection fails, try moving closer to the camera</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionDebugger;