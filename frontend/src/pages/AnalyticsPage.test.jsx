import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsPage from './AnalyticsPage';

// Mock the useOutletContext hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => ({
    tasks: [
      { 
        _id: '1', 
        title: 'Test Task 1', 
        completed: true, 
        priority: 'High', 
        createdAt: '2023-01-01T10:00:00Z' 
      },
      { 
        _id: '2', 
        title: 'Test Task 2', 
        completed: false, 
        priority: 'Medium', 
        createdAt: '2023-01-02T15:30:00Z' 
      },
      { 
        _id: '3', 
        title: 'Test Task 3', 
        completed: true, 
        priority: 'Low', 
        createdAt: '2023-01-03T09:15:00Z' 
      }
    ]
  })
}));

// Mock the recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar"></div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line"></div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area"></div>,
  XAxis: () => <div data-testid="x-axis"></div>,
  YAxis: () => <div data-testid="y-axis"></div>,
  CartesianGrid: () => <div data-testid="cartesian-grid"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell"></div>
}));

describe('AnalyticsPage', () => {
  test('renders Analytics page with correct elements', () => {
    render(<AnalyticsPage />);
    
    // Check if the main title is rendered
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    
    // Check if stats cards are rendered with correct values
    expect(screen.getByText('3')).toBeInTheDocument(); // Total Tasks
    expect(screen.getByText('2')).toBeInTheDocument(); // Completed
    expect(screen.getByText('67%')).toBeInTheDocument(); // Completion Rate
    expect(screen.getByText('1')).toBeInTheDocument(); // In Progress
    
    // Check if chart containers are rendered
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    
    // Check if time range selector is rendered
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });
});