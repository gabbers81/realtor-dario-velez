# Replit Development Guide

## Overview

This is a modern full-stack real estate website built for the Dominican Republic market. The application combines a React frontend with a Node.js Express backend, featuring a property showcase, contact management system, and appointment scheduling capabilities. The site is designed for Dario Velez, a real estate professional specializing in tourism properties in the Dominican Republic's eastern region.

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

### Database Schema (Supabase)
- **Projects Table**: Stores property listings with features, images, and PDFs
- **Contacts Table**: Captures lead information including budget and preferences
- **Type Safety**: Drizzle generates TypeScript types from schema definitions

### Supabase Configuration
- **Connection**: Uses postgres-js driver with SSL configuration
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Manual table creation via Supabase dashboard
- **Environment Variable**: Requires `DATABASE_URL` from Supabase project settings

## Data Flow

1. **Property Display**: Server fetches projects from database → API returns JSON → React components render property cards
2. **Contact Form**: User submits form → Client validates with Zod → POST to /api/contacts → Server validates and stores → Success response triggers UI update
3. **Project Details**: User clicks project → Modal opens with detailed view → Optional contact form integration
4. **Appointment Booking**: Placeholder for Calendly integration for scheduling consultations

## External Dependencies

### Core Technologies
- **postgres**: PostgreSQL client for Supabase connection
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

## Production Readiness

The application is now production-ready with comprehensive security, SEO, and performance optimizations:

### Security Features ✅
- **Helmet Security**: Content Security Policy, HSTS, XSS protection, CSRF prevention
- **CORS Configuration**: Proper origin validation for production and development
- **Rate Limiting**: 100 requests per 15 minutes globally, 5 contact submissions per hour
- **Input Validation**: Zod schema validation for all API endpoints
- **Trust Proxy**: Configured for accurate IP detection in cloud environments
- **Environment Protection**: Proper secret handling and environment variable validation

### SEO Optimization ✅
- **Meta Tags**: Dynamic SEO titles and descriptions for all pages
- **Open Graph**: Social media sharing optimization with proper images
- **Sitemap**: Auto-generated XML sitemap at `/sitemap.xml` including all projects
- **Robots.txt**: Search engine crawling instructions at `/robots.txt`
- **Structured Data**: Proper page titles and canonical URLs
- **Multilingual SEO**: SEO metadata translated across all 6 languages

### Performance Optimization ✅
- **Compression**: Gzip compression for all responses (threshold: 1KB, level: 6)
- **Caching Strategy**: 
  - PDF files: 7 days cache with immutable headers
  - Image assets: 30 days cache with optimization
  - API responses: 1-2 hours cache with ETag support
- **Lazy Loading**: Optimized image component with intersection observer
- **Bundle Optimization**: Vite build optimizations and code splitting
- **Static Asset Optimization**: Proper headers and compression for all assets

### Monitoring & Health ✅
- **Health Check**: `/health` endpoint for load balancer monitoring
- **Error Handling**: Comprehensive error pages with proper status codes
- **404 Page**: Professional multilingual 404 page with navigation
- **API Error Responses**: Consistent error format with helpful messages
- **Database Fallback**: Automatic REST API fallback when direct connection fails

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

## Recent Changes

