# Video Transcription Frontend

React-based frontend for the Video Transcription Web App.

## Features

- 🎨 Modern, responsive UI built with React and Tailwind CSS
- 📤 Drag-and-drop file upload
- 🎥 Video preview before transcription
- 📊 Real-time progress tracking
- 🔍 Search within transcriptions
- 💾 Export to multiple formats (TXT, SRT, VTT, JSON)
- ⚡ Fast development with Vite

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Dropzone** for file uploads
- **Lucide React** for icons

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   ├── layout/           # Layout components
│   ├── transcription/    # Transcription-related components
│   └── upload/           # Upload-related components
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── services/             # API services
├── styles/               # Global styles
├── types/                # TypeScript types
└── utils/                # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
