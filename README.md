# Workboard

A JIRA-like task management tool built with React (UI) and Node.js (Server).

## Project Structure

```
workboard/
├── ui/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── styles/     # SCSS styles
│   │   └── types/      # TypeScript types
│   └── Dockerfile
│
└── server/             # Node.js TypeScript backend
    ├── src/
    │   ├── routes/     # API routes
    │   ├── services/   # Business logic
    │   └── types/      # TypeScript types
    └── Dockerfile
```

## Features

- **Task Management**: Create, update, delete, and view tasks
- **Task Details**: Title, description, assignee, status, priority, labels, due date, images
- **Email Notifications**: Automatic email on task create/update using MJML templates
- **Image Upload**: ImageKit integration for image storage
- **Settings**: Configure developers, SMTP, and ImageKit

## Tech Stack

### UI (Port 4010)

- React 18 + TypeScript
- Material UI (MUI)
- SCSS
- Vite

### Server (Port 4011)

- Node.js + TypeScript
- Express.js
- Nodemailer + MJML
- ImageKit SDK

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### UI Setup

```bash
cd ui
npm install
npm run dev
```

### Server Setup

```bash
cd server
npm install
npm run dev
```

## Available Scripts

### UI

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Server

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Docker

### Build UI

```bash
cd ui
docker build -t workboard-ui .
docker run -p 4010:4010 workboard-ui
```

### Build Server

```bash
cd server
docker build -t workboard-server .
docker run -p 4011:4011 -v workboard-data:/app/data workboard-server
```

## URLs

- **UI**: <http://workboard.exyconn.com> (Port 4010)
- **API**: <http://workboard-api.exyconn.com> (Port 4011)

## Configuration

### Environment Variables

#### UI (.env)

```
VITE_API_URL=http://localhost:4011/api
```

#### Server (.env)

```
PORT=4011
```

### Settings (via UI)

1. **AI Developers**: Configure team members with name and email
2. **SMTP Configuration**: Set up email server for notifications
3. **ImageKit Configuration**: Configure ImageKit for image uploads
