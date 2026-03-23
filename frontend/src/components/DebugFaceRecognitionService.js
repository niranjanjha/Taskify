import * as faceapi from 'face-api.js';

class DebugFaceRecognitionService {
  constructor() {
    this.modelsLoaded = false;
    this.modelPath = '/models';
    this.loadingPromise = null;
  }

  async loadModels() {
    console.log("[DebugFaceRecognitionService] loadModels called");
    
    // If already loaded, return immediately
    if (this.modelsLoaded) {
      console.log("[DebugFaceRecognitionService] Models already loaded");
      return true;
    }

    // If loading is in progress, return the existing promise
    if (this.loadingPromise) {
      console.log("[DebugFaceRecognitionService] Models loading in progress, returning existing promise");
      return this.loadingPromise;
    }

    // Start loading and store the promise
    console.log("[DebugFaceRecognitionService] Starting model loading process");
    this.loadingPromise = this._loadModelsInternal();
    try {
      await this.loadingPromise;
      this.modelsLoaded = true;
      console.log("[DebugFaceRecognitionService] Models loaded successfully, setting modelsLoaded to true");
      return true;
    } catch (error) {
      // Reset loading state on error so it can be retried
      this.loadingPromise = null;
      console.error("[DebugFaceRecognitionService] Error during model loading:", error);
      throw error;
    }
  }

  async _loadModelsInternal() {
    try {
      console.log("[DebugFaceRecognitionService] Starting internal model loading");
      
      // Load models one by one with individual error handling
      await this._loadModel('Tiny Face Detector', () => 
        faceapi.nets.tinyFaceDetector.loadFromUri(`${this.modelPath}/tiny_face_detector`)
      );
      
      await this._loadModel('Face Landmark 68', () => 
        faceapi.nets.faceLandmark68Net.loadFromUri(`${this.modelPath}/face_landmark_68`)
      );
      
      await this._loadModel('Face Recognition', () => 
        faceapi.nets.faceRecognitionNet.loadFromUri(`${this.modelPath}/face_recognition`)
      );

      // Verify all models are loaded
      const verification = this._verifyModels();
      if (!verification.allLoaded) {
        const error = new Error(`Model verification failed: ${verification.failedModels.join(', ')} not loaded properly`);
        console.error("[DebugFaceRecognitionService] Model verification failed:", error.message);
        throw error;
      }

      console.log("[DebugFaceRecognitionService] All models loaded and verified successfully");
      return true;
    } catch (error) {
      console.error("[DebugFaceRecognitionService] Error loading face recognition models:", error);
      throw error;
    }
  }

  async _loadModel(name, loadFunction) {
    try {
      console.log(`[DebugFaceRecognitionService] Loading ${name} model...`);
      await loadFunction();
      console.log(`[DebugFaceRecognitionService] ${name} model loaded successfully`);
    } catch (error) {
      console.error(`[DebugFaceRecognitionService] Failed to load ${name} model:`, error);
      throw new Error(`Failed to load ${name} model: ${error.message}`);
    }
  }

  _verifyModels() {
    const models = {
      'Tiny Face Detector': faceapi.nets.tinyFaceDetector.isLoaded,
      'Face Landmark 68': faceapi.nets.faceLandmark68Net.isLoaded,
      'Face Recognition': faceapi.nets.faceRecognitionNet.isLoaded
    };

    const failedModels = [];
    let allLoaded = true;

    Object.entries(models).forEach(([name, isLoaded]) => {
      console.log(`[DebugFaceRecognitionService] ${name} loaded:`, isLoaded);
      if (!isLoaded) {
        failedModels.push(name);
        allLoaded = false;
      }
    });

    return { allLoaded, failedModels };
  }

  isReady() {
    const ready = this.modelsLoaded && this._verifyModels().allLoaded;
    console.log("[DebugFaceRecognitionService] isReady:", ready);
    return ready;
  }

