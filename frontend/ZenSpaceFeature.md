# Zen Space Feature Documentation

## Overview
Zen Space is a productivity feature that implements the Pomodoro Technique with a focus timer and break timer. It helps users maintain concentration while ensuring they take regular breaks to prevent burnout.

## Features
1. **Focus Timer**: 25-minute default work sessions
2. **Break Timer**: 5-minute default break sessions
3. **Session Tracking**: Counts completed focus sessions
4. **Customizable Durations**: Adjust focus and break times
5. **Visual Indicators**: Clear distinction between work and break modes
6. **Productivity Tips**: Helpful suggestions for effective time management

## Implementation Details

### File Structure
```
frontend/src/
├── pages/
│   ├── ZenSpacePage.jsx      # Main component
│   ├── ZenSpacePage.css      # Styling
│   └── ZenSpacePage.test.jsx # Unit tests
├── assets/
│   └── dummy.jsx             # Updated menu items
└── App.jsx                   # Updated routes
```

### Technologies Used
- React with Hooks (useState, useEffect)
- Lucide React Icons (Leaf, Play, Pause, etc.)
- CSS3 with Tailwind-like utility classes
- React Router for navigation

### Core Functionality

#### Timer Logic
- Uses `useState` to track timer state (running/paused, time left)
- Uses `useEffect` for the timer countdown implementation
- Automatically switches between focus and break sessions
- Tracks completed work sessions

#### User Interface
- Clean, minimalist design with purple theme consistency
- Large, readable timer display
- Intuitive controls (Start/Pause, Reset)
- Preset duration buttons for quick setup
- Visual indicators for session type (Focus vs Break)
- Helpful productivity tips

### Design Elements

#### Color Scheme
- Primary: Purple gradient (#8b5cf6 to #7c3aed)
- Break Mode: Green gradient (#10b981 to #059669)
- Backgrounds: Light purple/fuchsia gradients
- Text: Dark gray for readability

#### Icons
- Leaf icon for the main feature identifier
- Play/Pause for timer controls
- Reset for timer reset
- Sun for focus duration
- Coffee for break duration
- Waves for tips section

### User Experience

#### Workflow
1. User navigates to Zen Space from sidebar
2. Default 25-minute focus timer is displayed
3. User starts timer with "Start" button
4. Timer counts down to zero
5. Notification alerts user to take a break
6. 5-minute break timer automatically starts
7. Process repeats with session counter incrementing

#### Customization
- Users can select different focus durations (15, 25, 45 minutes)
- Users can select different break durations (5, 10, 15 minutes)
- Timer can be paused and resumed at any time
- Timer can be reset to default values

### Integration Points

#### Sidebar Menu
- Added "Zen Space" option with Leaf icon
- Maintains consistent styling with other menu items

#### Routing
- Added `/zen` route in App.jsx
- Protected by authentication (same as other pages)

#### Theme Consistency
- Uses same purple gradient theme as rest of application
- Follows existing design patterns and spacing
- Maintains responsive design principles

## Testing

### Unit Tests
- Component renders correctly
- All UI elements are present
- Timer functionality can be tested with Jest

### Manual Testing
- Timer starts, pauses, and resets correctly
- Session switching works properly
- Custom durations apply correctly
- Notifications trigger appropriately

## Future Enhancements
1. Sound notifications
2. Custom session names
3. Statistics tracking
4. Integration with task completion
5. Dark mode support
6. Mobile app notifications

## Usage Instructions

### Starting a Session
1. Navigate to Zen Space from the sidebar
2. Set desired focus duration (optional)
3. Click "Start" button
4. Focus on your task until timer completes

### Taking a Break
1. When focus timer completes, take a break
2. Set desired break duration (optional)
3. Click "Start" to begin break timer
4. Relax and recharge until break completes

### Tracking Progress
- View completed session count at the bottom of the timer
- Use this to measure daily productivity
- Try to increase completed sessions over time

## Technical Considerations

### Browser Compatibility
- Uses standard React features
- Compatible with modern browsers
- Notification API degrades gracefully

### Performance
- Efficient timer implementation
- Minimal re-renders
- Lightweight component

### Accessibility
- Clear visual indicators
- Semantic HTML structure
- Keyboard navigable controls