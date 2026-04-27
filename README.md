# Crime Analysis Desktop Application

A desktop application for managing and analyzing crime data, built with Electron, Svelte, and SQLite.

## Features

- Manage crime types, locations, suspects, victims, and crime records
- Link suspects to crimes
- Foreign key constraints ensure data integrity
- Modern UI with Svelte components

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. For development: `npm run dev`
4. For production build: `npm run build`

## Usage

- Run `npm run dev` to start the development server and Electron app
- The app will open with a dashboard to navigate between different data management sections

## Technologies

- Electron for desktop app
- Svelte for UI components
- Vite for build tooling
- Better SQLite3 for database
- Tailwind CSS for styling (assumed from app.css)

## Database

The app uses SQLite with foreign keys enabled. The database file is `crime_analysis.db` in development and in the user data directory in production.