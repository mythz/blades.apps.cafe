# Sword Fighting Arena Game - Complete Implementation Plan

## 1. Project Overview

### 1.1 Game Concept
A 2D side-scrolling sword fighting game where players battle AI opponents on platforms suspended above lava. Players earn coins to unlock abilities and weapons across 4 difficulty levels.

### 1.2 Tech Stack
- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite
- **Rendering**: HTML5 Canvas (2D Context)
- **Physics**: Custom lightweight physics engine
- **Storage**: IndexedDB (primary) + localStorage (settings backup)
- **State Management**: React Context + useReducer
- **Styling**: CSS Modules + Tailwind CSS (optional)

---

## 2. Project Structure

```
/src
  /components
    /UI
      - MainMenu.tsx
      - GameHUD.tsx
      - ShopModal.tsx
      - PauseMenu.tsx
      - GameOverScreen.tsx
      - SettingsModal.tsx
    /Game
      - GameCanvas.tsx
      - Player.tsx
      - Enemy.tsx
      - Platform.tsx
      - Sword.tsx
      - HealthBar.tsx
      - ParticleSystem.tsx
  /engine
    - GameLoop.ts
    - PhysicsEngine.ts
    - CollisionDetection.ts
    - InputHandler.ts
    - Renderer.ts
  /ai
    - EnemyAI.ts
    - DifficultySettings.ts
  /store
    - GameContext.tsx
    - actions.ts
    - types.ts
  /data
    - initialState.ts
    - abilities.ts
    - swords.ts
    - platforms.ts
  /services
    - StorageService.ts
    - SaveManager.ts
  /utils
    - constants.ts
    - helpers.ts
    - animations.ts
  /hooks
    - useGameLoop.ts
    - useKeyboard.ts
    - useStorage.ts
  /types
    - game.d.ts
    - entities.d.ts
  - App.tsx
  - main.tsx
  - index.css
```

---

## 3. Core Type Definitions

### 3.1 Game Types (`/types/game.d.ts`)

```typescript
// Core entity position and physics
interface Vector2D {
  x: number;
  y: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Player/Enemy entity
interface Character {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  health: number;
  maxHealth: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  lastHealTime: number;
  state: 'idle' | 'running' | 'jumping' | 'attacking' | 'hurt' | 'dead';
  equippedSword: SwordType;
  abilities: Ability[];
}

// Sword types
interface SwordType {
  id: string;
  name: string;
  damage: number;
  range: number;
  attackSpeed: number; // cooldown in ms
  price: number;
  unlocked: boolean;
  sprite: string;
}

// Ability system
interface Ability {
  id: string;
  name: string;
  description: string;
  price: number;
  unlocked: boolean;
  type: 'passive' | 'active';
  cooldown?: number;
  effect: AbilityEffect;
}

interface AbilityEffect {
  type: 'damage_boost' | 'speed_boost' | 'heal' | 'shield' | 'double_jump' | 'dash';
  value: number;
  duration?: number;
}

// Platform
interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'main' | 'floating' | 'hazard';
}

// Game difficulty
type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

interface DifficultySettings {
  aiReactionTime: number; // ms
  aiAccuracy: number; // 0-1
  aiAggressiveness: number; // 0-1
  aiDodgeChance: number; // 0-1
  aiComboChance: number; // 0-1
}

// Game state
interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover' | 'shop';
  difficulty: Difficulty;
  player: Character;
  enemy: Character;
  platforms: Platform[];
  coins: number;
  totalCoins: number;
  wins: number;
  losses: number;
  gameTime: number;
  swords: SwordType[];
  abilities: Ability[];
  settings: GameSettings;
}

interface GameSettings {
  volume: number;
  musicVolume: number;
  sfxVolume: number;
  showFPS: boolean;
  particles: boolean;
}

// Save data structure
interface SaveData {
  coins: number;
  totalCoins: number;
  wins: number;
  losses: number;
  unlockedSwords: string[];
  unlockedAbilities: string[];
  equippedSword: string;
  equippedAbilities: string[];
  settings: GameSettings;
  lastPlayed: number;
}
```

---

## 4. Storage System

### 4.1 StorageService (`/services/StorageService.ts`)

**Purpose**: Manage IndexedDB and localStorage operations with fallback strategy.

**Key Methods**:
```typescript
class StorageService {
  private dbName = 'SwordFightingArena';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async init(): Promise<void>
  
  // Save game data
  async saveGame(data: SaveData): Promise<boolean>
  
  // Load game data
  async loadGame(): Promise<SaveData | null>
  
  // Delete save
  async deleteSave(): Promise<boolean>
  
  // Backup to localStorage (fallback)
  backupToLocalStorage(data: SaveData): void
  
  // Load from localStorage
  loadFromLocalStorage(): SaveData | null
  
  // Check if save exists
  async hasSaveData(): Promise<boolean>
}
```

