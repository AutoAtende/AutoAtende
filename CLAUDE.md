# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WhatsApp-based customer service automation platform ("AutoAtende") with a Node.js/TypeScript backend and React frontend. The system supports multi-tenancy, integrations with various services (OpenAI, Typebot, N8N), ticket management, and communication flows.

## Commands

### Backend Commands (from `/backend` directory)
- **Development**: `npm run dev` - Start development server with hot reload
- **Build**: `npm run build` - Build TypeScript and copy .env to dist
- **Start**: `npm start` - Start production server from dist folder
- **Database**: `npm run db:migrate` - Run database migrations
- **Lint**: `npm run lint` - Check code style with ESLint

### Frontend Commands (from `/frontend` directory)
- **Development**: `npm start` - Start development server with webpack dev server
- **Build**: `npm run build` - Build production bundle

### Database Operations
- Migrations are managed with Sequelize CLI
- Migration files are in `backend/src/database/migrations/`
- Use `npm run db:migrate` to apply pending migrations

## Architecture Overview

### Backend Structure
- **Entry Point**: `server.ts` - Handles initialization sequence (Redis → Cache → JWT → Queues → WhatsApp sessions)
- **App Configuration**: `app.ts` - Express app setup with CORS, compression, file serving, and error handling
- **Models**: Sequelize-TypeScript models in `src/models/` (Company, User, Ticket, Message, etc.)
- **Services**: Business logic organized by domain in `src/services/`
- **Controllers**: HTTP endpoint handlers in `src/controllers/`
- **Routes**: Route definitions in `src/routes/`
- **Queue System**: BullMQ-based message processing in `src/queues.ts`

### Frontend Structure  
- **React 17** with Material-UI v5
- **State Management**: React Context + Zustand for some stores
- **Routing**: React Router v5
- **Build**: Webpack with custom configuration in `webpack/`
- **Components**: Organized in `src/components/`, `src/pages/`, `src/layout/`

### Key Services Architecture
- **WhatsApp Integration**: Baileys library for WhatsApp Web protocol
- **Multi-tenancy**: Company-based data isolation throughout the system
- **Ticket System**: Central entity connecting contacts, messages, queues, and users
- **Flow Builder**: Visual workflow builder for automated conversations
- **Real-time Communication**: Socket.io for live updates

### Database Schema
- **PostgreSQL** with Sequelize ORM
- **Key Entities**: Companies, Users, Contacts, Tickets, Messages, Queues, WhatsApps
- **Multi-tenancy**: All entities have `companyId` foreign key
- **Associations**: Complex relationships between tickets, contacts, messages, and users

### External Integrations
- **OpenAI**: Assistant API for AI-powered conversations
- **Typebot**: Chatbot integration for automated flows
- **N8N**: Workflow automation via webhooks
- **Payment Gateways**: Asaas, Stripe, EFI for billing
- **File Storage**: Local file system with public serving

## Development Notes

### Initialization Sequence
The backend has a specific startup order that must be maintained:
1. Redis connection
2. Cache layer initialization  
3. JWT configuration
4. Queue processing startup
5. Express app loading
6. HTTP server creation
7. Socket.io initialization
8. WhatsApp sessions startup

### File Upload Handling
- Upload configuration in `backend/src/config/upload.ts`
- Files served from `/public` route with CORS headers
- Support for images, videos, audio, and documents

### Queue System
- BullMQ for background job processing
- Message sending, campaigns, scheduled messages
- Queue monitoring available

### Error Handling
- Custom `AppError` class for application errors
- Global error middleware in `app.ts`
- Structured logging with Pino

### Environment Configuration
- Backend requires `.env` file in `backend/` directory
- Environment variables for database, Redis, WhatsApp, integrations
- Frontend uses `FRONTEND_URL` for CORS configuration

## Testing
- Jest configuration available (`backend/jest.config.js`)
- No specific test run command found - check package.json for test scripts
- Testing appears to be set up but may not be actively used

## Code Style
- ESLint configuration with Airbnb base rules
- TypeScript strict mode enabled
- Prettier for code formatting
- No automatic formatting on save - run `npm run lint` manually