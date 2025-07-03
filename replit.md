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
- **Structured Data**: JSON-LD real estate schema markup for rich snippets
- **Multilingual SEO**: Complete international SEO implementation:
  - **Hreflang Tags**: Proper language alternatives for all 6 languages
  - **Language-Specific URLs**: Sitemap includes all language variants 
  - **Locale Meta Tags**: Document language and content-language headers
  - **Translated Keywords**: SEO keywords optimized for each market
  - **Open Graph Locales**: Social sharing optimized for each language
  - **Canonical URLs**: Proper language-specific canonical tags

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

The application is configured for Replit deployment with comprehensive production database support:

### Build Configuration
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.js`
- **Environment**: Node.js 20 (NO PostgreSQL module - uses external Supabase)
- **Port Configuration**: Server runs on port 5000, exposed on port 80
- **Static Assets**: Frontend assets served from `dist/public` directory

### Database Configuration
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **RLS Compatibility**: Automatically detects transaction pooler usage (port 5432) for RLS compatibility
- **Production Readiness**: Built-in production readiness assessment with connection validation
- **Error Handling**: Comprehensive RLS-aware error handling for all database operations
- **Connection Format**: Recommended format for production: `postgresql://postgres.xxx:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

### ⚠️ CRITICAL: Database Module Conflict Prevention
**DO NOT install postgresql-16 module in Replit environments!**

- **Issue**: Replit's `postgresql-16` module automatically provisions a Neon database that conflicts with Supabase
- **Symptoms**: Production shows "relation does not exist" errors despite working in development
- **Environment Pollution**: Creates conflicting `PGDATABASE`, `PGHOST`, `PGUSER` environment variables
- **Resolution**: Use `packager_tool` to uninstall postgresql-16 module if accidentally installed
- **Prevention**: This project uses external Supabase database via `DATABASE_URL` only
- **Verification**: Check `/api/diagnostics` to ensure host shows "supabase.com" not "neon.tech"

### Production Deployment Checklist
1. **Database Connection**: Ensure DATABASE_URL uses transaction pooler (port 5432) for RLS compatibility
2. **RLS Policies**: Verify Supabase RLS policies allow appropriate access for your application role
3. **CORS Configuration**: Production domain `https://dariovelez.com.do` configured in CORS origins
4. **Environment Variables**: All required environment variables set in production
5. **Monitoring**: Use `/api/production-readiness` endpoint to assess deployment readiness
6. **Testing**: Test all API endpoints (`/api/projects`, `/api/contacts`) in production environment

### Production Monitoring
- **Health Check**: `/api/diagnostics` endpoint provides comprehensive database status
- **Readiness Assessment**: `/api/production-readiness` endpoint validates production configuration
- **Error Tracking**: Production-specific logging for database connectivity and RLS policy issues

### Troubleshooting Database Issues

**If you see "relation does not exist" errors in production:**

1. **Check Database Host**: Use `/api/diagnostics` endpoint
   ```bash
   curl https://yourdomain.com/api/diagnostics
   ```
   - ✅ Should show: `"host": "aws-0-us-east-2.pooler.supabase.com"`
   - ❌ Problem if shows: `"host": "neon.tech"` or similar

2. **Verify Environment Variables**:
   ```bash
   env | grep -i pg
   ```
   - Look for conflicting `PGDATABASE`, `PGHOST`, `PGUSER` variables
   - These should NOT point to Neon if using Supabase

3. **Check Installed Modules**:
   - Ensure `postgresql-16` module is NOT installed
   - If installed, remove with: `packager_tool.uninstall(["postgresql-16"])`

4. **Restart After Changes**:
   - Always restart the workflow after removing conflicting modules
   - Verify with diagnostics endpoint that correct database is being used

### Production Commands
- `npm run build`: Builds both frontend and backend for production
- `npm run start`: Runs the production server
- `npm run dev`: Development mode with hot reload

## Recent Changes

