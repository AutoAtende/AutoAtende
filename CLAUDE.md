# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "AutoAtende", a multi-tenant customer service platform built with WhatsApp integration and advanced chatbot capabilities. The system supports multiple companies, users, and includes features like flow builders, AI assistants, campaigns, and comprehensive reporting.

### Architecture

- **Backend**: Node.js/TypeScript with Express, using Sequelize ORM with PostgreSQL/MySQL
- **Frontend**: React 17 with Material-UI and custom components 
- **Mobile**: React Native (separate mobile directory)
- **Real-time**: Socket.IO for live updates
- **Queue System**: BullMQ with Redis for message processing
- **WhatsApp Integration**: Baileys library for WhatsApp Web API
- **AI Features**: OpenAI integration for assistants and chatbots

## Development Commands

### Backend (from `/backend`)
- **Development**: `npm run dev` - Start with ts-node-dev hot reload
- **Build**: `npm run build` - Compile TypeScript and copy .env
- **Start Production**: `npm start` - Run compiled version from dist/
- **Database**: 
  - `npm run db:migrate` - Run Sequelize migrations
  - `npm run db:seed` - Run database seeds
- **Testing**: `npx jest` - Run test suite (tests in `**/__tests__/**/*.spec.ts`)
- **Linting**: `npm run lint` - ESLint for TypeScript files

### Frontend (from `/frontend`)
- **Development**: `npm start` - Webpack dev server with hot reload
- **Build**: `npm run build` - Production build with optimizations

## Key Architecture Patterns

### Service Layer Architecture
The backend follows a strict service-oriented architecture:
- **Controllers**: Handle HTTP requests/responses (`src/controllers/`)
- **Services**: Business logic implementation (`src/services/`)
- **Models**: Sequelize ORM models with TypeScript decorators (`src/models/`)
- **Routes**: Express route definitions (`src/routes/`)
- **Middleware**: Authentication, authorization, validation (`src/middleware/`)

### Multi-Tenant Design
- Company-based isolation with `companyId` foreign keys
- Separate WhatsApp instances per company
- Queue-based message processing with company context
- Role-based access control (admin, user, super)

### Message Processing Pipeline
1. **WhatsApp Listener** (`wbotMessageListener.ts`) receives messages
2. **Flow Builder** processes automated responses
3. **Queue System** handles message routing and delivery
4. **Real-time Updates** via Socket.IO to frontend

### Key Service Categories
- **WbotServices**: WhatsApp integration and message handling
- **FlowBuilderService**: Chatbot flow execution and management  
- **AssistantServices**: OpenAI integration and AI features
- **TicketServices**: Customer service ticket management
- **CampaignService**: Bulk messaging and marketing automation
- **ReportService**: Analytics and performance metrics

### Database Migrations
- Located in `backend/src/database/migrations/`
- Follow timestamp naming: `YYYYMMDDHHMMSS-description.ts`
- Use Sequelize migration format with up/down methods

### Path Aliases (Backend)
TypeScript path mapping configured for clean imports:
- `@config/*` → `src/config/*`
- `@services/*` → `src/services/*`
- `@models/*` → `src/models/*`
- `@helpers/*` → `src/helpers/*`
- `@utils/*` → `src/utils/*`

### Frontend Architecture
- **Pages**: Main route components (`src/pages/`)
- **Components**: Reusable UI components (`src/components/`)
- **Services**: API communication (`src/services/`)
- **Hooks**: Custom React hooks (`src/hooks/`)
- **Context**: State management with React Context

### Environment Configuration
- Backend uses `.env` file for configuration
- Key variables: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `FRONTEND_URL`
- WhatsApp session storage in `private/` directory

## Testing Notes
- Backend tests use Jest with ts-jest preset
- Test files: `**/__tests__/**/*.spec.ts`
- Coverage collected from services layer
- Mock authentication and database for unit tests

## Common Development Patterns
- Always check company context for multi-tenant operations
- Use service layer for all business logic
- Implement proper error handling with AppError class
- Follow existing TypeScript decorators for models
- Use BullMQ queues for async operations
- Implement Socket.IO events for real-time updates