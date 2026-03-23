import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Camera, Zap, User, Lock, Loader2, ScanFace } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import fixedFaceRecognitionService from './FixedFaceRecognitionService';

const FixedFaceLogin = ({ onSubmit, onSwitchMode, onSwitchToEmail }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const url = "http://localhost:4000";

  // Load face-api.js models with better error handling
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded || modelsLoading) return;
      
      setModelsLoading(true);
      try {
        await fixedFaceRecognitionService.loadModels();
        setModelsLoaded(true);
        setModelsLoading(false);
      } catch (err) {
        console.error("Error loading face models:", err);
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
    };
  }, [modelsLoaded, modelsLoading]);

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
    }
  };

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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setDetectionStatus("");
    setIsProcessing(false);
  };

  // Capture face and login
  const captureAndLogin = async () => {
    if (!videoRef.current || !modelsLoaded) {
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
      const detections = canvasRef.current 
        ? await fixedFaceRecognitionService.detectFaceWithVisualization(videoRef.current, canvasRef.current)
        : await fixedFaceRecognitionService.detectFace(videoRef.current);

      if (!detections) {
        setDetectionStatus("No face detected. Please try again.");
        toast.error("No face detected. Please make sure your face is clearly visible in the frame.");
        setIsProcessing(false);
        return;
      }

      setDetectionStatus("Face detected! Authenticating...");
      
      // Extract descriptor from detections
      const faceData = Array.isArray(detections) 
        ? detections 
        : detections.descriptor 
        ? Array.from(detections.descriptor) 
        : Array.from(detections.detection.descriptor);

      // Send face data to backend for authentication
      const { data } = await axios.post(`${url}/api/face/login`, {
        faceData: faceData
      });

      if (!data.success) {
        setDetectionStatus("Authentication failed. Please try again.");
        throw new Error(data.message || "Face authentication failed");
      }

      // Stop camera
      stopCamera();

      // Process successful login
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      
      onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
      toast.success(data.message || "Login successful! Redirecting...");
      
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setDetectionStatus("Authentication failed. Please try again.");
      const msg = err.response?.data?.message || err.message || "Face authentication failed";
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">
      {!showCamera ? (
        <>
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue to Taskify</p>
          </div>

          <div className="space-y-4">
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
                <Camera className="w-4 h-4" /> Login with Face Recognition
              </button>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={onSwitchToEmail}
              className="w-full border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 text-sm font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" /> Login with Email & Password
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchMode}
              className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors"
            >
              Sign Up
            </button>
          </p>
        </>
      ) : (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Face Recognition Login</h3>
          
          <div className="relative mb-4 mx-auto" style={{ width: '100%', maxWidth: '500px' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              onPlay={handleVideoPlay}
              onLoadedMetadata={handleVideoPlay}
              className="face-video w-full h-auto max-h-64 rounded-lg border-2 border-purple-200"
              style={{
                display: 'block',
                backgroundColor: '#000',
                zIndex: 1
              }}
            />
            <canvas 
              ref={canvasRef}
              className="face-canvas absolute top-0 left-0 w-full h-full rounded-lg"
              style={{ 
                display: 'block',
                zIndex: 10
              }}
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
            Position your face in the frame and click "Capture Face" to login
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={captureAndLogin}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                "Capture Face"
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

export default FixedFaceLogin;