import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { Calendar, TrendingUp, CheckCircle, Clock, Target, Award } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const AnalyticsPage = () => {
  const { tasks = [] } = useOutletContext(); // Get tasks from outlet context
  const [timeRange, setTimeRange] = useState('7'); // 7 days by default
  const [analyticsData, setAnalyticsData] = useState({
    completionRate: 0,
    tasksByPriority: [],
    tasksOverTime: [],
    productivityTrend: []
  });

  // Helper function to check if a task is completed
  const isTaskCompleted = (task) => {
    // Handle different completion formats
    if (typeof task.completed === 'boolean') {
      return task.completed;
    }
    if (typeof task.completed === 'string') {
      return task.completed.toLowerCase() === 'yes' || task.completed === 'true';
    }
    return false;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // Process tasks data for analytics
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      // Set default empty state
      setAnalyticsData({
        completionRate: 0,
        tasksByPriority: [
          { name: 'High', value: 0, color: '#c084fc' },
          { name: 'Medium', value: 0, color: '#fde047' },
          { name: 'Low', value: 0, color: '#4ade80' }
        ],
        tasksOverTime: [],
        productivityTrend: []
      });
      return;
    }

    // Calculate completion rate
    const completedTasks = tasks.filter(task => isTaskCompleted(task)).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // Tasks by priority
    const priorityCounts = {
      High: tasks.filter(task => task.priority === 'High').length,
      Medium: tasks.filter(task => task.priority === 'Medium').length,
      Low: tasks.filter(task => task.priority === 'Low').length
    };

    const tasksByPriority = [
      { name: 'High', value: priorityCounts.High, color: '#c084fc' },
      { name: 'Medium', value: priorityCounts.Medium, color: '#fde047' },
      { name: 'Low', value: priorityCounts.Low, color: '#4ade80' }
    ];

    // Tasks over time (last 7 days by default)
    const days = parseInt(timeRange);
    const tasksOverTime = [];
    const productivityTrend = [];
    
    // Create date range
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Process data for each date
    dates.forEach(dateString => {
      const dayTasks = tasks.filter(task => {
        const taskDate = formatDate(task.createdAt);
        return taskDate === dateString;
      });
      
      const completedDayTasks = dayTasks.filter(task => isTaskCompleted(task)).length;
      
      tasksOverTime.push({
        date: dateString,
        tasks: dayTasks.length,
        completed: completedDayTasks
      });
      
      productivityTrend.push({
        date: dateString,
        productivity: dayTasks.length > 0 ? Math.round((completedDayTasks / dayTasks.length) * 100) : 0
      });
    });

    setAnalyticsData({
      completionRate,
      tasksByPriority,
      tasksOverTime,
      productivityTrend
    });
  }, [tasks, timeRange]);

  // COLORS
  const PRIORITY_COLORS = ['#c084fc', '#fde047', '#4ade80'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}${entry.name.includes('Rate') || entry.name.includes('productivity') ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your productivity and task completion trends
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tasks.filter(task => isTaskCompleted(task)).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData.completionRate}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tasks.filter(task => !isTaskCompleted(task)).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tasks Over Time - Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.tasksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="tasks" name="Total Tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Productivity Trend - Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Productivity Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.productivityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="productivity" 
                    name="Productivity" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8b5cf6' }}
                    activeDot={{ r: 6, fill: '#7c3aed' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks by Priority - Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Priority</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.tasksByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion Rate Over Time - Area Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Completion Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.tasksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    name="Completed Tasks" 
                    stroke="#4ade80" 
                    fill="#4ade80" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tasks" 
                    name="Total Tasks" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;