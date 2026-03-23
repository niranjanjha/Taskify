import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';

class FixedFaceRecognitionService {
  constructor() {
    this.modelsLoaded = false;
    this.modelPath = '/models';
    this.loadingPromise = null;
  }

  async loadModels() {
    // If already loaded, return immediately
    if (this.modelsLoaded) {
      return true;
    }

    // If loading is in progress, return the existing promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading and store the promise
    this.loadingPromise = this._loadModelsInternal();
    try {
      await this.loadingPromise;
      this.modelsLoaded = true;
      return true;
    } catch (error) {
      // Reset loading state on error so it can be retried
      this.loadingPromise = null;
      throw error;
    }
  }

  async _loadModelsInternal() {
    try {
      toast.info("Loading face recognition models...");
      
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
        throw new Error(`Model verification failed: ${verification.failedModels.join(', ')} not loaded properly`);
      }

      toast.success("Face recognition models loaded successfully!");
      return true;
    } catch (error) {
      console.error("Error loading face recognition models:", error);
      toast.error(`Failed to load face recognition models: ${error.message}`);
      throw error;
    }
  }

  async _loadModel(name, loadFunction) {
    try {
      console.log(`Loading ${name} model...`);
      await loadFunction();
      console.log(`${name} model loaded successfully`);
    } catch (error) {
      console.error(`Failed to load ${name} model:`, error);
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
      console.log(`${name} loaded:`, isLoaded);
      if (!isLoaded) {
        failedModels.push(name);
        allLoaded = false;
      }
    });

    return { allLoaded, failedModels };
  }

  isReady() {
    return this.modelsLoaded && this._verifyModels().allLoaded;
  }

  async detectFaceWithVisualization(videoElement, canvasElement) {
    if (!this.isReady()) {
      throw new Error('Face recognition models not loaded');
    }

    try {
      // Ensure video element has loaded metadata
      if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
        await new Promise((resolve) => {
          const onLoaded = () => {
            videoElement.removeEventListener('loadeddata', onLoaded);
            resolve();
          };
          videoElement.addEventListener('loadeddata', onLoaded);
        });
      }

      // Use a more permissive detection option
      const detectionOptions = new faceapi.TinyFaceDetectorOptions(0.3); // Lower confidence threshold
      
      // Detect face with landmarks
      const detections = await faceapi
        .detectSingleFace(videoElement, detectionOptions)
        .withFaceLandmarks();

      if (detections) {
        // Draw detection results on canvas if provided
        if (canvasElement) {
          // Ensure canvas dimensions match video
          const displaySize = { 
            width: videoElement.videoWidth || videoElement.width || 640, 
            height: videoElement.videoHeight || videoElement.height || 480
          };
          
          // Set canvas dimensions to match video
          canvasElement.width = displaySize.width;
          canvasElement.height = displaySize.height;
          
          faceapi.matchDimensions(canvasElement, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvasElement, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetections);
        }

        // Get face descriptor for recognition
        const descriptor = await faceapi.computeFaceDescriptor(videoElement, detections);
        return {
          detection: detections,
          descriptor: descriptor
        };
      }

      return null;
    } catch (error) {
      console.error('Error detecting face:', error);
      throw new Error(`Face detection failed: ${error.message}`);
    }
  }

  async detectFace(videoElement) {
    if (!this.isReady()) {
      throw new Error('Face recognition models not loaded');
    }

    try {
      // Use a more permissive detection option
      const detectionOptions = new faceapi.TinyFaceDetectorOptions(0.3); // Lower confidence threshold
      
      const detection = await faceapi
        .detectSingleFace(videoElement, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detection;
    } catch (error) {
      console.error('Error detecting face:', error);
      throw new Error(`Face detection failed: ${error.message}`);
    }
  }

  // Reset the service state (useful for error recovery)
  reset() {
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
    
    console.log('Face recognition service reset');
  }
}

// Export a singleton instance
const fixedFaceRecognitionService = new FixedFaceRecognitionService();
export default fixedFaceRecognitionService;