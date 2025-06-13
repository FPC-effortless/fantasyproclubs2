# Fantasy Pro Clubs App

A modern web application for managing Fantasy Pro Clubs teams, players, and competitions.

## Features

- User authentication and profile management
- Team management and player rosters
- Match scheduling and results tracking
- Competition management
- Fantasy team creation and management
- Real-time notifications
- Admin dashboard

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (Database & Auth)
- Tailwind CSS
- shadcn/ui
- React Query
- Zod (Validation)

## Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account
- Fantasy Pro Clubs 24 game (for testing)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fantasy-pro-clubs-app.git
cd fantasy-pro-clubs-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up the database:
```bash
npm run db:setup
# or
yarn db:setup
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations`
3. Set up the following tables:
   - users
   - teams
   - players
   - competitions
   - matches
   - fantasy_teams
   - notifications
   - transfers
   - awards
   - account_upgrade_requests

## Development

### Code Structure

```
├── app/                 # Next.js app directory
│   ├── (auth)/         # Authentication routes
│   ├── (dashboard)/    # Dashboard routes
│   ├── api/            # API routes
│   └── profile/        # Profile routes
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── public/            # Static assets
├── styles/            # Global styles
└── types/             # TypeScript types
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run db:setup` - Set up database
- `npm run db:migrate` - Run database migrations

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint:fix
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to your hosting platform (e.g., Vercel):
```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- Fantasy Sports for the Fantasy Pro Clubs 24 game
- Supabase for the backend infrastructure
- shadcn/ui for the component library
- Next.js team for the amazing framework
