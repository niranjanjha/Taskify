# Face Recognition Debugging Guide

This guide will help you troubleshoot issues with the face recognition feature in the Taskify application.

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

**Solutions:**
- Add explicit CSS classes with `display: block` and `z-index` values
- Ensure video element has a background color (`#000`)
- Verify that canvas element is positioned absolutely over the video

### 2. Models Not Loading

**Symptoms:**
- "Loading face recognition models..." message never completes
- Error messages about missing model files
- Face detection fails immediately

**Debugging Steps:**
1. Check the Network tab in browser dev tools for 404 errors on model files
2. Verify that model files exist in the `public/models` directory
3. Check that the model directory structure matches the expected format

**Solutions:**
- Ensure model files are in the correct subdirectories:
  - `public/models/tiny_face_detector/`
  - `public/models/face_landmark_68/`
  - `public/models/face_recognition/`
- Restart the development server after adding model files
- Verify file names match exactly (including case sensitivity)

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

**Solutions:**
- Add proper event listeners for video metadata loading
- Ensure canvas is resized when video dimensions change
- Verify that face-api.js is properly initialized
- Check that the video stream is active and not paused

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

**Solutions:**
- Add detailed console logging to track execution flow
- Verify prop drilling and callback functions
- Implement proper cleanup in useEffect hooks
- Ensure components are properly unmounted when navigation occurs

## Testing URLs

Use these URLs to test different aspects of the face recognition feature:

1. **Isolated Face Preview Test**: http://localhost:5183/face-preview-test
   - Tests face detection in a simple, isolated environment

2. **Model Path Test**: http://localhost:5183/model-path-test
   - Verifies that all required model files are accessible

3. **CSS Debug Test**: http://localhost:5183/css-debug
   - Tests for CSS conflicts that might hide video/canvas elements

4. **Integration Debug Test**: http://localhost:5183/integration-debug
   - Tests the exact same structure as the main Login component

5. **Comprehensive Debug Test**: http://localhost:5183/comprehensive-debug
   - Full-featured debugging environment with detailed logging

## Browser Console Debugging

When debugging face recognition issues, pay attention to these console messages:

1. **Model Loading Messages**:
   - "Loading face recognition models..."
   - "Models loaded successfully"
   - Error messages about failed model loading

2. **Camera Access Messages**:
   - "Requesting camera access..."
   - "Camera access granted"
   - Error messages about camera permission denied

3. **Face Detection Messages**:
   - "Starting face detection..."
   - "Detection result:"
   - Error messages about face detection failures

4. **Component Lifecycle Messages**:
   - Component mount/unmount messages
   - State change notifications
   - Prop drilling verification

## CSS Debugging

If the preview is not visible, check these CSS properties:

1. **Video Element**:
   ```css
   .face-video {
     display: block !important;
     background-color: #000 !important;
     z-index: 1 !important;
   }
   ```

2. **Canvas Element**:
   ```css
   .face-canvas {
     display: block !important;
     z-index: 10 !important;
   }
   ```

3. **Container Element**:
   - Ensure container has explicit dimensions
   - Check for overflow properties that might hide elements
   - Verify positioning (relative/absolute) is correct

## Network Debugging

If models are not loading, check these network issues:

1. **Model File Paths**:
   - Verify files exist at:
     - `/models/tiny_face_detector/tiny_face_detector_model-shard1`
     - `/models/face_landmark_68/face_landmark_68_model-shard1`
     - `/models/face_recognition/face_recognition_model-shard1`
     - `/models/face_recognition/face_recognition_model-shard2`

2. **HTTP Status Codes**:
   - 200: File found (success)
   - 404: File not found (check file paths)
   - 403: Permission denied (check file permissions)

## Performance Considerations

1. **Model Loading Time**:
   - First load may take several seconds
   - Subsequent loads should be faster due to browser caching

2. **Face Detection Performance**:
   - Detection speed depends on hardware capabilities
   - Poor lighting or low-quality cameras may affect accuracy

3. **Memory Usage**:
   - Face recognition models consume significant memory
   - Ensure proper cleanup to prevent memory leaks

## Browser Compatibility

The face recognition feature has been tested and works with:

1. **Chrome** (latest versions)
2. **Firefox** (latest versions)
3. **Edge** (latest versions)
4. **Safari** (latest versions)

## Security Considerations

1. **HTTPS Requirement**:
   - Camera access requires HTTPS in production
   - Localhost is exempt from this requirement

2. **Privacy**:
   - No images are stored on the server
   - Only facial embeddings are stored for recognition
   - Users must explicitly opt-in to face recognition

## Troubleshooting Checklist

Before reporting issues, verify these common solutions:

- [ ] Restart the development server
- [ ] Check browser console for errors
- [ ] Verify model files exist in public/models directory
- [ ] Ensure camera permissions are granted
- [ ] Test in an incognito/private browser window
- [ ] Clear browser cache and cookies
- [ ] Try a different browser
- [ ] Check that you're using localhost (not IP address)
- [ ] Verify that no ad blockers or extensions are interfering