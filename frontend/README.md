# StackSUSU Frontend

A modern React frontend for the StackSUSU decentralized savings circle platform built on Stacks blockchain.

## Tech Stack

- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library
- **CSS Modules** - Component-scoped styling with BEM naming

## Project Structure

```
src/
├── components/     # Reusable UI components
├── config/         # App configuration and constants
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── lib/            # Core utilities and contract helpers
├── pages/          # Page components
├── services/       # API and blockchain services
├── styles/         # Design system (tokens, animations)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.tsx         # Root component
└── main.tsx        # Entry point
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Design System

The app uses a custom design system with:

- **Design Tokens** - CSS custom properties for colors, spacing, typography
- **BEM Naming** - Block Element Modifier CSS methodology
- **Responsive Design** - Mobile-first breakpoints
- **Animations** - Smooth transitions and keyframe animations

See `src/styles/` for the complete design system.

## Key Features

- 🔐 **Wallet Integration** - Connect with Hiro Wallet
- 💰 **Savings Circles** - Create and join rotating savings groups
- 📊 **Dashboard** - Track contributions and payouts
- 🎨 **NFT Badges** - Earn participation badges
- 📱 **Responsive** - Works on all devices

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment Variables

Create a `.env` file:

```env
VITE_STACKS_NETWORK=mainnet
VITE_CONTRACT_ADDRESS=SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N
```

## License

MIT
