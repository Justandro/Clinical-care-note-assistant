# Clinical Care Note Assistant

![Clinical Care Note Assistant Screenshot](https://via.placeholder.com/800x400/4f46e5/ffffff?text=Clinical+Care+Note+Assistant)

## Overview

The Clinical Care Note Assistant is a comprehensive web application designed to streamline clinical documentation, compliance tracking, and administrative tasks for patient sleep therapy coordinators and medical professionals nationwide. Built with modern web technologies, this application provides an intuitive interface for creating various types of clinical notes, tracking compliance, managing supplies, and handling patient communications.

## Features

### 📋 Clinical Documentation Tabs
- **Compliance Check-In** - Daily compliance tracking and verification
- **Compliance Risk** - Risk assessment and mitigation documentation
- **Mask Exchange** - Track mask exchanges and fittings
- **Supply Request** - Manage medical supply requests and inventory
- **Mask Fit AR** - Augmented reality-assisted mask fitting documentation
- **Inbound/Outbound Call** - Log and track patient communications
- **Email Inquiry** - Document and respond to patient email inquiries
- **Removal Request** - Process equipment removal requests
- **Return Label** - Generate and track return shipping labels
- **Reship VGM** - Manage reshipping and volumetric weight calculations
- **Machine Request** - Handle medical equipment requests
- **O2 Management Suite** - Complete oxygen therapy documentation including:
  - Replacement
  - RUW/Swap-out
  - Pickup
  - Supplies
  - Resupply

### 📊 Administrative Tools
- **SD Card Download/Linking** - Manage patient data from sleep study devices
- **New Contact** - Patient intake and contact information management
- **Date Calculator** - Clinical date calculations and scheduling tools

### ⚙️ Productivity Features
- **Offline Mode** - Download the application for offline use (Ctrl + D)
- **Customizable Interface** - Rearrange tabs to match your workflow
- **Dark/Hacker Theme** - Alternative visual theme for reduced eye strain
- **Persistent Notes** - Built-in notepad that saves to localStorage
- **Toast Notifications** - Non-intrusive feedback system
- **Floating Calculator** - Quick access calculator for on-the-fly calculations

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Animations**: Motion.js
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Storage**: localStorage for persistence
- **AI Integration**: Google Generative AI (@google/genai)
- **Backend**: Express.js (for offline file generation)

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun (bun.lock indicates bun is used in this project)
- Google Gemini API key (for AI features)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clinical-care-note-assistant.git
   cd clinical-care-note-assistant
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google Gemini API key
   ```

4. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
bun run build
# or
npm run build
```

The build output will be in the `dist/` directory. An offline version is also generated:
- `public/ClinicalCare_OfflineApp.html` - Single-file offline version

## Usage Guide

### Getting Started
1. Upon first visit, you may need to accept the EULA (End User License Agreement)
2. Use the top navigation to switch between different clinical documentation tabs
3. Rearrange tabs by clicking the "Arrange Mode" button in the header
4. Access the notepad via the notepad icon in the header
5. Toggle between light and dark/hacker themes using the theme button

### Keyboard Shortcuts
- **Ctrl + D**: Download offline version of the application
- **Ctrl + N**: Open/close notepad
- **Ctrl + T**: Toggle theme (light/dark)
- **Ctrl + A**: Toggle arrange mode

### Offline Usage
The application can be used completely offline:
1. While online, click the download button in the footer or use Ctrl + D
2. Save the `ClinicalCare_OfflineApp.html` file to your device
3. Open the HTML file in any browser to use the application without internet connectivity
4. All data is stored locally in your browser's storage

## Project Structure

```
clinical-care-note-assistant/
├── public/                 # Static assets and offline app
├── src/
│   ├── components/         # Reusable UI components
│   ├── components/tabs/    # Individual tab components
│   ├── data/               # Tab configurations and constants
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── index.css           # Global styles
│   └── main.tsx            # Application entry point
├── .env.example            # Environment variables template
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── index.html              # HTML template
```

## API Integration

The application integrates with Google's Gemini AI for enhanced clinical documentation assistance. To enable AI features:

1. Obtain an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the key to your `.env` file:
   ```
   VITE_GOOGLE_AI_API_KEY=your_api_key_here
   ```
3. The AI features will be automatically enabled in compatible tabs

## Customization

### Theme Customization
The application uses Tailwind CSS, making it easy to customize colors and styles:
- Modify `tailwind.config.js` (if present) or edit the CSS variables in `src/index.css`
- The hacker theme can be customized by modifying the `.theme-hacker` class in `index.css`

### Adding New Tabs
To add a new clinical documentation tab:
1. Create a new component in `src/components/tabs/`
2. Add the tab configuration to `src/data/tabs.ts`
3. Import and add the tab to the `DEFAULT_TABS` export
4. Add the tab route in `App.tsx` within the main tab-viewport section

## Contributing

We welcome contributions to improve the Clinical Care Note Assistant! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Ensure new components are properly typed with TypeScript
- Test new features thoroughly before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Founded by Val Hykawy
- Led by Andrew Navarro
- Built with ❤️ for healthcare professionals nationwide
- Special thanks to the open-source community for the amazing tools used:
  - React and the React team
  - Vite for blazing fast development
  - Tailwind CSS for utility-first styling
  - Lucide for beautiful icons
  - Motion.js for smooth animations
  - Google for the Generative AI API

---

**Clinical Care Note Assistant** - Empowering healthcare professionals with better tools for better patient care.

*Last updated: October 2026*