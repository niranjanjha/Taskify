import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ZenSpacePage from './ZenSpacePage';

// Mock the Notification API
global.Notification = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
}));

describe('ZenSpacePage', () => {
  test('renders Zen Space page with correct elements', () => {
    render(<ZenSpacePage />);
    
    // Check if the main title is rendered
    expect(screen.getByText('Zen Space')).toBeInTheDocument();
    
    // Check if the timer display is rendered
    expect(screen.getByText('25:00')).toBeInTheDocument();
    
    // Check if the start button is rendered
    expect(screen.getByText('Start')).toBeInTheDocument();
    
    // Check if the reset button is rendered
    expect(screen.getByText('Reset')).toBeInTheDocument();
    
    // Check if the focus duration section is rendered
    expect(screen.getByText('Focus Duration')).toBeInTheDocument();
    
    // Check if the break duration section is rendered
    expect(screen.getByText('Break Duration')).toBeInTheDocument();
    
    // Check if the zen tips section is rendered
    expect(screen.getByText('Zen Tips')).toBeInTheDocument();
  });
});