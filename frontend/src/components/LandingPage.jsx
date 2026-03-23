import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Users, Bell, ArrowRight, Zap, Menu, X } from 'lucide-react';
import CSSLoaders from './CSSLoaders';
import { SplineLanding } from './ui/spline-landing';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Task Management",
      description: "Create, organize, and track all your tasks in one place"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Assign tasks to team members and collaborate in real-time"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Deadline Tracking",
      description: "Never miss a deadline with automated reminders"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Notifications",
      description: "Get timely notifications for upcoming tasks and deadlines"
    }
  ];

  // Realistic stats for a task management app
  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "200K+", label: "Tasks Completed" },
    { value: "15K+", label: "Teams" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100">
      {/* Floating Navbar */}
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-purple-100 rounded-3xl px-8 py-4 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`} style={{width: '90%', maxWidth: '1200px'}}>
        <div className="flex items-center justify-between">
          {/* Zap Icon and Taskify name on the left */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-800">Taskify</span>
          </div>
          
          {/* All navigation buttons together in the center */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-600 hover:text-purple-600 font-medium transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-600 after:bottom-[-5px] after:left-1/2 after:transform after:-translate-x-1/2 after:transition-all after:duration-300 hover:after:w-full after:rounded">Home</a>
            <a href="#features" className="text-gray-600 hover:text-purple-600 font-medium transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-600 after:bottom-[-5px] after:left-1/2 after:transform after:-translate-x-1/2 after:transition-all after:duration-300 hover:after:w-full after:rounded">Features</a>
            <div className="h-4 w-px bg-purple-200"></div>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-full bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 font-medium transition-all"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:shadow-md transition-all font-medium"
            >
              Sign Up
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden text-purple-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-purple-100">
            <div className="flex flex-col gap-4">
              <a href="#home" className="text-gray-600 hover:text-purple-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Home</a>
              <a href="#features" className="text-gray-600 hover:text-purple-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                  className="px-5 py-2 rounded-full bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 font-medium transition-all w-full"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    setIsMenuOpen(false);
                  }}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:shadow-md transition-all font-medium w-full"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center px-4 pt-32">
        <div className="w-full max-w-6xl">
          <SplineLanding />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage tasks efficiently and collaborate seamlessly
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-purple-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have already simplified their task management with Taskify
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
          >
            Get Started For Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-800">Taskify</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Terms</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Taskify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;