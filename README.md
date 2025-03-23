# Font Sniffer - Chrome Extension

A sleek Chrome extension that helps you identify fonts used on any webpage. Simply select text and click the extension icon to see detailed font information.

![Font Sniffer Screenshot](docs/screenshot.png)

## Features

- 🎯 Quick font identification from selected text
- 🎨 Displays font family, weight, style, and size
- 🌙 Modern dark mode interface
- ⚡ Instant results with no external API dependencies
- 🔄 Easy to retry with different text selections

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/font-sniffer-chrome.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` folder from this project

## Usage

1. Select any text on a webpage
2. Click the Font Sniffer extension icon
3. View detailed information about the font being used

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build
```

### Branch Structure
- `main` - Production-ready code
- `develop` - Development branch for new features
- `feature/*` - Individual feature branches
- `hotfix/*` - Quick fixes for production issues
- `release/*` - Release preparation branches

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- Chrome Extension APIs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons provided by [Heroicons](https://heroicons.com/)
- Built with [Vite](https://vitejs.dev/)
