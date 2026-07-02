<div align="center">
  <h1>🧠 DegreeBaba Marketing Intelligence Hub</h1>
  <p>
    <strong>AI-Powered Marketing Analytics and Insights Platform</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

<br />

DegreeBaba Marketing Intelligence Hub is a full-stack, AI-driven platform designed to aggregate, analyze, and synthesize marketing data across multiple channels. Powered by Claude (Anthropic AI), it turns raw marketing data from Google Analytics, Google Ads, Meta Ads, and LinkedIn Ads into actionable business intelligence.

---

## ✨ Key Features

- **🤖 AI-Powered Insights**: Integrates with Anthropic's Claude models (`claude-3-haiku` / `claude-3-sonnet`) to route queries and synthesize analytics into plain English.
- **📊 Omni-channel Analytics**: Seamless integration with multiple ad and analytics platforms:
  - Google Analytics 4 (GA4)
  - Google Search Console (GSC)
  - Google Ads
  - Meta Ads
  - LinkedIn Ads
  - Microsoft Clarity
- **📈 Beautiful Dashboards**: Interactive, responsive charts powered by **Recharts**, with a sleek UI built on **Radix UI** and **Tailwind CSS**.
- **⚡ High Performance**: Fast, modern frontend built with **Vite** and **React**, coupled with a robust **Express** backend.
- **🔒 Type-Safe Data**: End-to-end type safety using **TypeScript**, **Zod** validation, and **Prisma** ORM.

## 🏗️ Architecture & Tech Stack

### Client (Frontend)
- **Framework**: React 18, Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, class-variance-authority, Tailwind Merge
- **UI Components**: Radix UI (Headless), Lucide React (Icons)
- **Data Fetching**: TanStack React Query
- **Forms & Validation**: React Hook Form, Zod
- **Data Visualization**: Recharts

### Server (Backend)
- **Framework**: Node.js, Express
- **Language**: TypeScript
- **Database ORM**: Prisma (PostgreSQL)
- **AI Integrations**: `@anthropic-ai/sdk`
- **Analytics & Ads APIs**: `@google-analytics/data`, `googleapis`, `google-ads-api`
- **Validation**: Zod
- **Logging**: Pino & Pino-Pretty
- **Testing**: Jest

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database
- API Keys for necessary third-party integrations (Anthropic, Google, Meta, etc.)

### Installation

1. **Clone the repository (or navigate to the directory):**
   ```bash
   cd "AI Marketing Platform"
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### ⚙️ Environment Variables

Copy the provided example environment file and fill in your secrets.

```bash
# In the root directory
cp .env.example .env
```

Ensure you configure the `.env` file correctly. Critical variables include:
- `VITE_API_BASE_URL` and `PORT`
- `DATABASE_URL` (Your PostgreSQL connection string)
- `ANTHROPIC_API_KEY`
- Third-party API credentials (Google, Meta, LinkedIn)
- `HUB_API_KEY` (A shared secret used by both frontend and backend)

### 🗄️ Database Setup

Navigate to the `server` directory and set up the Prisma schema:

```bash
cd server
npm run db:generate
npm run db:migrate
```
*(Optional)* View your data via Prisma Studio:
```bash
npm run db:studio
```

### 🏃 Running the Application

**Run Backend:**
```bash
# From the server/ directory
npm run dev
```

**Run Frontend:**
```bash
# From the client/ directory
npm run dev
```
Your backend will typically run on `http://localhost:3001` and your frontend on `http://localhost:5173`.

---

## 📂 Project Structure

```text
├── client/                 # React frontend application
│   ├── src/                # Frontend source code (components, pages, hooks, utils)
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json        # Frontend dependencies
├── server/                 # Express backend application
│   ├── src/                # Backend source code (routes, controllers, prompts, services)
│   ├── prisma/             # Prisma schema and migrations
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json        # Backend dependencies
├── .env.example            # Environment variables template
└── README.md               # Project documentation
```

---

## 📜 Available Scripts

### Client Scripts (`client/package.json`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the production bundle.
- `npm run lint`: Runs ESLint.
- `npm run format`: Formats code using Prettier.
- `npm run typecheck`: Runs TypeScript type checking without emitting files.

### Server Scripts (`server/package.json`)
- `npm run dev`: Starts the backend server in watch mode using `tsx`.
- `npm run build`: Compiles the TypeScript backend into the `dist/` directory.
- `npm run start`: Runs the compiled server (`dist/server.js`).
- `npm run test`: Runs the Jest test suite.
- `npm run db:generate`: Generates the Prisma client.
- `npm run db:migrate`: Deploys Prisma database migrations.

---
<div align="center">
  <p>Built with ❤️ for intelligent marketing.</p>
</div>