**Implementation Details**:
- Create object store named `'gameData'` with keyPath `'id'`
- Store single save object with `id: 'mainSave'`
- On any IndexedDB error, automatically fallback to localStorage
- Serialize to JSON for localStorage
- Include version checking for future migrations

### 4.2 SaveManager (`/services/SaveManager.ts`)

**Purpose**: High-level save/load orchestration with auto-save functionality.

**Features**:
- Auto-save every 30 seconds during gameplay
- Save on game over
- Save after purchases
- Debounced saving to prevent spam
- Export/import save data (JSON download)

---

## 5. Game State Management

### 5.1 GameContext (`/store/GameContext.tsx`)

**Structure**:
```typescript
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  resetGame: () => void;
}

// Actions
type GameAction =
  | { type: 'START_GAME'; difficulty: Difficulty }
  | { type: 'UPDATE_PLAYER'; player: Partial<Character> }
  | { type: 'UPDATE_ENEMY'; enemy: Partial<Character> }
  | { type: 'DAMAGE_PLAYER'; amount: number }
  | { type: 'DAMAGE_ENEMY'; amount: number }
  | { type: 'HEAL_CHARACTER'; target: 'player' | 'enemy'; amount: number }
  | { type: 'GAME_OVER'; winner: 'player' | 'enemy' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'SPEND_COINS'; amount: number }
  | { type: 'UNLOCK_SWORD'; swordId: string }
  | { type: 'UNLOCK_ABILITY'; abilityId: string }
  | { type: 'EQUIP_SWORD'; swordId: string }
  | { type: 'EQUIP_ABILITY'; abilityId: string }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'OPEN_SHOP' }
  | { type: 'CLOSE_SHOP' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'TICK'; deltaTime: number }
  | { type: 'LOAD_SAVE'; data: SaveData };
```