- July 3, 2025. **CRITICAL Database Module Conflict Resolution**: Identified and resolved major production issue caused by Replit's postgresql-16 module automatically provisioning conflicting Neon database. Issue manifested as "relation does not exist" errors in production while development worked fine. Root cause was postgresql-16 module creating conflicting environment variables (PGDATABASE=neondb, PGHOST=neon.tech) that overrode Supabase connection. Resolution: Removed postgresql-16 module via packager_tool, added comprehensive documentation to prevent future occurrences. Updated deployment strategy to explicitly warn against PostgreSQL module installation when using external Supabase database.
- July 3, 2025. **Comprehensive Production Database Solution Implemented**: Created enterprise-grade production database architecture with RLS (Row Level Security) compatibility and comprehensive error handling. Key improvements:
  - **RLS-Aware Connection Management**: Automatic detection of transaction pooler usage (port 5432) required for RLS compatibility
  - **Production-Specific Error Handling**: All 7 storage methods now have comprehensive error handling for RLS policy violations and connection failures  
  - **Enhanced Diagnostics**: Added production readiness assessment with connection type validation and deployment recommendations
  - **Intelligent Logging**: Production-specific logging for database connectivity and RLS policy issues
  - **Comprehensive Monitoring**: New `/api/production-readiness` endpoint provides detailed production environment assessment
  - **Database Architecture**: Addresses root cause of production-only API failures with proper RLS-compatible connection handling