- June 26, 2025. **Production Security Hardening**: Implemented comprehensive security with CORS, helmet, rate limiting, input validation, and trust proxy configuration
- June 26, 2025. **SEO & Error Handling**: Added SEO meta tags, sitemap.xml, robots.txt, proper 404 error page with translations for all languages  
- June 26, 2025. **Performance Optimization**: Implemented compression middleware, aggressive caching for PDFs (7 days) and assets (30 days), optimized image component with lazy loading
- June 26, 2025. **Health Monitoring**: Added health check endpoint and enhanced error handling for production readiness
- June 26, 2025. **PDF Display Issue Fixed**: Resolved field mapping issue between snake_case database fields and camelCase frontend interface
- June 26, 2025. **Enhanced PDF Viewer**: Added proper iframe embedding headers and fallback options for desktop/mobile
- June 26, 2025. **Supabase Integration Successfully Completed**: Application now fully operational with Supabase as exclusive database
- June 26, 2025. **Hybrid Connection System Implemented**: Created automatic REST API fallback when direct PostgreSQL connection fails
- June 26, 2025. **All 8 Real Estate Projects Active**: Database populated and API endpoints responding successfully via REST API
- June 26, 2025. **IPv6 Connectivity Issues Resolved**: Implemented robust fallback system using Supabase REST API for full functionality
- June 26, 2025. **Database Tables Created**: Contacts and projects tables successfully created and populated in Supabase
- June 26, 2025. **Enhanced Error Handling**: Added comprehensive error handling with automatic REST API failover
- June 26, 2025. Updated header and footer logos with new cropped tropical design across all pages
- June 26, 2025. Added consistent footer section to project detail pages with professional branding
- June 26, 2025. Implemented mobile-optimized PDF viewer with responsive design for project detail pages
- June 26, 2025. Mobile devices now show download-first interface while desktop maintains embedded viewer
- June 26, 2025. Successfully added 7 new real estate projects with complete multilanguage support
- June 26, 2025. Integrated all project PDFs: Secret Garden, The Reef, Palm Beach Residences, Solvamar Macao, Amares Unique Homes, Tropical Beach 3.0, Las Cayas Residences
- June 26, 2025. Updated Secret Garden with accurate data from new PDF: 327 units, commercial area, Bávaro location
- June 26, 2025. Fixed PDF serving architecture - moved files to client/public/pdfs/ for proper static serving
- June 26, 2025. Created comprehensive translations for all 8 projects across 6 languages (Spanish, English, Russian, French, German, Portuguese)
- June 26, 2025. Updated logo system with custom tropical design featuring palm trees and house silhouette
- June 26, 2025. Successfully implemented Testimonials section between Projects and Legal sections
- June 26, 2025. Added 3 professional testimonials from international DR property investors (US, Canada, France)
- June 26, 2025. Created testimonials translation files for all 6 languages with minimalistic design
- June 26, 2025. Integrated testimonials navigation buttons in desktop and mobile menus
- June 26, 2025. Added testimonials namespace to i18n configuration for proper translation loading
- June 26, 2025. Fixed footer translation integration - all footer content now properly switches languages
- June 26, 2025. Verified complete multilanguage functionality across all 6 languages
- June 26, 2025. Fixed comprehensive translation gaps in French, German, and Portuguese
- June 26, 2025. Implemented complete translation coverage for all website sections (home, contact, legal, projects)
- June 26, 2025. Created translation management system documentation for future content additions
- June 26, 2025. Completed full multilanguage implementation with all content translated
- June 26, 2025. Integrated translation system into contact forms and validation messages
- June 26, 2025. Updated legal process steps with dynamic language switching
- June 26, 2025. Added comprehensive multilanguage support with react-i18next
- June 26, 2025. Implemented language switcher component with 6 languages (ES, EN, RU, FR, DE, PT)
- June 26, 2025. Created translation files for navigation, content, forms, and legal sections
- June 26, 2025. Updated Montserrat + Open Sans typography for international appeal
- June 25, 2025. Changed realtor name from María Elena Santos to Dario Velez with masculine pronouns
- June 25, 2025. Updated legal information section with CONFOTUR law and simplified process

## Contact Form Structure

The contact form now includes 5 questions as specified:
1. Nombre completo (required)
2. Correo electrónico (required) 
3. Teléfono formato dominicano (required)
4. Presupuesto a Invertir (required): US$80k-120k, US$121k-200k, US$200k+
5. Inicial que puede pagar (optional): 10%, 15%, 20%

