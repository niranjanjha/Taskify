import { useState, useEffect } from "react";

const FaceDebugChecklist = () => {
  const [checks, setChecks] = useState({
    modelsLoaded: false,
    cameraAccess: false,
    videoPreview: false,
    faceDetection: false,
    canvasDrawing: false
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState({});

  const steps = [
    {
      id: 'models',
      title: 'Check Model Loading',
      description: 'Verify that face-api.js models are loading correctly',
      action: () => {
        // This would be implemented with actual model loading check
        return new Promise((resolve) => {
          setTimeout(() => {
            const success = Math.random() > 0.3; // Simulate 70% success rate
            setChecks(prev => ({ ...prev, modelsLoaded: success }));
            setResults(prev => ({ ...prev, models: success ? 'Models loaded successfully' : 'Failed to load models' }));
            resolve(success);
          }, 1000);
        });
      }
    },
    {
      id: 'camera',
      title: 'Check Camera Access',
      description: 'Verify that the browser can access the camera',
      action: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const success = Math.random() > 0.2; // Simulate 80% success rate
            setChecks(prev => ({ ...prev, cameraAccess: success }));
            setResults(prev => ({ ...prev, camera: success ? 'Camera access granted' : 'Camera access denied' }));
            resolve(success);
          }, 1000);
        });
      }
    },
    {
      id: 'video',
      title: 'Check Video Preview',
      description: 'Verify that video preview is visible',
      action: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const success = Math.random() > 0.1; // Simulate 90% success rate
            setChecks(prev => ({ ...prev, videoPreview: success }));
            setResults(prev => ({ ...prev, video: success ? 'Video preview visible' : 'Video preview not visible' }));
            resolve(success);
          }, 1000);
        });
      }
    },
    {
      id: 'detection',
      title: 'Check Face Detection',
      description: 'Verify that face detection is working',
      action: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const success = Math.random() > 0.4; // Simulate 60% success rate
            setChecks(prev => ({ ...prev, faceDetection: success }));
            setResults(prev => ({ ...prev, detection: success ? 'Face detection working' : 'Face detection failed' }));
            resolve(success);
          }, 1000);
        });
      }
    },
    {
      id: 'canvas',
      title: 'Check Canvas Drawing',
      description: 'Verify that detection results are drawn on canvas',
      action: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const success = Math.random() > 0.3; // Simulate 70% success rate
            setChecks(prev => ({ ...prev, canvasDrawing: success }));
            setResults(prev => ({ ...prev, canvas: success ? 'Canvas drawing working' : 'Canvas drawing failed' }));
            resolve(success);
          }, 1000);
        });
      }
    }
  ];

  const runNextStep = async () => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      try {
        const success = await step.action();
        console.log(`${step.title}: ${success ? 'PASS' : 'FAIL'}`);
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error(`Error in ${step.title}:`, error);
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const runAllSteps = async () => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await steps[i].action();
    }
    setCurrentStep(steps.length);
  };

  const reset = () => {
    setChecks({
      modelsLoaded: false,
      cameraAccess: false,
      videoPreview: false,
      faceDetection: false,
      canvasDrawing: false
    });
    setResults({});
    setCurrentStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Face Recognition Debug Checklist</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Debug Steps</h2>
          <div className="flex gap-2">
            <button
              onClick={runNextStep}
              disabled={currentStep >= steps.length}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              Run Next Step
            </button>
            <button
              onClick={runAllSteps}
              disabled={currentStep >= steps.length}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              Run All Steps
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`p-4 rounded-lg border ${
                index < currentStep 
                  ? checks[step.id.replace(/\s+/g, '')] 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  index < currentStep 
                    ? checks[step.id.replace(/\s+/g, '')] 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index < currentStep 
                    ? checks[step.id.replace(/\s+/g, '')] 
                      ? '✓' 
                      : '✗'
                    : index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {results[step.id] && (
                    <p className={`text-sm mt-1 ${
                      checks[step.id.replace(/\s+/g, '')] 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      {results[step.id]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Debug Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(checks).map(([key, value]) => (
            <div key={key} className="bg-white p-3 rounded-lg border">
              <div className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className={`font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
                  {value ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Troubleshooting Guide</h2>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li>If models fail to load, check that model files exist in public/models directory</li>
          <li>If camera access fails, ensure you're using HTTPS or localhost and have granted permissions</li>
          <li>If video preview is not visible, check for CSS conflicts or positioning issues</li>
          <li>If face detection fails, verify that face is clearly visible and well-lit</li>
          <li>If canvas drawing fails, check that canvas dimensions match video dimensions</li>
        </ul>
      </div>
    </div>
  );
};

export default FaceDebugChecklist;