# Sword Fighting Arena

A 2D side-scrolling sword fighting game where players battle AI opponents on platforms suspended above lava. Earn coins to unlock abilities and weapons across 4 difficulty levels.

## Features

### Core Gameplay
- **Physics-based combat** with gravity, jumping, and knockback
- **4 Difficulty Levels**: Easy, Medium, Hard, and Insane
- **Smart AI opponents** with strategic behavior that adapts to difficulty
- **Progressive unlocks**: Purchase better swords and abilities with earned coins
- **Auto-heal mechanic**: Both player and enemy heal 50 HP every 60 seconds
- **Lava hazard**: Instant death for falling into the lava below

### Progression System
- **5 Swords** ranging from Basic Sword to Legendary Blade
- **6 Abilities** including Double Jump, Dash, Power Strike, Shield, Quick Heal, and Speed Boost
- **Coin economy**: Earn 50 coins per victory
- **Persistent save system**: Progress saved automatically using IndexedDB with localStorage fallback

### Technical Features
- Built with **React 19** and **TypeScript**
- **Canvas-based rendering** for smooth 60 FPS gameplay
- **Custom physics engine** with frame-rate independent updates
- **Particle effects** for hits, heals, and environmental effects
- **Keyboard controls** with intuitive mappings

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

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

The game will be available at `http://localhost:3000`

## Controls

### Player Controls
- **Move Left**: Arrow Left or A
- **Move Right**: Arrow Right or D
- **Jump**: Arrow Up, W, or Space
- **Attack**: Enter or J
- **Abilities**: 1, 2, 3 (when unlocked and equipped)
- **Pause**: Escape or P

## How to Play

1. **Start Game**: Select a difficulty level from the main menu
2. **Battle**: Use movement and attacks to defeat the AI opponent
3. **Win**: Reduce enemy health to 0 or knock them into the lava
4. **Earn Coins**: Get 50 coins for each victory
5. **Shop**: Purchase and equip better swords and abilities
6. **Progress**: Challenge higher difficulties with your upgraded arsenal

## Game Strategy

- **Positioning**: Use the platforms to gain height advantage
- **Timing**: Wait for your attack cooldown to reset
- **Healing**: Survive for 60 seconds to trigger auto-heal
- **Abilities**: Equip up to 3 abilities for tactical advantages
- **Difficulty**: Start with Easy to learn, progress to Insane for the ultimate challenge

## Project Structure

```
/src
  /components     - React UI components
  /engine         - Game engine (physics, rendering, collision)
  /ai             - Enemy AI system
  /store          - State management
  /data           - Game data (swords, abilities, platforms)
  /services       - Storage services
  /utils          - Utility functions
  /hooks          - React hooks
  /types          - TypeScript type definitions
```

## Development

The project follows a modular architecture with clear separation of concerns:

- **Engine**: Pure TypeScript modules for physics and collision
- **AI**: Configurable difficulty-based opponent behavior
- **State**: React Context with reducer pattern
- **Storage**: IndexedDB with localStorage fallback
- **Rendering**: HTML5 Canvas with custom renderer

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist` directory, ready for deployment to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## Implementation Details

This game was built following the comprehensive specification in [PLAN.md](./PLAN.md), which includes:

- Complete type system with TypeScript
- Physics engine with AABB collision detection
- AI behavior tree with difficulty scaling
- Particle system for visual effects
- Progressive enhancement with abilities
- Client-side storage system

## License

MIT

## Credits

Created following the detailed game design specification in PLAN.md.