Additional feature: "¿Cuándo prefieres que te contactemos?" leads to Calendly integration for appointment scheduling.

## Calendly Integration

- Ready for implementation with iframe embed structure
- Placeholder URL needs to be replaced with actual Calendly link
- Modal opens when user clicks "Agendar Cita Directamente" from contact form

## Testimonials Section

### Overview
Professional testimonials section positioned between the Projects and Legal Information sections, featuring client experiences with DR real estate investments.

### Features
- **3 International Testimonials**: US, Canadian, and French investors
- **Minimalistic Design**: Clean card layout with professional client photos
- **5-Star Rating System**: Visual star ratings for each testimonial
- **Client Details**: Name, location, property type, and investment experience
- **Responsive Layout**: 1 column mobile, 3 columns desktop
- **Multilanguage Support**: Full translation coverage across all 6 languages

### Content Structure
1. **María González** (Miami, FL) - Apartment in Bávaro
2. **James Mitchell** (Toronto, ON) - Villa in Cap Cana
3. **Sophie Dubois** (Paris, France) - Penthouse in Punta Cana

### Navigation Integration
- Added "Testimonios/Testimonials" to desktop navigation menu
- Included in mobile menu with smooth scroll functionality
- Section ID: `testimonials` for direct navigation

## Multilanguage Support

The website now supports 6 languages to attract international buyers:

### Implemented Languages
1. **Spanish (es)** - Default language, Dominican Republic market
2. **English (en)** - Primary international market  
3. **Russian (ru)** - Growing buyer segment in Caribbean real estate
4. **French (fr)** - European Caribbean investors
5. **German (de)** - Strong international real estate investor base
6. **Portuguese (pt)** - Brazilian market proximity

### Technical Implementation
- **i18next**: Core internationalization framework
- **react-i18next**: React integration with hooks
- **Language Detection**: Automatic browser language detection with localStorage persistence
- **Language Switcher**: Dropdown component in navigation with country flags
- **Translation Structure**: Organized by namespaces (common, home, contact, projects, legal, testimonials)

### Translation Files Structure
```
client/src/locales/
├── es/ (Spanish - default)
├── en/ (English)  
├── ru/ (Russian)
├── fr/ (French)
├── de/ (German)
└── pt/ (Portuguese)
    ├── common.json (navigation, buttons, general UI)
    ├── home.json (homepage content)
    ├── contact.json (contact form)
    ├── projects.json (property descriptions)
    ├── legal.json (CONFOTUR legal info)
    └── testimonials.json (client testimonials)
```

### Features
- Language preference stored in localStorage
- Seamless switching without page reload
- All content translated including forms, legal info, and property details
- Globe icon language switcher in navigation
- Mobile-responsive language selection

### Translation Management System
**For future content additions:**
1. **Add new keys to Spanish (es) files first** - this is the source language
2. **Use translation key structure**: `namespace:section.key` (e.g., `home:hero.title`)
3. **Update all 6 languages simultaneously** when adding new content:
   - Spanish (es) - Primary market
   - English (en) - International market
   - Russian (ru) - Growing segment
   - French (fr) - European investors
   - German (de) - Strong investor base
   - Portuguese (pt) - Brazilian market
4. **Namespace organization**:
   - `common.json` - Navigation, buttons, general UI, tagline
   - `home.json` - Homepage content, services, about
   - `contact.json` - Contact forms and validation
   - `projects.json` - Property listings and modals
   - `legal.json` - CONFOTUR law and legal process
5. **Quality assurance**: Always test language switching for new content to ensure complete translations

**CRITICAL: Translation Consistency Rules**
- **Never hardcode text** - always use translation keys like `{t('tagline')}` 
- **Tagline must be consistent** across all pages using `{t('common:tagline')}`
- **All common elements** (navigation, tagline, buttons) must use `common.json` translations
- **Test all pages** when updating translations to ensure consistency

## User Preferences

Preferred communication style: Simple, everyday language.