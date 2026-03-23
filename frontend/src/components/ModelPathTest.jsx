import { useState, useEffect } from "react";

const ModelPathTest = () => {
  const [modelStatus, setModelStatus] = useState({});
  const [loading, setLoading] = useState(false);

  const checkModelPaths = async () => {
    setLoading(true);
    const status = {};
    
    // List of expected model files
    const modelFiles = [
      '/models/tiny_face_detector/tiny_face_detector_model-shard1',
      '/models/tiny_face_detector/tiny_face_detector_model-weights_manifest.json',
      '/models/face_landmark_68/face_landmark_68_model-shard1',
      '/models/face_landmark_68/face_landmark_68_model-weights_manifest.json',
      '/models/face_recognition/face_recognition_model-shard1',
      '/models/face_recognition/face_recognition_model-shard2',
      '/models/face_recognition/face_recognition_model-weights_manifest.json'
    ];
    
    for (const file of modelFiles) {
      try {
        const response = await fetch(file);
        status[file] = {
          exists: response.ok,
          status: response.status,
          statusText: response.statusText
        };
        console.log(`Checked ${file}:`, status[file]);
      } catch (error) {
        status[file] = {
          exists: false,
          error: error.message
        };
        console.error(`Error checking ${file}:`, error);
      }
    }
    
    setModelStatus(status);
    setLoading(false);
  };

  useEffect(() => {
    checkModelPaths();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Model Path Test</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Model File Status</h2>
          <button
            onClick={checkModelPaths}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Path</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(modelStatus).map(([filePath, status]) => (
                <tr key={filePath}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{filePath}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {status.exists ? 'Found' : 'Missing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {status.exists ? (
                      <span>{status.status} {status.statusText}</span>
                    ) : status.error ? (
                      <span className="text-red-600">{status.error}</span>
                    ) : (
                      <span>File not found</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Instructions</h2>
        <div className="text-sm text-gray-600">
          <p>This test checks if the required face-api.js model files are accessible at their expected paths.</p>
          <p>If any files are missing, you may need to:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Verify that the model files exist in the public/models directory</li>
            <li>Restart the development server</li>
            <li>Check the browser's network tab for 404 errors when loading model files</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ModelPathTest;