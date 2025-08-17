# CropSchool Development Commands

## 🚀 Quick Start - Run Both Applications

Use this single command to start both web and mobile development servers simultaneously:

```bash
npm run start
```

This will start:

- **Web App**: http://localhost:3000 (Next.js)
- **Mobile App**: http://localhost:8082 (Expo)

## 📱 Individual Commands

If you prefer to run them separately:

```bash
# Start only web application
npm run start:web

# Start only mobile application
npm run start:mobile

# Alternative combined command
npm run start:all
```

## 🎮 Access Your Applications

### Web Application

- Open browser: http://localhost:3000
- Features: Math Harvest, Alphabet Farm, Science Sprouts games
- Progress dashboard with achievements

### Mobile Application

- Scan QR code with Expo Go app on your phone
- Or use iOS Simulator: Press 'i' in the terminal
- Same features as web in native mobile interface

## 🛠 Development Features

- **Hot Reload**: Both applications auto-refresh when you make changes
- **Concurrent Logging**: See logs from both apps with color-coded prefixes
  - `[WEB]` - Web application logs (cyan)
  - `[MOBILE]` - Mobile application logs (magenta)
- **Port Management**: Automatic port handling (3000 for web, 8082 for mobile)

## 🔧 Troubleshooting

If you encounter issues:

1. Stop all servers: `Ctrl+C`
2. Clear caches: `npm run clean`
3. Restart: `npm run start`

For mobile issues, clear Expo cache:

```bash
cd packages/mobile && npx expo start --clear
```
