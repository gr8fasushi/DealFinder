# DealFinder

A modern deal aggregation website that finds the latest and best deals from top retailers like Amazon, Walmart, and Newegg.

## Features

- 🛍️ **Deal Aggregation** - Automatically fetch deals from multiple retailers via affiliate APIs
- 🔍 **Advanced Filtering** - Filter by store, category, price range, savings, and date
- 🌓 **Dark Mode** - Beautiful dark/light theme support
- 🔐 **Secure Authentication** - User accounts powered by Clerk
- ⭐ **Save Favorites** - Authenticated users can save their favorite deals
- 📹 **YouTube Reviews** - Automatically display product review videos
- ⚡ **Daily Updates** - Automated daily scraping for fresh deals
- 📱 **Mobile-First** - Fully responsive design for all devices
- 🎨 **Modern UI** - Built with Next.js 15, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL (Vercel Postgres)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Hosting**: Vercel
- **APIs**: Amazon Associates, Walmart Affiliate, Newegg, YouTube Data API v3

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- PostgreSQL database (or Vercel Postgres)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dealfinder.git
   cd dealfinder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual credentials.

4. Run database migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dealfinder/
├── src/
│   ├── app/              # Next.js app directory (routes)
│   ├── components/       # React components
│   ├── lib/              # Utilities, database, API clients
│   └── middleware.ts     # Clerk authentication
├── public/               # Static assets
└── drizzle/             # Database migrations
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

This project is designed to be deployed on Vercel with automatic deployments from GitHub:

- `main` branch → Production
- `staging` branch → QA/Staging
- `dev` branch → Development

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
