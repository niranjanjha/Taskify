import { useState, useRef } from "react";

const CSSDebugTest = () => {
  const [showTest, setShowTest] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startTest = () => {
    setShowTest(true);
    // Simulate getting a stream (we won't actually use the camera for this test)
    setTimeout(() => {
      if (videoRef.current) {
        // Just for testing the display
        videoRef.current.style.backgroundColor = "#333";
      }
    }, 100);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">CSS Debug Test</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col items-center">
          {!showTest ? (
            <button
              onClick={startTest}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Start CSS Test
            </button>
          ) : (
            <div className="relative mb-6 w-full max-w-lg">
              <video 
                ref={videoRef}
                className="w-full h-auto rounded-lg border-2 border-blue-200"
                style={{
                  display: 'block',
                  backgroundColor: '#000',
                  minHeight: '300px',
                  zIndex: 1
                }}
              >
                <source src="#" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <canvas 
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                style={{ 
                  display: 'block',
                  border: '2px solid red',
                  zIndex: 10
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white p-2 rounded">
                  Test Video Preview
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">CSS Debug Information</h2>
        <div className="text-sm text-gray-600">
          <p>This test helps identify CSS conflicts that might be hiding video/canvas elements.</p>
          <p>If you can see the red border around the canvas and the video background, CSS is working correctly.</p>
        </div>
      </div>
    </div>
  );
};

export default CSSDebugTest;