# T1 - Continuous Glucose Monitor Dashboard

A Next.js application that displays real-time blood glucose readings from a Dexcom CGM (Continuous Glucose Monitor).

## Features

- 🩸 Real-time glucose readings from Dexcom Share API
- 📊 Interactive charts with multiple time ranges (3H, 12H, 24H, 3D)
- 🌓 Dark/Light/System theme support
- 🔄 Auto-refresh based on data expiration times
- 📱 Responsive design

## Prerequisites

- Node.js 18+ and pnpm
- Dexcom CGM with Share enabled
- Dexcom Share account credentials

## Environment Variables

Create a `.env.local` file in the root directory with:

```bash
DEXCOM_USERNAME=your_dexcom_username
DEXCOM_PASSWORD=your_dexcom_password
```

## Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## API Endpoint

The app exposes an API endpoint at `/api/readings` that returns glucose data:

```bash
# Get latest readings (default: 2)
curl http://localhost:3000/api/readings

# Get more readings
curl http://localhost:3000/api/readings?maxCount=300

# Get shell format (for scripts)
curl http://localhost:3000/api/readings?format=shell
```

## Technology Stack

- **Next.js 15.5.2** - App Router
- **React 18.3.1** - UI Framework
- **Tailwind CSS v4** - Styling
- **Recharts** - Charts
- **Dexcom Share API** - Glucose data source

## Development

The app automatically refreshes data based on the expiration time returned by the Dexcom API (typically every 5 minutes for new readings).

## License

MIT
