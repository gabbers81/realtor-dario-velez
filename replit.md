# Replit Development Guide

## Overview

This is a modern full-stack real estate website built for the Dominican Republic market. The application combines a React frontend with a Node.js Express backend, featuring a property showcase, contact management system, and appointment scheduling capabilities. The site is designed for real estate professionals to display luxury properties and capture potential client leads.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server:

- **Frontend**: React 18 with TypeScript, using Vite for build tooling
- **Backend**: Express.js server with TypeScript support
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color themes for Caribbean aesthetics
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

## Key Components

### Frontend Architecture
- **Component Structure**: Modular React components with TypeScript
- **UI Components**: Comprehensive shadcn/ui component library with custom theming
- **Form Handling**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Icons**: Lucide React icons with React Icons for social media

### Backend Architecture
- **API Structure**: RESTful endpoints for projects and contacts
- **Data Layer**: Drizzle ORM with PostgreSQL database
- **Validation**: Zod schemas for runtime type checking
- **Error Handling**: Centralized error handling middleware
- **Development**: Hot reload with tsx for TypeScript execution

### Database Schema
- **Projects Table**: Stores property listings with features, images, and PDFs
- **Contacts Table**: Captures lead information including budget and preferences
- **Type Safety**: Drizzle generates TypeScript types from schema definitions

## Data Flow

1. **Property Display**: Server fetches projects from database → API returns JSON → React components render property cards
2. **Contact Form**: User submits form → Client validates with Zod → POST to /api/contacts → Server validates and stores → Success response triggers UI update
3. **Project Details**: User clicks project → Modal opens with detailed view → Optional contact form integration
4. **Appointment Booking**: Placeholder for Calendly integration for scheduling consultations

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe SQL query builder
- **wouter**: Lightweight React router
- **zod**: Runtime type validation

### UI and Styling
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Modern icon library

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

The application is configured for Replit deployment with:

- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.js`
- **Environment**: Node.js 20 with PostgreSQL 16 module
- **Port Configuration**: Server runs on port 5000, exposed on port 80
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **Static Assets**: Frontend assets served from `dist/public` directory

### Production Commands
- `npm run build`: Builds both frontend and backend for production
- `npm run start`: Runs the production server
- `npm run dev`: Development mode with hot reload

## Changelog

Changelog:
- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.