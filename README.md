# AI Climate Control Dashboard

Real-time monitoring dashboard for industrial environmental sensors and waste management.

## Features

- **Real-time Monitoring**: Live sensor data updates every 5 seconds
- **Emissions Tracking**: CO2, temperature, pressure, and flow rate monitoring
- **Safety Alerts**: Gas leak and fire detection with severity levels
- **Waste Management**: Bin fill level monitoring and collection scheduling
- **Alert System**: Comprehensive alert management with filtering

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ and npm
- AWS Lambda API deployed (see backend deployment)

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your API Gateway URL
# VITE_API_URL=https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dashboard will be available at `http://localhost:3000`

## Configuration

Update `src/config/api.ts` with your API Gateway URL:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod',
  FACILITY_ID: 'facility001',
  REFRESH_INTERVAL: 5000, // 5 seconds
};
```

## Pages

- **Dashboard** (`/`) - Overview with key metrics and recent alerts
- **Emissions** (`/emissions`) - Detailed emissions monitoring with charts
- **Safety** (`/safety`) - Gas and flame sensor status
- **Waste** (`/waste`) - Waste bin monitoring and collection priority
- **Alerts** (`/alerts`) - Alert management with filtering

## API Integration

The dashboard connects to the following Lambda API endpoints:

- `GET /api/facilities/{facilityId}/emissions/latest`
- `GET /api/facilities/{facilityId}/emissions/history`
- `GET /api/facilities/{facilityId}/gas-sensors/latest`
- `GET /api/facilities/{facilityId}/flame-sensors/latest`
- `GET /api/facilities/{facilityId}/waste-bins`
- `GET /api/facilities/{facilityId}/alerts`
- `GET /api/facilities/{facilityId}/summary`

## Deployment

### Option 1: AWS Amplify (Recommended)

AWS Amplify provides seamless integration with your AWS backend.

#### Quick Deploy

```bash
# Run deployment script
bash deploy-amplify.sh
```

#### Manual Deploy

1. **Push to Git**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy via Amplify Console**
   - Go to: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"
   - Connect your Git repository
   - Add environment variable:
     - Key: `VITE_API_URL`
     - Value: Your API Gateway URL
   - Deploy!

3. **Access Dashboard**
   - Amplify provides URL: `https://main.d1234abcd.amplifyapp.com`
   - Dashboard live in 5-10 minutes

**See detailed guide**: `../AWS_AMPLIFY_DEPLOYMENT_GUIDE.md`

**Cost**: ~$2-17/month (depending on usage)

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Cost**: Free tier available

### Option 3: Static Hosting (S3 + CloudFront)

```bash
# Build
npm run build

# Upload dist/ folder to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Cost**: ~$3-5/month

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod
```

## Color Scheme

- **Safe**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Info**: Blue (#3b82f6)
- **Background**: Dark blue (#0f172a, #1e293b, #334155)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - AI Climate Control Platform

## Support

For issues or questions, contact the development team.
