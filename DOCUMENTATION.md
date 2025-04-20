# Analytics Dashboard Documentation

## Overview
Analytics Dashboard is a modern, feature-rich web application built with React and TypeScript. It provides real-time insights through various interactive widgets, including weather updates, stock market data, news feeds, and GitHub integration.

## Tech Stack

### Core Technologies
- React 18 with TypeScript
- Vite for build tooling
- React Router DOM for routing

### UI/UX Components
- Tailwind CSS for styling
- Shadcn/ui for UI components
- Radix UI Primitives
- Framer Motion for animations
- Lucide Icons for iconography

### Data Management
- TanStack Query for data fetching
- React Hook Form for form handling
- Zod for form validation
- Local Storage for persistent user preferences

### Data Visualization
- Recharts for charts and graphs
- Embla Carousel for carousels

## Project Structure

### Core Directories
- `/src`
  - `/components`: Reusable UI components
    - `/layout`: Layout components (Header, Sidebar, MainLayout)
    - `/ui`: Base UI components from shadcn/ui
    - `/widgets`: Feature-specific widgets
  - `/hooks`: Custom React hooks
  - `/lib`: Utility functions
  - `/pages`: Route components
  - `/types`: TypeScript type definitions
  - `/utils`: Helper functions

## Features

### 1. Dashboard (Index Page)
- Overview of all widgets in a responsive grid layout
- Real-time data refresh capability
- Animated transitions between states
- Quick navigation to detailed views

### 2. Weather Integration
- Real-time weather updates
- Support for both imperial and metric units
- Location-based weather data
- Extended forecast view

### 3. News Feed
- Categorized news articles
- Customizable news categories
- Featured headlines section
- Article previews with links

### 4. Stock Market Data
- Real-time stock price tracking
- Historical data visualization
- Interactive charts
- Customizable watchlist

### 5. GitHub Integration
- Repository statistics
- Activity tracking
- Profile information
- Commit history

### 6. Settings
- Theme customization (Light/Dark mode)
- Animation toggles
- Unit preferences
- Display preferences

### 7. UI/UX Features
- Responsive design for all screen sizes
- Animated transitions and interactions
- Collapsible sidebar navigation
- Toast notifications for user feedback
- Keyboard accessibility
- Loading states and error handling

## Layout Components

### MainLayout
- Primary layout wrapper
- Handles responsive behavior
- Manages animations and transitions
- Integrates header and sidebar

### Header
- Application navigation
- Theme toggle
- User menu
- Responsive menu for mobile

### Sidebar
- Main navigation menu
- Collapsible design
- Active state indicators
- Utility navigation section

## State Management
- Local storage for user preferences
- React Query for server state
- React context for theme management
- URL-based routing state

## Best Practices
- TypeScript for type safety
- Component composition
- Custom hooks for reusable logic
- Responsive design principles
- Accessibility standards
- Error boundary implementation
- Loading state handling

## Performance Considerations
- Code splitting
- Lazy loading of routes
- Optimized animations
- Efficient data caching
- Debounced API calls
- Memoized components

## Configuration
The project uses various configuration files:
- `vite.config.ts` for build configuration
- `tsconfig.json` for TypeScript settings
- `tailwind.config.ts` for styling
- `components.json` for UI component configuration
- `package.json` for dependencies

## Getting Started
1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Run development server with `npm run dev`
5. Build for production with `npm run build`

## API Integration
The dashboard integrates with multiple external APIs:
- Weather API for forecasts
- Financial APIs for stock data
- News APIs for articles
- GitHub API for repository data

## Contributing
Refer to the project's README.md for contribution guidelines and setup instructions.