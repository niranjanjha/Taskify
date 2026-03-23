import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Leaf, Waves, Sun } from 'lucide-react';
import './ZenSpacePage.css'; // Import the CSS file

const ZenSpacePage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [workSessions, setWorkSessions] = useState(0);
  const [breakTime, setBreakTime] = useState(5 * 60); // 5 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' or 'break'

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer completed
      setIsRunning(false);
      
      // Play sound or notification
      if (typeof window !== 'undefined' && window.Notification) {
        new Notification('Taskify Zen Space', {
          body: isBreak ? 'Break time is over! Ready to focus?' : 'Great job! Time for a break!',
          icon: '/favicon.ico'
        });
      }
      
      // Switch between work and break
      if (sessionType === 'work') {
        setWorkSessions(workSessions + 1);
        setSessionType('break');
        setTimeLeft(breakTime);
        setIsBreak(true);
      } else {
        setSessionType('work');
        setTimeLeft(25 * 60);
        setIsBreak(false);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, workSessions, breakTime, isBreak]);

  // Start/pause timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'work' ? 25 * 60 : breakTime);
  };

  // Set custom time
  const setCustomTime = (minutes) => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  // Set break time
  const setCustomBreakTime = (minutes) => {
    setBreakTime(minutes * 60);
    if (isBreak) {
      setTimeLeft(minutes * 60);
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-purple-600" />
              Zen Space
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Focus timer to boost your productivity with mindful breaks
            </p>
          </div>
        </div>

        {/* Main Timer Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 mb-6">
          <div className="text-center">
            {/* Session Type Indicator */}
            <div className="flex justify-center mb-4">
              <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                isBreak 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {isBreak ? 'Break Time' : 'Focus Time'}
              </span>
            </div>

            {/* Timer Display */}
            <div className="mb-8">
              <div className="text-6xl md:text-7xl font-bold text-gray-800 mb-2 font-mono zen-timer-display">
                {formatTime(timeLeft)}
              </div>
              <p className="text-gray-500">
                {isBreak 
                  ? 'Take a deep breath and relax' 
                  : 'Stay focused on your task'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {timeLeft === (sessionType === 'work' ? 25 * 60 : breakTime) ? 'Start' : 'Resume'}
                  </>
                )}
              </button>
              
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 bg-white border border-purple-200 text-purple-700 px-6 py-3 rounded-xl shadow-sm hover:bg-purple-50 transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>

            {/* Session Counter */}
            <div className="bg-purple-50 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-purple-700 font-medium">
                Completed Focus Sessions: <span className="font-bold">{workSessions}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Timer Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Work Time Presets */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-purple-600" />
              Focus Duration
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[15, 25, 45].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => {
                    if (!isBreak) {
                      setCustomTime(minutes);
                    }
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !isBreak && timeLeft === minutes * 60
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                  disabled={isBreak}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>

          {/* Break Time Presets */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-purple-600" />
              Break Duration
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 15].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setCustomBreakTime(minutes)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    breakTime === minutes * 60
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Waves className="w-5 h-5 text-purple-600" />
            Zen Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2 zen-tip-item">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Start with 25-minute focus sessions and 5-minute breaks (Pomodoro Technique)</span>
            </li>
            <li className="flex items-start gap-2 zen-tip-item">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>During breaks, step away from your screen and take deep breaths</span>
            </li>
            <li className="flex items-start gap-2 zen-tip-item">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Stay hydrated and keep healthy snacks nearby</span>
            </li>
            <li className="flex items-start gap-2 zen-tip-item">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Track your completed sessions to build a productive routine</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ZenSpacePage;