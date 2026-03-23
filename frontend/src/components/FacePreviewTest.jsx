import { useState, useRef, useEffect } from "react";
import * as faceapi from 'face-api.js';
import { Camera, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const FacePreviewTest = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    console.log("FacePreviewTest component mounted");
    const loadModels = async () => {
      if (modelsLoaded || modelsLoading) {
        console.log("Models already loaded or loading");
        return;
      }
      
      console.log("Starting to load models...");
      setModelsLoading(true);
      try {
        console.log("Loading face recognition models...");
        toast.info("Loading face recognition models...");
        
        // Load models with explicit paths
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
        
        setModelsLoaded(true);
        setModelsLoading(false);
        toast.success("Face recognition models loaded successfully!");
        console.log("All models loaded successfully");
      } catch (err) {
        console.error("Error loading face models:", err);
        setModelsLoading(false);
        toast.error(`Failed to load face recognition models: ${err.message}`);
      }
    };

    loadModels();

    // Cleanup function
    return () => {
      console.log("FacePreviewTest component unmounting, cleaning up streams");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log("Stopping track:", track);
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, [modelsLoaded, modelsLoading]);

  // Start camera for face capture
  const startCamera = async () => {
    console.log("startCamera called");
    if (modelsLoading) {
      toast.info("Please wait while face recognition models are loading...");
      return;
    }

    if (!modelsLoaded) {
      toast.error("Face recognition models failed to load. Please refresh the page.");
      return;
    }

    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      console.log("Camera access granted, stream:", stream);
      if (videoRef.current) {
        console.log("Setting video srcObject");
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Unable to access camera. Please check permissions and ensure you're using HTTPS or localhost.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    console.log("stopCamera called");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log("Stopping track:", track);
        track.stop();
      });
      streamRef.current = null;
    }
    setDetectionResult(null);
  };

  // Handle video play event to match canvas dimensions
  const handleVideoPlay = () => {
    console.log("handleVideoPlay called");
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      const width = video.videoWidth || video.width || 640;
      const height = video.videoHeight || video.height || 480;
      
      console.log("Setting canvas dimensions:", width, "x", height);
      canvas.width = width;
      canvas.height = height;
      
      console.log("Video dimensions:", width, "x", height);
      console.log("Canvas dimensions set to:", canvas.width, "x", canvas.height);
    } else {
      console.log("Video or canvas not available in handleVideoPlay");
    }
  };

  // Detect face
  const detectFace = async () => {
    console.log("detectFace called");
    if (!videoRef.current || !modelsLoaded) {
      console.log("Video or models not ready", { 
        videoReady: !!videoRef.current, 
        modelsLoaded: modelsLoaded 
      });
      toast.error("Camera or models not ready. Please try again.");
      return;
    }

    setIsProcessing(true);
    setDetectionResult(null);
    
    try {
      console.log("Starting face detection...");
      
      // Clear previous canvas drawings
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      // Make sure canvas dimensions match video
      handleVideoPlay();
      
      // Detect face with landmarks
      console.log("Detecting face...");
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      
      console.log("Detection result:", detections);
      
      if (detections) {
        // Draw detection results on canvas
        if (canvasRef.current) {
          console.log("Drawing detection results...");
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
        }
        
        setDetectionResult({
          message: "Face detected successfully!",
          detections: detections
        });
      } else {
        setDetectionResult({
          message: "No face detected. Please try again.",
          detections: null
        });
      }
    } catch (err) {
      console.error("Error detecting face:", err);
      setDetectionResult({
        message: `Error detecting face: ${err.message}`,
        detections: null
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Face Preview Test</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-6 w-full max-w-lg">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              onPlay={handleVideoPlay}
              onLoadedMetadata={handleVideoPlay}
              className="w-full h-auto rounded-lg border-2 border-blue-200"
              style={{ 
                maxHeight: '400px',
                display: 'block',
                backgroundColor: '#000'
              }}
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              style={{ 
                display: 'block',
                zIndex: 10
              }}
            />
          </div>
          
          {detectionResult && (
            <div className={`w-full max-w-lg p-4 rounded-lg mb-4 ${detectionResult.detections ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-center ${detectionResult.detections ? 'text-green-700' : 'text-red-700'}`}>
                {detectionResult.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={startCamera}
              disabled={modelsLoading || isProcessing}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                modelsLoading || isProcessing 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Camera className="w-4 h-4" /> Start Camera
            </button>
            
            <button
              onClick={detectFace}
              disabled={!modelsLoaded || isProcessing}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                !modelsLoaded || isProcessing 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Detecting...
                </>
              ) : (
                "Detect Face"
              )}
            </button>
            
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
            >
              Stop Camera
            </button>
          </div>
          
          {modelsLoading && (
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading face recognition models...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Debug Information</h2>
        <div className="text-sm text-gray-600">
          <p>Models Loaded: {modelsLoaded ? 'Yes' : 'No'}</p>
          <p>Models Loading: {modelsLoading ? 'Yes' : 'No'}</p>
          <p>Video Available: {videoRef.current ? 'Yes' : 'No'}</p>
          <p>Canvas Available: {canvasRef.current ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default FacePreviewTest;