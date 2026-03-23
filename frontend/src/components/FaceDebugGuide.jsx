import { useState, useEffect } from "react";

const FaceDebugGuide = () => {
  const [guideContent, setGuideContent] = useState("");

  useEffect(() => {
    // In a real app, you might fetch this from a file or API
    // For now, we'll use a simplified version
    const content = `
# Face Recognition Debugging Guide

## Common Issues and Solutions

### 1. Preview Not Showing
**Symptoms:**
- Camera light turns on but no video preview is visible
- Canvas overlay not visible
- Black screen or empty space where preview should be

**Debugging Steps:**
1. Check the browser console for JavaScript errors
2. Verify that the video and canvas elements have proper CSS styling
3. Ensure that the z-index values are set correctly
4. Check if there are any CSS conflicts in the parent components

### 2. Models Not Loading
**Symptoms:**
- "Loading face recognition models..." message never completes
- Error messages about missing model files
- Face detection fails immediately

**Debugging Steps:**
1. Check the Network tab in browser dev tools for 404 errors on model files
2. Verify that model files exist in the \`public/models\` directory
3. Check that the model directory structure matches the expected format

### 3. Face Detection Not Working
**Symptoms:**
- Video preview shows but no face detection occurs
- "No face detected" messages even when face is visible
- Detection works in isolation but not in the main app

**Debugging Steps:**
1. Check that models are properly loaded before detection
2. Verify that video element has loaded metadata
3. Ensure canvas dimensions match video dimensions
4. Check for CORS issues or browser compatibility problems

### 4. Integration Issues
**Symptoms:**
- Face recognition works in isolation but not when integrated into Login/SignUp components
- Props not passing correctly between components
- State management issues

**Debugging Steps:**
1. Add console logging to trace component lifecycle
2. Verify that props are passed correctly between parent and child components
3. Check that state updates are triggering re-renders
4. Ensure cleanup functions are properly implemented

## Testing URLs

Use these URLs to test different aspects:

1. **Isolated Face Preview Test**: http://localhost:5183/face-preview-test
2. **Model Path Test**: http://localhost:5183/model-path-test
3. **CSS Debug Test**: http://localhost:5183/css-debug
4. **Integration Debug Test**: http://localhost:5183/integration-debug
5. **Comprehensive Debug Test**: http://localhost:5183/comprehensive-debug

## Browser Console Debugging

Key console messages to look for:
- "Loading face recognition models..."
- "Models loaded successfully"
- "Requesting camera access..."
- "Camera access granted"
- "Starting face detection..."
- Component mount/unmount messages

## CSS Debugging

Ensure proper CSS for visibility:
\`\`\`css
.face-video {
  display: block !important;
  background-color: #000 !important;
  z-index: 1 !important;
}

.face-canvas {
  display: block !important;
  z-index: 10 !important;
}
\`\`\`

## Network Debugging

Verify model files exist at:
- \`/models/tiny_face_detector/tiny_face_detector_model-shard1\`
- \`/models/face_landmark_68/face_landmark_68_model-shard1\`
- \`/models/face_recognition/face_recognition_model-shard1\`
- \`/models/face_recognition/face_recognition_model-shard2\`

## Troubleshooting Checklist

Before reporting issues:
- [ ] Restart the development server
- [ ] Check browser console for errors
- [ ] Verify model files exist in public/models directory
- [ ] Ensure camera permissions are granted
- [ ] Test in an incognito/private browser window
- [ ] Try a different browser
- [ ] Check that you're using localhost
`;

    setGuideContent(content);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Face Recognition Debugging Guide</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="prose max-w-none">
          {guideContent.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return <h1 key={index} className="text-2xl font-bold text-gray-800 mt-6 mb-4">{paragraph.substring(2)}</h1>;
            } else if (paragraph.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">{paragraph.substring(3)}</h2>;
            } else if (paragraph.startsWith('### ')) {
              return <h3 key={index} className="text-lg font-medium text-gray-800 mt-4 mb-2">{paragraph.substring(4)}</h3>;
            } else if (paragraph.startsWith('- [ ]') || paragraph.startsWith('- [x]')) {
              return (
                <div key={index} className="flex items-start mt-2">
                  <input 
                    type="checkbox" 
                    disabled 
                    checked={paragraph.startsWith('- [x]')}
                    className="mt-1 mr-2"
                  />
                  <span className="text-gray-700">{paragraph.substring(5)}</span>
                </div>
              );
            } else if (paragraph.startsWith('- ')) {
              return <li key={index} className="ml-4 text-gray-700">{paragraph.substring(2)}</li>;
            } else if (paragraph.startsWith('1. ')) {
              return <li key={index} className="ml-4 text-gray-700">{paragraph.substring(3)}</li>;
            } else if (paragraph.startsWith('```')) {
              return (
                <pre key={index} className="bg-gray-100 p-4 rounded-lg mt-2 mb-4 overflow-x-auto">
                  <code className="text-sm">{paragraph.substring(3, paragraph.length - 3)}</code>
                </pre>
              );
            } else {
              return <p key={index} className="text-gray-700 mb-4">{paragraph}</p>;
            }
          })}
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Next Steps</h2>
        <p className="text-blue-700">
          Use the debugging tools available at the test URLs above to identify the specific issue.
          Check the browser console for detailed error messages and use the Network tab to verify
          that all model files are loading correctly.
        </p>
      </div>
    </div>
  );
};

export default FaceDebugGuide;