**Reducer Logic**:
- Handle all state transitions
- Calculate derived state (e.g., check if character is dead)
- Enforce business rules (e.g., can't spend more coins than available)
- Trigger side effects through middleware pattern

---

## 6. Physics & Collision Engine

### 6.1 PhysicsEngine (`/engine/PhysicsEngine.ts`)

**Core Physics Constants**:
```typescript
const PHYSICS = {
  GRAVITY: 0.8,
  JUMP_FORCE: -15,
  MOVE_SPEED: 5,
  AIR_RESISTANCE: 0.95,
  GROUND_FRICTION: 0.8,
  MAX_FALL_SPEED: 20,
  KNOCKBACK_FORCE: 8,
  LAVA_Y: 600, // Y coordinate of lava
};
```

**Key Functions**:
```typescript
// Apply gravity to character
function applyGravity(character: Character, deltaTime: number): void

// Handle character movement
function moveCharacter(character: Character, direction: -1 | 0 | 1): void

// Make character jump
function jump(character: Character): void

// Apply knockback (on hit)
function applyKnockback(character: Character, direction: 'left' | 'right', force: number): void

// Update character physics (call every frame)
function updatePhysics(character: Character, platforms: Platform[], deltaTime: number): void

// Check if character fell into lava
function checkLavaCollision(character: Character): boolean
```

**Implementation**:
- Use Euler integration for velocity/position updates
- Clamp velocities to prevent excessive speeds
- Handle ground detection and isGrounded flag
- Apply different friction based on ground/air state

### 6.2 CollisionDetection (`/engine/CollisionDetection.ts`)

**AABB Collision Detection**:
```typescript
// Check if two rectangles overlap
function checkAABB(rect1: Rectangle, rect2: Rectangle): boolean

// Check character vs platform collision
function checkPlatformCollision(character: Character, platform: Platform): CollisionResult

interface CollisionResult {
  colliding: boolean;
  side: 'top' | 'bottom' | 'left' | 'right' | null;
  overlap: number;
}

// Resolve collision (push character out)
function resolveCollision(character: Character, platform: Platform, result: CollisionResult): void

// Check if sword hitbox hits character
function checkSwordHit(attacker: Character, target: Character): boolean

// Get sword hitbox based on character position and facing
function getSwordHitbox(character: Character): Rectangle
```

**Sword Hitbox Calculation**:
- Hitbox extends from character center
- Width: `character.equippedSword.range`
- Height: `character.height * 0.8`
- Position offset based on `character.facing` direction

---

## 7. Game Loop & Rendering

### 7.1 GameLoop (`/engine/GameLoop.ts` + `/hooks/useGameLoop.ts`)

**Loop Structure**:
```typescript
function useGameLoop(callback: (deltaTime: number) => void, isRunning: boolean) {
  useEffect(() => {
    if (!isRunning) return;
    
    let lastTime = performance.now();
    let animationFrameId: number;
    
    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      // Cap deltaTime to prevent spiral of death
      const cappedDelta = Math.min(deltaTime, 0.1);
      
      callback(cappedDelta);
      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, callback]);
}
```

**Game Update Cycle** (60 FPS target):
1. Handle input
2. Update player physics
3. Update enemy AI
4. Update enemy physics
5. Check collisions (platform, sword, lava)
6. Apply damage/knockback
7. Check heal timer (every 60 seconds)
8. Update animations
9. Update particles
10. Check win/loss conditions
11. Render frame

### 7.2 Renderer (`/engine/Renderer.ts`)

**Rendering Pipeline**:
```typescript
class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}
  
  clear(): void {
    // Clear canvas with background
  }
  
  renderBackground(): void {
    // Draw sky gradient and decorative elements
  }
  
  renderPlatforms(platforms: Platform[]): void {
    // Draw all platforms with textures
  }
  
  renderLava(): void {
    // Draw animated lava at bottom
  }
  
  renderCharacter(character: Character): void {
    // Draw character sprite based on state
    // Draw equipped sword
    // Draw effects/shields
  }
  
  renderHealthBar(character: Character, x: number, y: number): void {
    // Draw HP bar above character
  }
  
  renderParticles(particles: Particle[]): void {
    // Render all active particles
  }
  
  renderHUD(gameState: GameState): void {
    // Draw coins, timer, difficulty indicator
  }
}
```

**Visual Effects**:
- Character sprite: Simple rectangles with different colors per state
  - Idle: Blue (player) / Red (enemy)
  - Attacking: Bright yellow/orange flash
  - Hurt: Red flash
  - Dead: Gray with fade-out
- Sword: Colored rectangle extending from character when attacking
- Lava: Animated orange gradient with bubbles (particles)
- Hit effects: Particle burst on successful hit

---

## 8. Input Handling

### 8.1 InputHandler (`/engine/InputHandler.ts` + `/hooks/useKeyboard.ts`)

**Keyboard Controls**:
```typescript
const CONTROLS = {
  MOVE_LEFT: ['ArrowLeft', 'a', 'A'],
  MOVE_RIGHT: ['ArrowRight', 'd', 'D'],
  JUMP: ['ArrowUp', 'w', 'W', ' '], // Space also works
  ATTACK: ['Enter', 'j', 'J'],
  ABILITY_1: ['1'],
  ABILITY_2: ['2'],
  ABILITY_3: ['3'],
  PAUSE: ['Escape', 'p', 'P'],
};

interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  ability1: boolean;
  ability2: boolean;
  ability3: boolean;
  pause: boolean;
}

function useKeyboard(): InputState {
  // Track key down/up events
  // Return current input state
  // Handle key repeat prevention for discrete actions (jump, attack)
}
```

**Input Processing**:
- Continuous actions: Check every frame (movement)
- Discrete actions: Track key press/release cycle to prevent repeat
- Buffer inputs during cooldowns
- Disable inputs during attack animations

---

## 9. AI System

### 9.1 DifficultySettings (`/ai/DifficultySettings.ts`)

**Difficulty Configurations**:
```typescript
const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    aiReactionTime: 500,
    aiAccuracy: 0.4,
    aiAggressiveness: 0.3,
    aiDodgeChance: 0.1,
    aiComboChance: 0.1,
  },
  medium: {
    aiReactionTime: 300,
    aiAccuracy: 0.6,
    aiAggressiveness: 0.5,
    aiDodgeChance: 0.3,
    aiComboChance: 0.3,
  },
  hard: {
    aiReactionTime: 150,
    aiAccuracy: 0.8,
    aiAggressiveness: 0.7,
    aiDodgeChance: 0.5,
    aiComboChance: 0.5,
  },
  insane: {
    aiReactionTime: 50,
    aiAccuracy: 0.95,
    aiAggressiveness: 0.9,
    aiDodgeChance: 0.7,
    aiComboChance: 0.7,
  },
};
```

### 9.2 EnemyAI (`/ai/EnemyAI.ts`)

**AI Behavior Tree**:
```typescript
class EnemyAI {
  private enemy: Character;
  private player: Character;
  private settings: DifficultySettings;
  private lastDecision: number = 0;
  private currentStrategy: AIStrategy = 'approach';
  
  update(deltaTime: number): AIAction {
    // Make decision based on reaction time
    if (Date.now() - this.lastDecision < this.settings.aiReactionTime) {
      return this.continueCurrentAction();
    }
    
    this.lastDecision = Date.now();
    return this.makeDecision();
  }
  
  private makeDecision(): AIAction {
    // 1. Evaluate situation
    const distance = this.getDistanceToPlayer();
    const healthRatio = this.enemy.health / this.enemy.maxHealth;
    const playerHealthRatio = this.player.health / this.player.maxHealth;
    
    // 2. Choose strategy
    if (healthRatio < 0.3 && Math.random() < (1 - this.settings.aiAggressiveness)) {
      this.currentStrategy = 'retreat';
    } else if (distance < this.enemy.equippedSword.range + 50) {
      this.currentStrategy = 'attack';
    } else {
      this.currentStrategy = 'approach';
    }
    
    // 3. Execute strategy
    return this.executeStrategy();
  }
  
  private executeStrategy(): AIAction {
    switch (this.currentStrategy) {
      case 'approach':
        return this.approachPlayer();
      case 'attack':
        return this.attackPlayer();
      case 'retreat':
        return this.retreatFromPlayer();
    }
  }
  
  private approachPlayer(): AIAction {
    // Move towards player
    // Jump over gaps
    // Use platforms strategically
  }
  
  private attackPlayer(): AIAction {
    // Attack if in range and accuracy check passes
    // Attempt combos based on aiComboChance
    // Dodge player attacks based on aiDodgeChance
  }
  
  private retreatFromPlayer(): AIAction {
    // Move away from player
    // Jump to higher platforms
    // Create distance for healing
  }
}

type AIStrategy = 'approach' | 'attack' | 'retreat';

interface AIAction {
  move: -1 | 0 | 1; // left, none, right
  jump: boolean;
  attack: boolean;
}
```

**AI Features**:
- **Spatial awareness**: Check platform positions before jumping
- **Predictive aiming**: Lead target based on player velocity (higher difficulties)
- **Dodge timing**: React to player attack animations
- **Combo attacks**: Chain multiple attacks if first lands (based on difficulty)
- **Strategic positioning**: Use height advantage and corners
- **Recovery behavior**: Retreat when low health to heal safely

---

## 10. Combat System

### 10.1 Damage Calculation

**Hit Detection Flow**:
1. Player presses attack key
2. Check if attack cooldown elapsed
3. Set `character.isAttacking = true` (100ms duration)
4. Generate sword hitbox
5. Check if hitbox overlaps enemy
6. If hit:
   - Apply damage: `target.health -= attacker.equippedSword.damage`
   - Apply knockback towards attack direction
   - Trigger hurt state and invulnerability frames (200ms)
   - Spawn hit particles
   - Play hit sound effect
7. Start cooldown timer: `character.attackCooldown = attacker.equippedSword.attackSpeed`

**Invulnerability Frames**:
- After taking damage, character cannot be hit for 200ms
- Prevents multiple hits from single attack
- Visual feedback: Character flashes during i-frames

### 10.2 Healing System

**Auto-Heal Mechanic**:
```typescript
function checkHealTimer(character: Character, currentTime: number): boolean {
  const HEAL_INTERVAL = 60000; // 60 seconds in milliseconds
  const HEAL_AMOUNT = 50;
  
  if (currentTime - character.lastHealTime >= HEAL_INTERVAL) {
    const newHealth = Math.min(
      character.health + HEAL_AMOUNT,
      character.maxHealth
    );
    character.health = newHealth;
    character.lastHealTime = currentTime;
    
    // Trigger heal visual effect
    return true;
  }
  return false;
}
```

**Implementation**:
- Track `lastHealTime` on each character
- Check every frame if 60 seconds elapsed
- Heal both player and enemy simultaneously
- Cap at maxHealth (100 HP)
- Show "+50 HP" floating text and particle effect

---

## 11. Shop & Progression System

### 11.1 Swords Data (`/data/swords.ts`)

**Sword Definitions**:
```typescript
const SWORDS: SwordType[] = [
  {
    id: 'basic_sword',
    name: 'Basic Sword',
    damage: 5,
    range: 40,
    attackSpeed: 500,
    price: 0,
    unlocked: true,
    sprite: 'basic',
  },
  {
    id: 'iron_blade',
    name: 'Iron Blade',
    damage: 7,
    range: 45,
    attackSpeed: 450,
    price: 150,
    unlocked: false,
    sprite: 'iron',
  },
  {
    id: 'steel_saber',
    name: 'Steel Saber',
    damage: 10,
    range: 50,
    attackSpeed: 400,
    price: 300,
    unlocked: false,
    sprite: 'steel',
  },
  {
    id: 'katana',
    name: 'Katana',
    damage: 8,
    range: 55,
    attackSpeed: 300,
    price: 400,
    unlocked: false,
    sprite: 'katana',
  },
  {
    id: 'legendary_blade',
    name: 'Legendary Blade',
    damage: 15,
    range: 60,
    attackSpeed: 350,
    price: 800,
    unlocked: false,
    sprite: 'legendary',
  },
];
```

### 11.2 Abilities Data (`/data/abilities.ts`)

**Ability Definitions**:
```typescript
const ABILITIES: Ability[] = [
  {
    id: 'double_jump',
    name: 'Double Jump',
    description: 'Jump again while in mid-air',
    price: 200,
    unlocked: false,
    type: 'passive',
    effect: {
      type: 'double_jump',
      value: 1,
    },
  },
  {
    id: 'dash',
    name: 'Dash',
    description: 'Quick dash to evade attacks',
    price: 250,
    unlocked: false,
    type: 'active',
    cooldown: 3000,
    effect: {
      type: 'dash',
      value: 15, // speed multiplier
      duration: 200,
    },
  },
  {
    id: 'damage_boost',
    name: 'Power Strike',
    description: '+50% damage for 10 seconds',
    price: 300,
    unlocked: false,
    type: 'active',
    cooldown: 15000,
    effect: {
      type: 'damage_boost',
      value: 1.5,
      duration: 10000,
    },
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Block next hit',
    price: 350,
    unlocked: false,
    type: 'active',
    cooldown: 20000,
    effect: {
      type: 'shield',
      value: 1,
      duration: 5000,
    },
  },
  {
    id: 'quick_heal',
    name: 'Quick Heal',
    description: 'Instantly heal 30 HP',
    price: 400,
    unlocked: false,
    type: 'active',
    cooldown: 30000,
    effect: {
      type: 'heal',
      value: 30,
    },
  },
  {
    id: 'speed_boost',
    name: 'Speed Boost',
    description: '+100% movement speed for 8 seconds',
    price: 250,
    unlocked: false,
    type: 'active',
    cooldown: 12000,
    effect: {
      type: 'speed_boost',
      value: 2.0,
      duration: 8000,
    },
  },
];
```

### 11.3 Shop UI (`/components/UI/ShopModal.tsx`)

**Shop Layout**:
```
┌─────────────────────────────────────┐
│         SHOP                        │
│  Coins: 1,250  💰                   │
├─────────────────────────────────────┤
│                                     │
│  SWORDS                             │
│  ┌──────────────┐ ┌──────────────┐ │
│  │ Iron Blade   │ │ Steel Saber  │ │
│  │ DMG: 7       │ │ DMG: 10      │ │
│  │ 150 coins    │ │ 300 coins    │ │
│  │ [UNLOCK]     │ │ [UNLOCK]     │ │
│  └──────────────┘ └──────────────┘ │
│                                     │
│  ABILITIES                          │
│  ┌──────────────┐ ┌──────────────┐ │
│  │ Double Jump  │ │ Dash         │ │
│  │ Passive      │ │ CD: 3s       │ │
│  │ 200 coins    │ │ 250 coins    │ │
│  │ [UNLOCK]     │ │ [UNLOCK]     │ │
│  └──────────────┘ └──────────────┘ │
│                                     │
│            [CLOSE]                  │
└─────────────────────────────────────┘
```

**Features**:
- Filter: Show only unlocked or only locked items
- Sort: By price, by power, alphabetically
- Equip system: Click unlocked item to equip (show checkmark)
- Can equip up to 3 abilities simultaneously
- Hover tooltips with detailed stats
- Insufficient funds: Dim button and show required amount

---

## 12. Map Design

### 12.1 Platform Layout (`/data/platforms.ts`)

**Canvas Dimensions**: 1200px (width) × 600px (height)

**Platform Configuration**:
```typescript
const PLATFORMS: Platform[] = [
  // Main platform (center)
  {
    id: 'main',
    x: 300,
    y: 450,
    width: 600,
    height: 30,
    type: 'main',
  },
  // Left floating platforms
  {
    id: 'left_top',
    x: 50,
    y: 250,
    width: 150,
    height: 20,
    type: 'floating',
  },
  {
    id: 'left_mid',
    x: 100,
    y: 350,
    width: 120,
    height: 20,
    type: 'floating',
  },
  // Right floating platforms
  {
    id: 'right_top',
    x: 1000,
    y: 250,
    width: 150,
    height: 20,
    type: 'floating',
  },
  {
    id: 'right_mid',
    x: 980,
    y: 350,
    width: 120,
    height: 20,
    type: 'floating',
  },
  // Center high platform
  {
    id: 'center_top',
    x: 525,
    y: 200,
    width: 150,
    height: 20,
    type: 'floating',
  },
];

// Lava zone
const LAVA_ZONE = {
  y: 580,
  height: 20,
};
```

**Visual Design**:
- Main platform: Thick stone texture, gray
- Floating platforms: Wooden planks, brown
- Lava: Animated gradient (orange → red → yellow) at y=580
- Background: Blue sky gradient with cloud decorations
- Side walls: Invisible boundaries at x=0 and x=1200

---

## 13. UI Components

### 13.1 MainMenu (`/components/UI/MainMenu.tsx`)

**Layout**:
```
┌─────────────────────────────────────┐
│                                     │
│      SWORD FIGHTING ARENA           │
│                                     │
│        [START GAME]                 │
│        [SHOP]                       │
│        [SETTINGS]                   │
│        [STATS]                      │
│                                     │
│  Coins: 1,250  |  Wins: 45          │
└─────────────────────────────────────┘
```

**Start Game Flow**:
- Click "Start Game" → Show difficulty selection modal
- Select Easy/Medium/Hard/Insane → Initialize game
- Reset player/enemy positions and health
- Start game loop

### 13.2 GameHUD (`/components/UI/GameHUD.tsx`)

**In-Game HUD**:
```
┌─────────────────────────────────────┐
│ ❤️ PLAYER [████████░░] 80/100      │
│ 💰 Coins: 1,250    ⏱️ 2:45         │
│                                     │
│          [GAME AREA]                │
│                                     │
│ ❤️ ENEMY [██████████] 100/100      │
└─────────────────────────────────────┘
```

**Elements**:
- Player health bar (top-left)
- Enemy health bar (top-right)
- Coin counter (center-top)
- Game timer (center-top)
- Ability cooldown indicators (bottom-right)
- Pause button (top-right corner)

### 13.3 GameOverScreen (`/components/UI/GameOverScreen.tsx`)

**Victory Screen**:
```
┌─────────────────────────────────────┐
│           VICTORY!                  │
│                                     │
│      +50 Coins Earned!              │
│                                     │
│     Total Coins: 1,300              │
│                                     │
│      [PLAY AGAIN]                   │
│      [SHOP]                         │
│      [MAIN MENU]                    │
└─────────────────────────────────────┘
```

**Defeat Screen**: Same layout but "DEFEAT!" and no coins earned

---

## 14. Particle System

### 14.1 Particle Types

**Particle Interface**:
```typescript
interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'hit' | 'heal' | 'lava_bubble' | 'dust';
}
```

**Particle Spawning**:
- **Hit Effect**: 10-15 particles burst outward from hit location
  - Colors: Yellow, orange, white
  - Velocity: Random directions at 2-5 units/frame
  - Lifetime: 0.5-1 second
  
- **Heal Effect**: 20-30 particles rise upward
  - Colors: Green, light green
  - Velocity: Upward with slight horizontal variance
  - Lifetime: 1-1.5 seconds
  
- **Lava Bubbles**: Continuous spawning at lava surface
  - Colors: Orange, red
  - Velocity: Slow upward movement
  - Lifetime: 2-3 seconds
  
- **Dust Particles**: On landing
  - Colors: Gray, light brown
  - Velocity: Horizontal spread
  - Lifetime: 0.3-0.5 seconds

**Update Logic**:
```typescript
function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx * deltaTime,
      y: particle.y + particle.vy * deltaTime,
      life: particle.life + deltaTime,
      size: particle.size * (1 - particle.life / particle.maxLife), // Shrink over time
    }))
    .filter(particle => particle.life < particle.maxLife);
}
```

---

## 15. Animation System

### 15.1 Character Animations

**Simple State-Based Sprites**:
```typescript
function getCharacterColor(character: Character): string {
  if (character.state === 'dead') return '#666666';
  if (character.state === 'hurt') return '#FF0000';
  if (character.state === 'attacking') return '#FFFF00';
  return character.id === 'player' ? '#0066FF' : '#FF3333';
}

function getCharacterOpacity(character: Character): number {
  if (character.state === 'dead') return 0.3;
  if (character.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
    return 0.5; // Flashing during i-frames
  }
  return 1.0;
}
```

**Sword Animation**:
- Attack animation: 100ms swing
- Rotation: 0° → 90° arc during swing
- Extension: Sword hitbox moves from center to full range

### 15.2 Smooth Interpolation

**Movement Smoothing**:
```typescript
function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// Apply to position for camera follow or smooth enemy movement
function smoothPosition(current: Vector2D, target: Vector2D, smoothing: number): Vector2D {
  return {
    x: lerp(current.x, target.x, smoothing),
    y: lerp(current.y, target.y, smoothing),
  };
}
```

---

## 16. Audio System (Optional Enhancement)

**Sound Effects** (if implementing):
- Sword swing: "whoosh" sound
- Sword hit: "clang" or "thud"
- Jump: "jump" sound
- Landing: "thud"
- Damage taken: "grunt" or "hurt" sound
- Heal: "sparkle" or "health" sound
- Coin collect: "coin" sound
- Lava death: "sizzle" sound

**Implementation**:
```typescript
class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private volume: number = 1.0;
  
  preload(soundId: string, path: string): void {
    const audio = new Audio(path);
    this.sounds.set(soundId, audio);
  }
  
  play(soundId: string): void {
    const sound = this.sounds.get(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = this.volume;
      sound.play().catch(() => {}); // Ignore autoplay errors
    }
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}
```

---

## 17. Performance Optimization

### 17.1 Optimization Strategies

**Canvas Rendering**:
- Use `requestAnimationFrame` for smooth 60 FPS
- Only redraw when game state changes
- Implement dirty rectangle rendering for static elements
- Batch draw calls (draw all platforms in single pass)

**State Updates**:
- Memoize expensive calculations using `useMemo`
- Use `React.memo` for UI components that don't change often
- Debounce save operations
- Throttle AI decision-making to reaction time intervals

**Memory Management**:
- Object pooling for particles (reuse dead particles)
- Limit maximum active particles (200 max)
- Clean up event listeners on unmount
- Remove completed animations from array

**IndexedDB Optimization**:
- Use transactions for atomic saves
- Index key fields for faster queries
- Compress save data if > 100KB (using JSON minification)
- Cache loaded data in memory during gameplay

---

## 18. Testing & Debugging Features

### 18.1 Debug Mode

**Debug Overlay** (toggled with 'F3' key):
```typescript
interface DebugInfo {
  fps: number;
  playerPos: Vector2D;
  enemyPos: Vector2D;
  playerState: string;
  enemyState: string;
  collisionCount: number;
  particleCount: number;
  aiStrategy: AIStrategy;
}

// Render debug overlay
function renderDebug(ctx: CanvasRenderingContext2D, info: DebugInfo): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 200, 150);
  ctx.fillStyle = '#00FF00';
  ctx.font = '12px monospace';
  ctx.fillText(`FPS: ${info.fps.toFixed(1)}`, 20, 30);
  ctx.fillText(`Player: (${info.playerPos.x.toFixed(0)}, ${info.playerPos.y.toFixed(0)})`, 20, 50);
  ctx.fillText(`Enemy: (${info.enemyPos.x.toFixed(0)}, ${info.enemyPos.y.toFixed(0)})`, 20, 70);
  ctx.fillText(`P State: ${info.playerState}`, 20, 90);
  ctx.fillText(`E State: ${info.enemyState}`, 20, 110);
  ctx.fillText(`AI: ${info.aiStrategy}`, 20, 130);
  ctx.fillText(`Particles: ${info.particleCount}`, 20, 150);
}

// Draw hitboxes
function renderHitboxes(ctx: CanvasRenderingContext2D, characters: Character[]): void {
  ctx.strokeStyle = '#FF00FF';
  ctx.lineWidth = 2;
  characters.forEach(char => {
    ctx.strokeRect(char.position.x, char.position.y, char.width, char.height);
    if (char.isAttacking) {
      const hitbox = getSwordHitbox(char);
      ctx.strokeStyle = '#FFFF00';
      ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }
  });
}
```

### 18.2 Cheat Codes (Development Only)

**Keyboard Shortcuts** (disabled in production):
- `Ctrl+G`: Add 1000 coins
- `Ctrl+K`: Kill enemy instantly
- `Ctrl+H`: Heal player to full
- `Ctrl+U`: Unlock all items
- `Ctrl+I`: Toggle invincibility

---

## 19. Deployment Configuration

### 19.1 Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Relative paths for static hosting
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
  },
  server: {
    port: 3000,
  },
});
```

### 19.2 Build & Deploy

**Build Command**:
```bash
npm run build
```

**Output Structure**:
```
/dist
  /assets
    - index-[hash].js
    - index-[hash].css
  - index.html
