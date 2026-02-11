# BİRİKİO - Premium Finansal Takip Asistanı

## Design Guidelines

### Design References
- **Robinhood App**: Clean, modern fintech design
- **Coinbase**: Crypto portfolio visualization
- **Style**: Premium Finance App + Dark Mode + Glassmorphism

### Color Palette (Based on Logo)
- Primary Background: #0A1628 (Deep Navy)
- Secondary Background: #1A2744 (Dark Blue)
- Card Background: #243B55 (Blue Gray)
- Accent Gradient Start: #00D9A5 (Turquoise Green)
- Accent Gradient End: #D4AF37 (Gold)
- Success: #10B981 (Green)
- Danger: #EF4444 (Red)
- Text Primary: #FFFFFF
- Text Secondary: #94A3B8

### Typography
- Heading1: Inter font-weight 700 (32px)
- Heading2: Inter font-weight 600 (24px)
- Heading3: Inter font-weight 600 (18px)
- Body: Inter font-weight 400 (14px)
- Caption: Inter font-weight 400 (12px)

### Key Component Styles
- **Cards**: Glassmorphism with backdrop-blur, gradient borders
- **Buttons**: Gradient background (turquoise → gold), rounded-xl
- **Charts**: Recharts with custom gradient fills
- **Navigation**: Bottom tab bar with icons

### Images to Generate
1. **hero-finance-bg.jpg** - Abstract financial data visualization, dark blue tones with gold accents
2. **gold-bars.jpg** - Elegant gold bars on dark background
3. **crypto-coins.jpg** - Bitcoin and crypto coins with glowing effect
4. **stock-chart.jpg** - Modern stock chart visualization

---

## Development Tasks

### Database (Completed)
- [x] assets table
- [x] price_alerts table
- [x] transactions table
- [x] portfolio_snapshots table
- [x] user_settings table

### Frontend Pages
1. **src/pages/Index.tsx** - Dashboard with portfolio overview, pie chart, line chart, news feed
2. **src/pages/Assets.tsx** - Asset management, add/edit/sell assets
3. **src/pages/Alerts.tsx** - Price alerts management
4. **src/pages/History.tsx** - Transaction history, sold assets archive
5. **src/pages/Settings.tsx** - User settings, currency, PIN, theme
6. **src/pages/AuthCallback.tsx** - Auth callback (read-only)

### Components
1. **src/components/layout/BottomNav.tsx** - Bottom navigation bar
2. **src/components/layout/Header.tsx** - App header with logo
3. **src/components/dashboard/PortfolioSummary.tsx** - Total wealth display
4. **src/components/dashboard/PortfolioPieChart.tsx** - Asset distribution pie chart
5. **src/components/dashboard/WealthLineChart.tsx** - Wealth over time line chart
6. **src/components/dashboard/NewsFeed.tsx** - Economy news feed
7. **src/components/assets/AssetCard.tsx** - Individual asset card
8. **src/components/assets/AddAssetModal.tsx** - Add/edit asset modal
9. **src/components/alerts/AlertCard.tsx** - Price alert card
10. **src/components/alerts/AddAlertModal.tsx** - Add alert modal
11. **src/components/ui/GradientButton.tsx** - Custom gradient button
12. **src/components/PinLock.tsx** - PIN lock screen

### Utilities
1. **src/lib/api.ts** - API client setup
2. **src/lib/currency.ts** - Currency conversion utilities
3. **src/hooks/useAuth.ts** - Authentication hook
4. **src/types/index.ts** - TypeScript types