  async detectFaceWithVisualization(videoElement, canvasElement) {
    console.log("[DebugFaceRecognitionService] detectFaceWithVisualization called");
    
    if (!this.isReady()) {
      const error = new Error('Face recognition models not loaded');
      console.error("[DebugFaceRecognitionService] Models not ready:", error.message);
      throw error;
    }

    try {
      // Check video element readiness
      console.log("[DebugFaceRecognitionService] Video readyState:", videoElement.readyState);
      console.log("[DebugFaceRecognitionService] Video dimensions:", videoElement.videoWidth, "x", videoElement.videoHeight);
      
      if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
        console.log("[DebugFaceRecognitionService] Video not ready, waiting for metadata...");
        await new Promise((resolve) => {
          const onLoaded = () => {
            videoElement.removeEventListener('loadeddata', onLoaded);
            console.log("[DebugFaceRecognitionService] Video metadata loaded");
            resolve();
          };
          videoElement.addEventListener('loadeddata', onLoaded);
        });
      }

      // Detect face with landmarks
      console.log("[DebugFaceRecognitionService] Starting face detection...");
      
      // Try different detection options
      const detectionOptions = new faceapi.TinyFaceDetectorOptions();
      console.log("[DebugFaceRecognitionService] Detection options:", detectionOptions);
      
      const detections = await faceapi
        .detectSingleFace(videoElement, detectionOptions)
        .withFaceLandmarks();

      console.log("[DebugFaceRecognitionService] Detection result:", detections);
      
      if (detections) {
        // Draw detection results on canvas if provided
        if (canvasElement) {
          console.log("[DebugFaceRecognitionService] Drawing detection results...");
          
          // Ensure canvas dimensions match video
          const displaySize = { 
            width: videoElement.videoWidth || videoElement.width || 640, 
            height: videoElement.videoHeight || videoElement.height || 480
          };
          
          console.log("[DebugFaceRecognitionService] Video dimensions:", displaySize.width, "x", displaySize.height);
          
          // Set canvas dimensions to match video
          canvasElement.width = displaySize.width;
          canvasElement.height = displaySize.height;
          
          console.log("[DebugFaceRecognitionService] Canvas dimensions set to:", canvasElement.width, "x", canvasElement.height);
          
          faceapi.matchDimensions(canvasElement, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvasElement, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetections);
        }

        // Get face descriptor for recognition
        console.log("[DebugFaceRecognitionService] Computing face descriptor...");
        const descriptor = await faceapi.computeFaceDescriptor(videoElement, detections);
        console.log("[DebugFaceRecognitionService] Face descriptor computed, length:", descriptor ? descriptor.length : 0);
        
        return {
          detection: detections,
          descriptor: descriptor
        };
      }

      return null;
    } catch (error) {
      console.error('[DebugFaceRecognitionService] Error detecting face:', error);
      throw new Error(`Face detection failed: ${error.message}`);
    }
  }

  async detectFace(videoElement) {
    console.log("[DebugFaceRecognitionService] detectFace called");
    
    if (!this.isReady()) {
      const error = new Error('Face recognition models not loaded');
      console.error("[DebugFaceRecognitionService] Models not ready:", error.message);
      throw error;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detection;
    } catch (error) {
      console.error('[DebugFaceRecognitionService] Error detecting face:', error);
      throw new Error(`Face detection failed: ${error.message}`);
    }
  }

  // Reset the service state (useful for error recovery)
  reset() {
    console.log("[DebugFaceRecognitionService] reset called");
    this.modelsLoaded = false;
    this.loadingPromise = null;
    
    // Unload models if they were loaded
    if (faceapi.nets.tinyFaceDetector.isLoaded) {
      faceapi.nets.tinyFaceDetector.dispose();
    }
    if (faceapi.nets.faceLandmark68Net.isLoaded) {
      faceapi.nets.faceLandmark68Net.dispose();
    }
    if (faceapi.nets.faceRecognitionNet.isLoaded) {
      faceapi.nets.faceRecognitionNet.dispose();
    }
    
    console.log('[DebugFaceRecognitionService] Face recognition service reset');
  }
}

// Export a singleton instance
const debugFaceRecognitionService = new DebugFaceRecognitionService();
export default debugFaceRecognitionService;