```

**Static Hosting Compatibility**:
- No server-side rendering required
- All assets bundled with hash names
- Works on: GitHub Pages, Netlify, Vercel, AWS S3, etc.
- No API endpoints needed (all storage is client-side)

---

## 20. Implementation Checklist

### Phase 1: Foundation (Core Architecture)
- [ ] Setup Vite + React + TypeScript project
- [ ] Create type definitions (game.d.ts, entities.d.ts)
- [ ] Implement StorageService with IndexedDB
- [ ] Create GameContext with reducer
- [ ] Build basic canvas rendering system

### Phase 2: Core Gameplay
- [ ] Implement PhysicsEngine (gravity, movement, jumping)
- [ ] Build CollisionDetection system
- [ ] Create Character entities (Player + Enemy)
- [ ] Implement Platform collision and rendering
- [ ] Add InputHandler for keyboard controls
- [ ] Create GameLoop hook

### Phase 3: Combat System
- [ ] Implement attack mechanics
- [ ] Add sword hitbox detection
- [ ] Create damage/health system
- [ ] Build knockback physics
- [ ] Add invulnerability frames
- [ ] Implement lava instant-kill

### Phase 4: AI System
- [ ] Create DifficultySettings configuration
- [ ] Build EnemyAI decision-making
- [ ] Implement approach/attack/retreat strategies
- [ ] Add spatial awareness and jumping AI
- [ ] Tune difficulty parameters

### Phase 5: Progression System
- [ ] Define sword data with stats
- [ ] Define ability data with effects
- [ ] Implement coin earning on victory
- [ ] Build shop UI and purchase logic
- [ ] Add equipment system (equip swords/abilities)
- [ ] Implement ability activation and cooldowns

### Phase 6: Polish & Effects
- [ ] Create ParticleSystem
- [ ] Add hit/heal/lava particle effects
- [ ] Implement character animation states
- [ ] Build UI components (MainMenu, HUD, GameOver, Shop)
- [ ] Add heal timer (60 second auto-heal)
- [ ] Create visual feedback for all actions

### Phase 7: Persistence & Settings
- [ ] Implement SaveManager with auto-save
- [ ] Add settings UI (volume, particles, etc.)
- [ ] Build stats tracking (wins/losses)
- [ ] Add export/import save data feature
- [ ] Test storage across browser sessions

### Phase 8: Testing & Optimization
- [ ] Balance difficulty settings
- [ ] Optimize rendering performance
- [ ] Test on different browsers
- [ ] Add debug mode
- [ ] Fix bugs and edge cases
- [ ] Performance profiling

### Phase 9: Deployment
- [ ] Configure Vite for production build
- [ ] Test production build locally
- [ ] Deploy to static hosting
- [ ] Verify storage works in production
- [ ] Write README with instructions

---

## 21. Key Implementation Notes

### 21.1 Critical Requirements

1. **No Backend Dependency**: All storage must be client-side (IndexedDB + localStorage backup)
2. **Static Hosting**: Build must produce static files only (no SSR, no API routes)
3. **Browser Compatibility**: Test on Chrome, Firefox, Safari, Edge
4. **Mobile Support**: Consider touch controls as future enhancement
5. **Save Persistence**: Save data must survive browser refresh and reopening

### 21.2 Game Balance Guidelines

**Starting State**:
- Both characters start at 100 HP
- Player starts with basic sword (5 damage)
- First win gives 50 coins

**Economy Balance**:
- Sword progression: 0 → 150 → 300 → 400 → 800 coins
- Ability costs: 200-400 coins
- 3 wins to afford first sword upgrade
- 8-10 wins to afford legendary sword

**Difficulty Curve**:
- Easy: Beginners should win 70%+ of matches
- Medium: Balanced 50/50 win rate
- Hard: Experienced players win 30-40%
- Insane: Even experts struggle (15-25% win rate)

### 21.3 Common Pitfalls to Avoid

1. **Don't store functions in state**: Only store serializable data
2. **Don't mutate state directly**: Always create new objects/arrays
3. **Don't forget deltaTime**: All physics must be frame-rate independent
4. **Don't skip collision resolution**: Characters must not clip through platforms
5. **Don't allow infinite combos**: Enforce attack cooldowns strictly
6. **Don't overflow particle count**: Cap at 200 active particles
7. **Don't block main thread**: Keep heavy calculations async or chunked
8. **Don't forget error boundaries**: Wrap game in error boundary component

---

## 22. Future Enhancement Ideas

**Post-Launch Features** (not in initial scope):
- Multiplayer mode (local 2-player with second keyboard controls)
- More maps with different platform layouts
- Boss battles with unique AI patterns
- Character customization (skins, colors)
- Achievements system
- Leaderboards (stored locally)
- Tournament mode (bracket-style progression)
- Survival mode (endless waves of enemies)
- Sound effects and background music
- Gamepad support
- Mobile touch controls
- Particle effect quality settings
- Additional weapon types (spears, axes, hammers)
- Environmental hazards (spikes, moving platforms)
- Power-ups that spawn during battle

---

## 23. Example Workflow for LLM Implementation

**Recommended Build Order**:

1. **Start with Foundation**:
   ```typescript
   // Create basic React app with canvas
   // Set up TypeScript types
   // Implement simple rendering loop
   ```

2. **Add Physics**:
   ```typescript
   // Make a rectangle fall with gravity
   // Add platform collision
   // Implement jumping
   ```

3. **Add Player Control**:
   ```typescript
   // Connect keyboard input
   // Move player left/right
   // Make player jump
   ```

4. **Add Combat**:
   ```typescript
   // Draw sword on attack
   // Detect sword collision
   // Reduce health on hit
   ```

5. **Add Enemy**:
   ```typescript
   // Create second character
   // Implement basic AI (move towards player)
   // Make enemy attack when close
   ```

6. **Add Win/Loss**:
   ```typescript
   // Check if health reaches 0
   // Award coins on victory
   // Show game over screen
   ```

7. **Add Progression**:
   ```typescript
   // Create shop UI
   // Implement purchase logic
   // Add sword/ability effects
   ```

8. **Add Polish**:
   ```typescript
   // Particles, animations, UI refinement
   ```

9. **Add Persistence**:
   ```typescript
   // IndexedDB save/load
   // Auto-save implementation
   ```

---

## 24. Final Architecture Summary

**Data Flow**:
```
User Input
    ↓
InputHandler → GameContext.dispatch()
    ↓
GameState (via Reducer)
    ↓
GameLoop (useGameLoop hook)
    ↓
Physics Update → Collision Check → AI Update → Renderer
    ↓
Canvas Display
    ↓
SaveManager (auto-save every 30s)
    ↓
IndexedDB / localStorage
```

**Component Hierarchy**:
```
App
├── GameContextProvider
│   ├── MainMenu
│   ├── GameCanvas
│   │   └── [Renders entire game scene]
│   ├── GameHUD
│   ├── ShopModal
│   ├── PauseMenu
│   ├── GameOverScreen
│   └── SettingsModal
```

**State Management**:
- **Global State**: GameContext (game state, coins, unlocks, settings)
- **Local State**: UI modals, input state, particle arrays
- **Persistent State**: SaveData in IndexedDB

---

This comprehensive plan provides all necessary details for a complete implementation. An LLM can follow this specification to build the entire game from scratch, with clear guidance on architecture, systems, data structures, and implementation order.