- July 3, 2025. **Production API Issue Fixed**: Resolved critical production-only API failures (503 errors) by fixing CORS configuration. The issue was that the production domain `https://dariovelez.com.do` was not in the allowed origins list, causing all API requests to be blocked by CORS policy. Added production domain to CORS origins alongside existing Replit domains. This explains why development worked (different CORS origins for localhost) while production failed. Issue was domain-specific as suspected by client.
- July 3, 2025. **RLS-Compliant Architecture Implemented**: Converted from bypass approach to proper RLS-compliant database access. After user created appropriate RLS policies on Supabase tables, simplified all storage methods to use direct database queries only. Removed REST API fallback system and Supabase client dependencies. All 7 storage methods (getProjects, createContact, getContacts, getProject, getProjectBySlug, getContactByEmail, updateContactCalendlyInfo) now work cleanly with RLS policies. Simplified diagnostic endpoint confirms healthy database connection with 8 projects accessible. System respects security boundaries while maintaining full functionality.
- July 3, 2025. **Contact Form Validation System Fixed**: Resolved critical validation issues where required fields were showing errors despite having values. Fixed frontend state initialization (missing whatInMind field), enhanced backend validation with proper null handling for optional fields, improved error messaging, and updated phone validation for Dominican Republic format. Contact form now works reliably end-to-end with comprehensive multilingual error handling.
- July 2, 2025. **Calendly Integration Fully Activated**: Completed webhook-based integration with production domain https://dariovelez.com.do. Added 5 new database columns, implemented v2 webhook endpoint with secure signature verification, updated Calendly URL to velezsoriano87/30min, and activated webhook subscription (ID: a0f6924b-a4af-495b-b172-c06a8eb7977c). System now automatically captures appointment dates and links them to contact form submissions via email matching.
- July 2, 2025. **Project Pricing Updates Completed**: Updated all project pricing across all 6 languages with new values provided by client - fixed homepage to use translated pricing ensuring consistency between landing page and project detail pages across all languages
- July 2, 2025. **Translation System Completion**: Fixed "Distancias Principales" hardcoded text in project detail pages - now properly translates across all 6 languages (Spanish/English/Russian/French/German/Portuguese)
- July 2, 2025. **Navigation UX Improvements**: Moved cookie settings button to navigation bar next to language switcher, fixed button overlap issues by vertically stacking WhatsApp and contact buttons, removed redundant floating cookie button
- July 2, 2025. **Mobile-First Typography Optimization**: Implemented responsive typography with mobile-first approach - 16px+ minimum font sizes on mobile devices, compact desktop sizing, and touch-friendly icons (20-24px) for improved accessibility and readability
- July 2, 2025. **Project Detail Page Consistency**: Made all sections uniformly compact with consistent spacing, padding, and sizing throughout the project detail pages for better space utilization
- July 2, 2025. **Alphabetical Project Sorting**: Homepage projects now display in alphabetical order (Amares, Aura Boulevard, Las Cayas, Palm Beach, Secret Garden, Solvamar, The Reef, Tropical Beach) for improved user experience
- July 2, 2025. **Homepage Image Display Fixed**: Resolved caching issue causing old images to display - all project cards now show correct "Portada" cover images on the landing page
- June 27, 2025. **Cookie Consent System Implemented**: Added comprehensive GDPR/LGPD compliant cookie consent with multilingual support (6 languages), granular controls for Essential/Analytics/Marketing/Preferences cookies, and integrated Google Analytics protection
- June 27, 2025. **Google Analytics Integration Completed**: Implemented comprehensive tracking with measurement ID G-P09HNDKW35 including page views, contact form submissions, Calendly interactions, project views, and PDF downloads
- June 27, 2025. **PDF Corruption Issue Resolved**: Fixed corrupted PDF files for AURA Boulevard (replaced 0-byte file with 15MB backup) and Solvamar Macao (corrected file permissions from 600 to 644) - both PDFs now download properly
- June 27, 2025. **Application Debugging Completed**: Successfully resolved startup issues by clearing corrupted cache files and fixing duplicate function declarations - application now fully operational
- June 27, 2025. **Mobile-First Improvements Completed**: Implemented comprehensive mobile optimizations including touch targets, performance enhancements, swipe gestures, and mobile action bars
- June 27, 2025. **WhatsApp Integration Enhanced**: Fixed floating WhatsApp button positioning with responsive sizing and context-aware messages for both homepage and project detail pages  
- June 27, 2025. **Direct Supabase Connection Established**: Fixed URL encoding issues and established direct database connection using Transaction Pooler for full database operations
- June 27, 2025. **Complete Database Schema Updated**: Added project_slug, what_in_mind, and down_payment columns with all contact form fields now properly saved
- June 27, 2025. **Project Tracking System Implemented**: Contact submissions from project pages now capture project slug for lead attribution with direct database operations
- June 27, 2025. **Contact Form Enhanced**: Added new "¿Qué tienes en mente?" text area field and updated down payment label to remove "(Opcional)" text - form now has 6 fields total with multilingual support
- June 27, 2025. **Budget Field Made Optional**: Removed required validation from "Presupuesto a Invertir" field in contact form - users can now submit without specifying budget
- June 27, 2025. **Calendly Integration Completed**: Successfully integrated https://calendly.com/gabriel-garrido18/30min with full multilingual support and responsive modal
- June 27, 2025. **Added Agentic Innovations Credit**: Added subtle "Hecho por Agentic Innovations" attribution in footer corners with small font and transparency
- June 27, 2025. **Location Section Multilingual Fix**: Fixed hardcoded Spanish labels in project detail location section - now properly translates "Location & Accessibility", "Airport", "Beach", and "Nearby Amenities" across all 6 languages
- June 27, 2025. **Enhanced Location Schema Implementation**: Added comprehensive location-based structured data for all 8 properties with precise coordinates, nearby amenities, distances to airports/beaches, and local attractions for improved local SEO
- June 27, 2025. **Project Images Updated**: Updated Las Cayas Residences and Tropical Beach 3.0 with custom property images showcasing actual architectural designs and tropical settings
- June 27, 2025. **Las Cayas Residences Image Updated**: Replaced generic stock photo with custom tropical villa image showing infinity pool and beachfront architecture
- June 27, 2025. **Production Domain Configuration**: Updated robots.txt and sitemap.xml to use custom domain https://dariovelez.com.do for production deployment
- June 26, 2025. **Multilingual Project Translation Fixed**: Resolved language switching issue in "Proyectos Destacados" section - project cards now properly translate titles, descriptions, and price prefixes across all 6 languages
- June 26, 2025. **Complete Translation System**: Fixed translation key mapping structure (properties vs projects) and added translatable price prefixes ("Desde"/"From"/"От"/"À partir de"/"Ab"/"A partir de")
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

The contact form now includes 6 questions as specified:
1. Nombre completo (required)
2. Correo electrónico (required) 
3. Teléfono formato dominicano (required)
4. Presupuesto a Invertir (optional): US$80k-120k, US$121k-200k, US$200k+
5. Inicial que podrías pagar (optional): 10%, 15%, 20%
6. ¿Qué tienes en mente? (optional): Free text area for ideas/questions

Additional feature: "¿Cuándo prefieres que te contactemos?" leads to Calendly integration for appointment scheduling.

## Calendly Integration

- **Active Integration**: https://calendly.com/gabriel-garrido18/30min embedded in modal
- **Multilingual Support**: Calendly modal titles translate across all 6 languages
- **User Flow**: Contact Form → "¿Cuándo prefieres que te contactemos?" → Calendly Modal opens for direct scheduling
- **Mobile Responsive**: Optimized iframe display for desktop and mobile devices

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