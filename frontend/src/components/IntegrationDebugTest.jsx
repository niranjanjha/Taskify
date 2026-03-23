import { useState } from "react";
import Login from "./Login";

const IntegrationDebugTest = () => {
  const [authData, setAuthData] = useState(null);
  
  const handleAuthSubmit = (data) => {
    console.log("Auth submitted:", data);
    setAuthData(data);
  };
  
  const handleSwitchMode = () => {
    console.log("Switch mode called");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-fuchsia-50 to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGw0MCA0ME00MCAwTDAgNDAiIHN0cm9rZT0iI2Q5ZTBmMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] opacity-10"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white shadow-lg border border-purple-100 rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Integration Debug Test</h2>
          <p className="text-gray-600 mb-6">This test replicates the exact same structure as the main Login component.</p>
          
          <Login 
            onSubmit={handleAuthSubmit}
            onSwitchMode={handleSwitchMode}
          />
          
          {authData && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800">Auth Data Received:</h3>
              <pre className="text-sm text-green-700 mt-2">{JSON.stringify(authData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationDebugTest;