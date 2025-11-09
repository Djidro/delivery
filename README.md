# FoodExpress - Driver Dashboard

A complete, real-time driver dashboard system for food delivery applications.

## Features

- **Driver Registration & Login** - Secure phone-based authentication
- **Real-time Order Management** - Live updates for new orders
- **Location Tracking** - GPS-based driver location tracking
- **Order Status Updates** - Pick up, deliver, and complete orders
- **Earnings Tracking** - Real-time earnings and delivery statistics
- **Mobile-Friendly Design** - Responsive design for all devices
- **Push Notifications** - Browser notifications for new orders

## Setup Instructions

### 1. Supabase Configuration

1. Create a new project at [Supabase](https://supabase.com)
2. Run the SQL from `supabase-setup.sql` in the SQL editor
3. Update the Supabase URL and anon key in `driver-dashboard.js`:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
