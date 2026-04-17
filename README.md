# Proxy Boot - Frontend

Real-time observability dashboard for monitoring microservices.

## Features
- **Real-time Monitoring**: Uses polling every 3 seconds to fetch the latest metrics from the backend.
- **Service Status Cards**: Dynamic cards showing total calls, success rate, and average duration.
- **Alert System**: Services with > 15% error rate are highlighted in red.
- **Log Explorer**: Detailed view of every request, including JSON input/output and stack traces for errors.
- **Performance Analytics**: Time-series chart using **Recharts** to visualize duration trends.

## Technology Stack
- **React (Vite)**: Fast frontend framework.
- **Tailwind CSS**: Modern utility-first styling.
- **Recharts**: For data visualization.
- **Lucide React**: For premium icons.

## Getting Started
1. Navigate to the `frontend` folder.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
4. Open `http://localhost:5173`.

## Design
The design follows a **Premium Light Academic** style:
- Clean backgrounds.
- High contrast for readability.
- Glassmorphism effects for cards.
- Professional typography (Inter).
