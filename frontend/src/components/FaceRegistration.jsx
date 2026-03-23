import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Camera, CheckCircle, Loader2, ScanFace } from "lucide-react";
import { toast } from "react-toastify";
import faceRecognitionService from './FaceRecognitionService';

const FaceRegistration = ({ onRegistrationComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState(""); // New state for detection feedback
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const url = "http://localhost:4000";

  // Load face-api.js models with better error handling
  useEffect(() => {
    console.log("FaceRegistration component mounted");
    const loadModels = async () => {
      if (modelsLoaded || modelsLoading) {
        console.log("Models already loaded or loading");
        return;
      }
      
      console.log("Starting to load models...");
      setModelsLoading(true);
      try {
        await faceRecognitionService.loadModels();
        console.log("Models loaded successfully");
        setModelsLoaded(true);
        setModelsLoading(false);
        toast.success("Face recognition models loaded successfully!");
      } catch (err) {
        console.error("Error loading face models:", err);
        setModelsLoading(false);
        toast.error(`Failed to load face recognition models: ${err.message}`);
      }
    };

    loadModels();

    // Cleanup function
    return () => {
      console.log("FaceRegistration component unmounting, cleaning up streams");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log("Stopping track:", track);
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, [modelsLoaded, modelsLoading]);

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
      setShowCamera(true);
      setDetectionStatus("Position your face in the frame");
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
    setShowCamera(false);
    setDetectionStatus("");
    setIsProcessing(false);
  };

  // Capture face and register
  const captureAndRegister = async () => {
    console.log("captureAndRegister called");
    if (!videoRef.current || !modelsLoaded) {
      console.log("Video or models not ready", { 
        videoReady: !!videoRef.current, 
        modelsLoaded: modelsLoaded 
      });
      toast.error("Camera or models not ready. Please try again.");
      return;
    }

    setIsProcessing(true);
    setDetectionStatus("Detecting face...");
    
    try {
      // Clear previous canvas drawings
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      // Make sure canvas dimensions match video
      handleVideoPlay();
      
      // Capture face descriptor using the service with visualization
      console.log("Attempting face detection...");
      const detections = canvasRef.current 
        ? await faceRecognitionService.detectFaceWithVisualization(videoRef.current, canvasRef.current)
        : await faceRecognitionService.detectFace(videoRef.current);

      console.log("Detection result:", detections);
      
      if (!detections) {
        setDetectionStatus("No face detected. Please try again.");
        toast.error("No face detected. Please make sure your face is clearly visible in the frame.");
        setIsProcessing(false);
        return;
      }

      setDetectionStatus("Face detected! Registering...");
      console.log("Face detected, proceeding with registration...");
      
      // Extract descriptor from detections
      const faceData = Array.isArray(detections) 
        ? detections 
        : detections.descriptor 
        ? Array.from(detections.descriptor) 
        : Array.from(detections.detection.descriptor);

      console.log("Sending face data to backend:", faceData.length, "elements");
      
      // Send face data to backend for registration
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${url}/api/face/register`, {
        faceData: faceData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Backend response:", data);
      
      if (!data.success) {
        setDetectionStatus("Registration failed. Please try again.");
        throw new Error(data.message || "Face registration failed");
      }

      // Stop camera
      stopCamera();

      // Process successful registration
      setIsRegistered(true);
      toast.success(data.message || "Face registered successfully!");
      onRegistrationComplete?.();
    } catch (err) {
      console.error("Registration error:", err);
      setDetectionStatus("Registration failed. Please try again.");
      const msg = err.response?.data?.message || err.message || "Face registration failed";
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  // Reset registration state
  const resetRegistration = () => {
    setIsRegistered(false);
    setShowCamera(false);
    stopCamera();
  };

  if (isRegistered) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-800 mb-1">Face Registered Successfully!</h3>
        <p className="text-green-600 text-sm mb-4">You can now use face recognition to login</p>
        <button
          onClick={resetRegistration}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Register Another Face
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="text-purple-500 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-800">Face Registration</h3>
      </div>
      
      {!showCamera ? (
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-4">
            Register your face to enable face recognition login
          </p>
          
          {modelsLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin mb-2" />
              <p className="text-gray-600 text-sm">Loading face recognition models...</p>
              <p className="text-gray-500 text-xs mt-1">This may take a few seconds</p>
            </div>
          ) : (
            <button
              onClick={startCamera}
              disabled={!modelsLoaded}
              className={`w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${!modelsLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Camera className="w-4 h-4" /> Register Face
            </button>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="relative mb-4 mx-auto" style={{ width: '100%', maxWidth: '500px' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              onPlay={handleVideoPlay}
              onLoadedMetadata={handleVideoPlay}
              className="face-video w-full h-auto max-h-64 rounded-lg border-2 border-purple-200"
            />
            <canvas 
              ref={canvasRef}
              className="face-canvas absolute top-0 left-0 w-full h-full rounded-lg"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          
          {/* Detection status feedback */}
          <div className="mb-4">
            {detectionStatus && (
              <div className="flex items-center justify-center gap-2 p-2 bg-purple-50 rounded-lg">
                <ScanFace className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-purple-700">{detectionStatus}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            Position your face in the frame and click "Register Face"
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={captureAndRegister}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                "Register Face"
              )}
            </button>
            
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceRegistration;