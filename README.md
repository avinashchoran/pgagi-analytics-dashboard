# Comprehensive Analytics Dashboard

A feature-rich, responsive dashboard application built with modern web technologies. The application provides real-time insights through various widgets including weather updates, stock market data, news feeds, and GitHub integration.

https://www.loom.com/share/51b1346b827c4b768e2ca8923d0c5608?sid=c9cf721b-ea86-4b73-be88-e1dcb569b1e0


Deployed Link :- https://pgagi-comprehensive-analytics-dashboard.vercel.app/



## Features

- 🎨 **Beautiful UI Components** - Built with Shadcn/ui and Tailwind CSS
- 📊 **Interactive Charts** - Multiple chart types (Area, Line, Bar, Candlestick) powered by Recharts
- 🌤️ **Weather Widget** - Real-time weather updates with imperial/metric unit switching
- 📈 **Stock Market Data** - Live stock prices and historical data visualization
- 📰 **News Integration** - Customizable news feed with category filtering
- 🐙 **GitHub Integration** - GitHub activity and repository statistics
- 🌙 **Dark/Light Mode** - Full theme support with next-themes
- 📱 **Responsive Design** - Optimized for all device sizes
- ⚡ **Fast Performance** - Built with Vite for optimal development experience

## Technologies Used

- **Core:**
  - React 18
  - TypeScript
  - Vite
  - React Router DOM

- **UI/Styling:**
  - Tailwind CSS
  - Shadcn/ui
  - Radix UI Primitives
  - Framer Motion
  - Lucide Icons

- **State Management & Data Fetching:**
  - TanStack Query (React Query)
  - React Hook Form
  - Zod (Form Validation)

- **Visualization:**
  - Recharts
  - Embla Carousel

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_WEATHER_API_KEY=your_weather_api_key
   VITE_NEWS_API_KEY=your_news_api_key
   VITE_ALPHA_VANTAGE_API_KEY=your_stock_api_key
   VITE_GITHUB_TOKEN=your_github_token
   ```

## Environment Setup

1. Copy `.env.example` to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Replace the placeholder values in `.env` with your actual API keys:
   - VITE_WEATHER_API_KEY: Get from [WeatherAPI](https://www.weatherapi.com)
   - VITE_NEWS_API_KEY: Get from [NewsAPI](https://newsapi.org)
   - VITE_ALPHA_VANTAGE_API_KEY: Get from [Alpha Vantage](https://www.alphavantage.co)
   - VITE_GITHUB_TOKEN: Create at [GitHub Personal Access Tokens](https://github.com/settings/tokens)
   - VITE_GEODB_API_KEY: Get from [RapidAPI GeoDB Cities](https://rapidapi.com/wirefreethought/api/geodb-cities)

Note: Never commit your `.env` file to version control. The `.env.example` file serves as a template for required environment variables.

## Running the Project

### Development

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## API Setup

### Weather API
1. Sign up at [WeatherAPI](https://www.weatherapi.com)
2. Get your API key from the dashboard
3. Add it to `.env` as `VITE_WEATHER_API_KEY`

### News API
1. Register at [NewsAPI](https://newsapi.org)
2. Obtain your API key
3. Add it to `.env` as `VITE_NEWS_API_KEY`

### Stock Market API
1. Get your API key from [Alpha Vantage](https://www.alphavantage.co)
2. Add it to `.env` as `VITE_ALPHA_VANTAGE_API_KEY`

### GitHub Integration
1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens)
2. Add it to `.env` as `VITE_GITHUB_TOKEN`

## Features In Detail

### Dashboard Widgets

- **Weather Widget**
  - Current weather conditions
  - Temperature in Celsius/Fahrenheit
  - Humidity and wind information
  - Location search functionality

- **Stock Market Widget**
  - Real-time stock prices
  - Historical data visualization
  - Multiple chart types
  - Custom time ranges (1D to 5Y)

- **News Widget**
  - Category-based news filtering
  - Latest headlines
  - News search functionality
  - Article previews

- **GitHub Widget**
  - Repository statistics
  - Commit history
  - Activity overview

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Recharts](https://recharts.org) for the charting library
- [TanStack Query](https://tanstack.com/query) for data fetching
- All other open-source libraries that made this project possible
