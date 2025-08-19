# AnaMetric Frontend

This is the React frontend for the AnaMetric DORA Metrics Dashboard.

## Features

- Real-time DORA metrics visualization
- Interactive charts for Deployment Frequency, Lead Time, Change Failure Rate, and MTTR
- Date range filtering
- Responsive design with Grafana-inspired UI

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

## Backend Integration

The frontend connects to the FastAPI backend running on `http://localhost:8000`. Make sure the backend is running before using the dashboard.

### Backend Setup

1. Navigate to the backend directory:
```bash
cd ../../  # Go to the root Metric-Sync directory
```

2. Activate the virtual environment:
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### MongoDB Setup

The backend requires MongoDB to be running with the following collections:
- `github_events`
- `jenkins_deployments` 
- `prometheus_alerts`

Make sure MongoDB is running on `localhost:27017` with a database named `metricsDB`.

## API Endpoints

The frontend uses the following backend endpoints:

- `GET /deployment-frequency` - Get deployment frequency data
- `GET /lead-time` - Get lead time for changes data
- `GET /mttr` - Get Mean Time to Recovery data
- `GET /api/cfr` - Get Change Failure Rate data

## Data Flow

1. User selects a date range in the dashboard
2. Frontend calls backend API endpoints with the selected date range
3. Backend processes data from MongoDB and returns metrics
4. Frontend transforms the data for chart visualization
5. Charts are updated with real data from the backend

## Troubleshooting

### Backend Connection Issues

If you see "Error Loading Data" messages:

1. Ensure the backend is running on `http://localhost:8000`
2. Check that MongoDB is running and accessible
3. Verify the database contains the required collections
4. Check browser console for detailed error messages

### CORS Issues

If you encounter CORS errors, ensure the backend has CORS middleware enabled (it should be by default).

### Data Not Loading

If charts show empty data:

1. Check that your MongoDB collections contain data for the selected date range
2. Verify the data format matches what the backend processors expect
3. Check the browser's Network tab to see if API calls are successful

## Development

### Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx      # Main dashboard component
│   └── ...
├── services/
│   └── api.js            # API service functions
├── utils/
│   └── dataTransformer.js # Data transformation utilities
└── ...
```

### Adding New Metrics

To add new metrics:

1. Add the backend API endpoint
2. Add the corresponding service function in `api.js`
3. Update the data transformer in `dataTransformer.js`
4. Add the chart component to the dashboard

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.
