# 🎲 LUDO ROYALE — Complete Game Build Prompt for AI Agent

> **Instructions for the Agent:**
> Work through each sub-prompt sequentially. Each sub-prompt is self-contained but builds on the previous ones. Do not skip any sub-prompt. After completing each one, confirm what was built before moving to the next. The final result should be a fully playable, visually stunning Ludo game.

---

## META OVERVIEW

Build a complete, production-grade **Ludo Royale** browser game using the following technology stack:

| Layer | Technology |
|---|---|
| Framework | React 18+ (with hooks, `useReducer`, `useContext`) |
| Language | TypeScript 5+ (strict mode enabled) |
| Styling | Tailwind CSS v3+ (JIT mode) |
| Rendering | HTML5 Canvas API (for the game board and animations) |
| Animation | Framer Motion (for UI transitions) + Canvas `requestAnimationFrame` (for game animations) |
| State Management | React `useReducer` + `useContext` (no external state library needed) |
| Sound | Web Audio API (procedural sound + optional audio files) |
| Build Tool | Vite 5+ |
| Package Manager | npm or pnpm |

**Design Philosophy:** Maximalist luxury board game aesthetic. Think a high-end physical board game brought to life digitally — rich jewel-toned colors, gold accents, deep shadows, smooth animations, and satisfying tactile-feeling interactions. The UI should feel like a premium mobile game.

---

## SUB-PROMPT 1 — Project Setup & Architecture

### Goal
Scaffold the project with all dependencies, folder structure, TypeScript configuration, Tailwind configuration, and base layout.

### Steps

1. **Initialize Project**
```bash
npm create vite@latest ludo-royale -- --template react-ts
cd ludo-royale
npm install
```

2. **Install Dependencies**
```bash
npm install framer-motion clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

3. **Configure TypeScript** (`tsconfig.json`)
   - Enable `"strict": true`
   - Enable `"noUncheckedIndexedAccess": true`
   - Set `"target": "ES2020"`
   - Set `"moduleResolution": "bundler"`

4. **Configure Tailwind** (`tailwind.config.ts`)
   - Extend the theme with a custom color palette:
     ```
     - gold: { 300: '#f9d976', 400: '#f0b429', 500: '#d97706', 600: '#b45309' }
     - ruby: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' }
     - sapphire: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' }
     - emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669' }
     - topaz: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' }
     - obsidian: { 800: '#1e1b2e', 900: '#13111f', 950: '#0a0812' }
     - parchment: { 100: '#fef9ee', 200: '#fdf0cd', 300: '#fbe4a0' }
     ```
   - Add a custom font: `Cinzel` (for headings) and `Crimson Pro` (for body text) — load from Google Fonts.
   - Add custom `backgroundImage` gradients and `boxShadow` entries for gem glows.
   - Add custom keyframe animations: `shimmer`, `pulse-gold`, `dice-roll`, `token-bounce`.

5. **Set up Google Fonts** in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

6. **Folder Structure** — Create the following directory tree exactly:
```
src/
├── assets/
│   └── sounds/           # placeholder for audio files
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Tooltip.tsx
│   │   └── Badge.tsx
│   ├── game/
│   │   ├── GameBoard.tsx       # Canvas wrapper component
│   │   ├── GameCanvas.tsx      # Core canvas renderer
│   │   ├── DicePanel.tsx
│   │   ├── PlayerPanel.tsx
│   │   ├── ScoreBoard.tsx
│   │   ├── TurnTimer.tsx
│   │   └── WinnerModal.tsx
│   └── screens/
│       ├── HomeScreen.tsx
│       ├── LobbyScreen.tsx
│       ├── GameScreen.tsx
│       └── SettingsScreen.tsx
├── engine/
│   ├── constants.ts          # All game constants
│   ├── types.ts              # All TypeScript types/interfaces
│   ├── gameReducer.ts        # Core game state machine
│   ├── pathfinder.ts         # Token movement path logic
│   ├── collision.ts          # Capture, safe zone, blocking logic
│   ├── ai.ts                 # AI player logic
│   └── audioEngine.ts        # Web Audio API abstraction
├── hooks/
│   ├── useGameState.ts
│   ├── useCanvas.ts
│   ├── useAnimations.ts
│   ├── useDice.ts
│   ├── useTimer.ts
│   └── useSound.ts
├── context/
│   ├── GameContext.tsx
│   └── SettingsContext.tsx
├── renderers/
│   ├── boardRenderer.ts      # Renders static board
│   ├── tokenRenderer.ts      # Renders tokens with animations
│   ├── diceRenderer.ts       # 3D-looking dice on canvas
│   ├── effectsRenderer.ts    # Particles, highlights, paths
│   └── uiOverlayRenderer.ts  # Canvas UI overlays
├── utils/
│   ├── colorUtils.ts
│   ├── mathUtils.ts
│   └── storageUtils.ts       # localStorage helpers
├── App.tsx
├── main.tsx
└── index.css
```

7. **Global CSS** (`index.css`):
   - Import Tailwind directives
   - Define CSS custom properties for the design system
   - Add a background pattern for the app shell (dark hexagonal or diamond grid texture)
   - Set `font-family` defaults
   - Add scrollbar styling

8. **App.tsx**: Set up `GameContext.Provider` and `SettingsContext.Provider` wrapping a `<Router>` equivalent using simple state-based screen switching (no React Router needed — use a `currentScreen` state to swap between `HomeScreen`, `LobbyScreen`, `GameScreen`, `SettingsScreen`).

---

## SUB-PROMPT 2 — Types, Constants & Game Engine Core

### Goal
Define every TypeScript type, interface, and game constant needed across the entire application. This forms the backbone of the entire game.

### `engine/types.ts` — Define the following types exactly:

```typescript
// Player identity
type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';
type PlayerType = 'human' | 'ai-easy' | 'ai-medium' | 'ai-hard';

// Token state
interface Token {
  id: string;                    // e.g. "red-0", "red-1"
  color: PlayerColor;
  index: number;                 // 0-3
  position: TokenPosition;
  isHome: boolean;               // at start base
  isFinished: boolean;           // reached center
  stepCount: number;             // steps taken (0-57)
  animating: boolean;
  animationTarget?: Point;       // pixel target for smooth movement
}

type TokenPosition =
  | { type: 'base' }
  | { type: 'board'; cellIndex: number }   // 0-51 on outer track
  | { type: 'homeRun'; step: number }      // 1-6 on color home run
  | { type: 'finished' };

// Player state
interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  type: PlayerType;
  tokens: Token[];
  isActive: boolean;
  stats: PlayerStats;
  avatar: AvatarConfig;
}

interface PlayerStats {
  tokensFinished: number;
  tokensCapured: number;
  doublesRolled: number;
  turnsPlayed: number;
  totalMovesMade: number;
}

interface AvatarConfig {
  emoji: string;
  title: string;   // e.g. "The Conqueror"
}

// Dice
interface DiceState {
  values: [number, number] | [number];   // Ludo uses one die; optionally two
  rolling: boolean;
  rollCount: number;               // times rolled this turn (max 3 for sixes rule)
  usedValues: number[];            // which dice values were used
  canRoll: boolean;
}

// Game phase
type GamePhase =
  | 'idle'
  | 'rolling'
  | 'selecting-token'
  | 'moving-token'
  | 'capturing'
  | 'bonus-roll'     // player captured or reached home run
  | 'game-over';

// Game mode
type GameMode = '2-player' | '3-player' | '4-player';

// Game settings
interface GameSettings {
  mode: GameMode;
  players: PlayerConfig[];
  turnTimeLimit: number | null;   // seconds, null = no limit
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  showMovableHints: boolean;
  blockadeRules: 'standard' | 'strict';
  extraDiceRolls: boolean;   // bonus roll on six
  safeZoneProtection: boolean;
}

interface PlayerConfig {
  name: string;
  type: PlayerType;
  color: PlayerColor;
  avatar: AvatarConfig;
}

// Board cell
interface BoardCell {
  index: number;         // 0-51 outer ring
  x: number;            // pixel x (canvas)
  y: number;            // pixel y (canvas)
  row: number;          // grid row (0-14)
  col: number;          // grid col (0-14)
  isSafe: boolean;
  isStart: Record<PlayerColor, boolean>;
  color?: PlayerColor;   // colored cells (home runs)
}

// Animation
interface AnimationState {
  type: 'move' | 'capture' | 'enter-board' | 'reach-home' | 'dice-roll' | 'particle';
  tokenId?: string;
  path?: Point[];
  progress: number;     // 0-1
  duration: number;     // ms
  startTime: number;
  onComplete?: () => void;
}

interface Point {
  x: number;
  y: number;
}

// Full game state (for reducer)
interface GameState {
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  dice: DiceState;
  animations: AnimationState[];
  winner: Player | null;
  turnNumber: number;
  eventLog: GameEvent[];
  settings: GameSettings;
  boardCells: BoardCell[];
  selectedTokenId: string | null;
  movableTokenIds: string[];
  captureEffect: CaptureEffect | null;
}

interface GameEvent {
  id: string;
  turn: number;
  playerColor: PlayerColor;
  type: 'roll' | 'move' | 'capture' | 'enter' | 'finish' | 'skip';
  description: string;
  timestamp: number;
}

interface CaptureEffect {
  position: Point;
  color: PlayerColor;
  startTime: number;
}
```

### `engine/constants.ts` — Define the following constants:

```typescript
// Canvas dimensions
export const CANVAS_SIZE = 750;           // px (square)
export const CELL_SIZE = CANVAS_SIZE / 15; // 50px per cell
export const BOARD_PADDING = 0;

// Board layout: 15x15 grid
// The classic Ludo board uses a 15x15 grid:
// - 4 colored home bases (6x6 corners)
// - 1 center finishing zone (3x3)
// - Cross-shaped track connecting them

// Track definition: array of [row, col] for all 52 cells (0-51), starting from Red's entry point going clockwise
export const OUTER_TRACK: [number, number][] = [
  // Define all 52 [row, col] positions of the outer track in clockwise order
  // Starting from Red's entry at [6, 1]:
  [6,1],[6,2],[6,3],[6,4],[6,5],           // Red approach top
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],     // Going up left column
  [0,7],                                    // Top-center
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],     // Going down right column
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],// Blue approach top
  [7,14],                                   // Right-center
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],// Going left on bottom of right arm
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],// Going down right column
  [14,7],                                   // Bottom-center
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],// Going up left column
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],     // Green approach bottom
  [7,0],                                    // Left-center
  [6,0],                                    // Closing the loop (connects back)
];

// Home run tracks (color-specific inner paths toward center)
export const HOME_RUN_TRACKS: Record<PlayerColor, [number, number][]> = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  blue:   [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  green:  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};

// Home base regions (top-left cell of 6x6 area)
export const HOME_BASES: Record<PlayerColor, { row: number; col: number }> = {
  red:    { row: 0, col: 0 },
  blue:   { row: 0, col: 9 },
  green:  { row: 9, col: 9 },
  yellow: { row: 9, col: 0 },
};

// Token starting positions within home base (4 slots)
export const HOME_BASE_TOKEN_POSITIONS: [number, number][] = [
  [1,1], [1,4], [4,1], [4,4],   // relative to home base top-left
];

// Safe cell indices (on outer track)
export const SAFE_CELLS: number[] = [0, 8, 13, 21, 26, 34, 39, 47];

// Starting cells per player (index on outer track where tokens enter)
export const START_CELLS: Record<PlayerColor, number> = {
  red:    0,
  blue:   13,
  green:  26,
  yellow: 39,
};

// Token colors
export const TOKEN_COLORS: Record<PlayerColor, { fill: string; stroke: string; glow: string; homeBase: string }> = {
  red:    { fill: '#ef4444', stroke: '#991b1b', glow: '#fca5a5', homeBase: '#fee2e2' },
  blue:   { fill: '#3b82f6', stroke: '#1d4ed8', glow: '#93c5fd', homeBase: '#dbeafe' },
  green:  { fill: '#10b981', stroke: '#065f46', glow: '#6ee7b7', homeBase: '#d1fae5' },
  yellow: { fill: '#f59e0b', stroke: '#92400e', glow: '#fde68a', homeBase: '#fef3c7' },
};

// Animation durations (ms) at 'normal' speed
export const ANIM_DURATION = {
  tokenMove:    300,    // per cell step
  capture:      500,
  enterBoard:   600,
  reachHome:    800,
  diceRoll:    1200,
  particleBurst: 800,
};

// Player turn order
export const TURN_ORDER: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

// Board background colors
export const BOARD_BG = {
  track:         '#f8f5eb',
  safeCell:      '#86efac',
  centerBase:    '#1e1b2e',
  gridLine:      '#c4b89a',
  boardBorder:   '#8B6914',
};
```

### `engine/pathfinder.ts` — Token movement logic:

Implement the following functions with full logic:

- `getTokenPath(token: Token, steps: number, boardCells: BoardCell[]): TokenPosition[]` — returns the array of positions a token will pass through when moving `steps` steps. Handles: base → board entry, outer track traversal, home run entry, finishing. Returns empty array if move is not valid.
- `canTokenMove(token: Token, diceValue: number, allTokens: Token[]): boolean` — returns true if the token can legally move given the dice value and current board state. Rules: token on base requires a 6 to enter; token on board must not be blocked; token on home run must not exceed 6.
- `getMovableTokens(player: Player, diceValue: number, allTokens: Token[]): string[]` — returns array of token IDs that can legally move.
- `isBlocked(position: TokenPosition, movingTokenColor: PlayerColor, allTokens: Token[]): boolean` — checks if a position is blocked by 2+ enemy tokens (blockade rule).
- `applyMove(token: Token, newPosition: TokenPosition): Token` — returns updated token with new position and stepCount.
- `getPixelPosition(position: TokenPosition, boardCells: BoardCell[], tokenIndex: number): Point` — converts a `TokenPosition` to canvas pixel coordinates.

---

## SUB-PROMPT 3 — Game State Machine (Reducer)

### Goal
Implement the complete game logic as a pure `useReducer` state machine with no side effects.

### `engine/gameReducer.ts`

Implement `gameReducer(state: GameState, action: GameAction): GameState`.

Define the following action types:

```typescript
type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: GameSettings }
  | { type: 'ROLL_DICE' }
  | { type: 'DICE_RESULT'; payload: { value: number } }
  | { type: 'SELECT_TOKEN'; payload: { tokenId: string } }
  | { type: 'MOVE_TOKEN'; payload: { tokenId: string; targetPosition: TokenPosition } }
  | { type: 'ANIMATION_COMPLETE'; payload: { animationId: string } }
  | { type: 'CAPTURE_TOKEN'; payload: { capturedTokenId: string; capturedBy: string } }
  | { type: 'TOKEN_FINISHED'; payload: { tokenId: string } }
  | { type: 'END_TURN' }
  | { type: 'BONUS_ROLL' }
  | { type: 'TIMER_EXPIRED' }
  | { type: 'AI_MOVE' }
  | { type: 'RESET_GAME' }
  | { type: 'UNDO_MOVE' }    // last move undo (if no capture happened)
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' };
```

**Implement these reducer cases with full game logic:**

1. **`INITIALIZE_GAME`**: Create all players, tokens at base positions, set phase to `'rolling'`, first player active.

2. **`ROLL_DICE`**: Set `dice.rolling = true`, set `phase = 'rolling'`. (Actual value comes from `DICE_RESULT` after animation.)

3. **`DICE_RESULT`**: Store dice value. Calculate movable tokens. If no tokens can move: add to event log, trigger END_TURN automatically. If exactly one token can move and `showMovableHints` is false: auto-select it. Else: `phase = 'selecting-token'`. Handle three-sixes rule (if three 6s in a row, forfeit turn and reset).

4. **`SELECT_TOKEN`**: Validate selection. Set `selectedTokenId`. Set `phase = 'moving-token'`. Calculate full path for animation.

5. **`MOVE_TOKEN`**: Apply the move. Check for captures on destination. Check if token finished. Update stats. Determine next phase (bonus-roll or end-turn).

6. **`CAPTURE_TOKEN`**: Return captured token to its home base. Add capture effect animation. Increment captor's `tokensCapured` stat.

7. **`TOKEN_FINISHED`**: Mark token as finished. Check if player has all 4 tokens finished → `phase = 'game-over'`, set winner.

8. **`END_TURN`**: Advance `activePlayerIndex` (skip finished players). Reset dice state. Set `phase = 'rolling'`.

9. **`BONUS_ROLL`**: After a capture or finishing a token, grant an extra dice roll. Set `phase = 'rolling'`.

10. **`TIMER_EXPIRED`**: Auto-select the best movable token (or skip if none), then end turn.

**State history**: Keep a `stateHistory: GameState[]` (max 5) for undo support.

---

## SUB-PROMPT 4 — Board Renderer (Canvas)

### Goal
Render a visually stunning, high-fidelity Ludo board on a 750×750 canvas using the Canvas 2D API.

### `renderers/boardRenderer.ts`

Implement `renderBoard(ctx: CanvasRenderingContext2D, boardCells: BoardCell[], settings: GameSettings): void`.

#### Visual Specification:

**Overall board:**
- Background: Rich dark navy/obsidian (`#1e1b2e`) with subtle noise texture (use `createImageData` to draw pixel noise or a repeating diagonal line pattern).
- Board itself: Parchment/ivory (`#f8f5eb`) for track cells.
- Outer border of entire board: 4px thick, gold gradient (`#f0b429` → `#d97706`), with rounded corners (8px radius).
- Inner border just inside outer border: 2px, dark brown (`#8B6914`).

**Four colored home base quadrants (6×6 corners):**
- Each quadrant is a 6×6 area filled with the player's color (semi-transparent, 80% opacity) with a glassy sheen effect.
- Draw with a subtle radial gradient from lighter center to slightly darker edges.
- Inside each quadrant: draw four circular token "nests" — 4.5-cell diameter circles — positioned at 2×2 layout inside the quadrant. Each nest has:
  - Outer ring: 3px white stroke
  - Inner fill: slightly lighter version of home base color
  - Subtle drop shadow using `ctx.shadowBlur = 6, ctx.shadowColor = rgba(0,0,0,0.4)`

**Track cells:**
- Standard track cells: parchment fill, 0.5px `#c4b89a` grid lines.
- Safe zone cells: soft green (`#86efac`) fill, with a small white star (⭐) drawn in the center using `ctx.fillText`.
- Entry cells (one per player color): filled with that player's color at 60% opacity.
- Home run track cells: filled with the appropriate player color at 40% opacity, darkening toward the center.

**Center finishing zone (3×3):**
- Draw a hexagonal or diamond shape that spans the 3×3 center area.
- Divided into 4 triangular sections, each filled with one player's color.
- Outlined in gold (3px).
- Draw a small golden trophy icon or star in the exact center using canvas paths.

**Grid lines:**
- 0.5px, `rgba(196, 184, 154, 0.4)` for all track cells.

**Board decorations:**
- In each corner of the board (outside the outer track), draw subtle decorative flourishes — e.g., small corner ornament using bezier curves in gold.
- Add a subtle vignette effect around the board edges using a radial gradient overlay (dark edges, transparent center).

**Performance:** Pre-render the static board to an offscreen `OffscreenCanvas` or a secondary canvas element, and blit it each frame instead of redrawing from scratch.

---

## SUB-PROMPT 5 — Token Renderer & Animations

### Goal
Render beautiful animated tokens on the canvas with smooth movement, capture effects, and entrance animations.

### `renderers/tokenRenderer.ts`

Implement `renderTokens(ctx: CanvasRenderingContext2D, players: Player[], animations: AnimationState[], timestamp: number): void`.

#### Token Visual Design:
Each token is a 3D-looking gem/jewel shape:

1. **Base shape:** Circle with radius = `CELL_SIZE * 0.38`.
2. **Gradient fill:** Radial gradient from a bright highlight (top-left, lightest color) to the base color to a darker shade at bottom-right, simulating a sphere.
3. **Inner highlight:** Small white ellipse at top-left (15% opacity), radius ~40% of token radius, to simulate a specular highlight.
4. **Outer stroke:** 2px stroke in the dark variant of the player's color.
5. **Drop shadow:** `ctx.shadowBlur = 8`, `ctx.shadowColor = rgba(0,0,0,0.5)`.
6. **Number label:** When multiple tokens occupy the same cell, draw a small numeral ("2", "3", "4") in white bold text at the token center.
7. **Finished glow:** When a token is in the finished state in the center, add a pulsing glow effect using an outer ring animation (`shadowBlur` oscillating 4–16px using `Math.sin(timestamp / 500)`).

#### Active Player Tokens:
- Tokens belonging to the active player that CAN move: add a subtle upward bob animation (y offset of ±3px using `Math.sin`).
- Draw a soft golden ring around movable tokens (2px, `rgba(240, 180, 41, 0.8)`).

#### Token Movement Animation:
- When a token moves, interpolate its pixel position along the path array.
- Use an easing function: `easeInOutCubic(t) = t < 0.5 ? 4t³ : 1 - (-2t+2)³/2`.
- Each cell step takes `ANIM_DURATION.tokenMove` ms.
- Add a slight arc (parabolic bounce): `y -= Math.sin(progress * Math.PI) * 15` for a subtle hop effect.

#### Capture Animation:
- When a token is captured, play a "shatter" effect: 6–8 small triangular particles burst outward from the capture position.
- Particles fade out over 500ms.
- The captured token's position immediately snaps back to base.

#### Enter Board Animation:
- Tokens entering the board from base animate with a scale-up effect: start at 0.3 scale, ease to 1.0 over 600ms.
- Add a brief golden glow ring on entry.

#### Home Finish Animation:
- When a token reaches the center, play a "celebration" burst: 12 star particles explode outward in the token's color.
- Stars rotate as they travel outward.
- The token scales up to 1.3× then settles back to 1.0×.

### `renderers/effectsRenderer.ts`

Implement:
- `renderHighlights(ctx, movableTokenIds, boardCells)` — soft pulsing highlight circles under movable tokens.
- `renderMovePath(ctx, token, path, boardCells)` — dashed line showing the move path preview when a token is selected.
- `renderCaptureEffect(ctx, effect, timestamp)` — particle burst at capture location.
- `renderParticles(ctx, particles, timestamp)` — general particle system update + render.

---

## SUB-PROMPT 6 — Dice System

### Goal
Implement a highly visual and satisfying dice rolling system with a 3D-rendered die on canvas plus DOM-based UI.

### `renderers/diceRenderer.ts`

Render a 3D-looking die on a small offscreen canvas (100×100px):

1. Draw the die face as a rounded rectangle with a gradient fill (lighter top-left, darker bottom-right) to simulate a lit cube face.
2. Draw the dots (pips) in the correct positions for 1–6:
   - Use standard die pip positions.
   - Each pip is a filled circle, colored dark (nearly black).
   - Add a subtle inner shadow to each pip.
3. Draw the die's top and side faces (visible in a 3D isometric view):
   - Top face: slightly lighter shade, visible above the main face, 8px tall.
   - Right face: slightly darker, 8px wide.
   - This creates the illusion of a 3D cube.
4. Add a gold border (2px) around all visible faces.

### `hooks/useDice.ts`

Implement `useDice(settings)`:
- `roll()` — generates a random number 1–6, triggers animation state.
- `isRolling` — boolean for animation state.
- `currentValue` — current dice value.
- `animationProgress` — 0–1 float, driven by `requestAnimationFrame`.

### Rolling Animation:
- During a 1200ms roll animation, rapidly cycle through random faces (showing a new random face every 80ms, slowing down to every 150ms near the end).
- Apply a `ctx.rotate` effect during the animation so the die appears to spin.
- Scale the die from 0.8 to 1.2 and back to 1.0 during the roll for a satisfying landing feel.

### `components/game/DicePanel.tsx`

A beautifully designed panel showing:
- The 3D die canvas (150×150px on desktop, 100×100px on mobile).
- Roll button: large, gold-gradient, with Framer Motion press animation.
- Dice history: last 5 roll results shown as small pip indicators.
- "No moves available" message when no tokens can move.
- Current turn indicator (player name + color badge).

---

## SUB-PROMPT 7 — Player Panels & HUD

### Goal
Build the full game HUD with player panels, turn timer, event log, and score display.

### `components/game/PlayerPanel.tsx`

For each player (2–4 panels arranged based on mode):
- Background: dark card with a colored left border (player color, 4px).
- Player avatar (large emoji, 48px), player name, player type badge ("Human" / "AI Easy" etc.).
- Token status row: 4 small token icons showing: ⬛ (base), 🔵 (on board), ⭐ (finished).
- Stats mini-display: Captures, Tokens home, Dice rolls.
- Active player: card has a glowing border animation in the player's color, background slightly brighter.
- Eliminated indicator: if a player has no moves (edge case in 3-player), show dimmed state.

### `components/game/TurnTimer.tsx`

If `turnTimeLimit` is set:
- Circular countdown timer (SVG circle with stroke-dashoffset animation).
- Color transitions: green → yellow → orange → red as time decreases.
- Tick sound when below 10 seconds (if sound enabled).
- Pulse animation when below 5 seconds.
- Auto-triggers `TIMER_EXPIRED` action when it hits 0.

### `components/game/ScoreBoard.tsx`

A collapsible panel showing:
- Turn number.
- Event log: last 10 game events (with icons per event type, player color dot, description).
- Events use Framer Motion `AnimatePresence` to slide in new entries from the top.

### Layout Orchestration:

**Desktop (≥1024px):**
```
[Left Panel: Red + Yellow players] [Center: Game Board] [Right Panel: Blue + Green players]
[Bottom center: Dice Panel + Turn Timer + Event Log toggle]
```

**Tablet (768px–1023px):**
```
[Top: Player panels in 2×2 grid above board]
[Center: Game Board]
[Bottom: Dice + Timer]
```

**Mobile (<768px):**
```
[Top: Active player panel + Turn timer]
[Center: Game Board (scaled to fit width)]
[Bottom: Dice panel]
[Player panels: horizontally scrollable strip]
```

---

## SUB-PROMPT 8 — AI Player System

### Goal
Implement three difficulty levels of AI opponents that make intelligent moves.

### `engine/ai.ts`

Implement `getAIMove(player: Player, gameState: GameState, difficulty: PlayerType): string` — returns the token ID the AI should move.

#### AI Easy:
- Simply picks a random movable token.

#### AI Medium:
Evaluate each movable token and score it:
- +10 if the move enters a token from base (getting tokens out is priority).
- +5 if the move puts a token on a safe cell.
- +8 if the move captures an enemy token.
- +3 for each step closer to home.
- +15 if the move reaches the home run track.
- -2 if the move puts a token in danger (adjacent to an enemy token that could capture it next turn).
- Choose the highest-scoring token.

#### AI Hard:
Same as Medium plus:
- +20 if the move finishes a token (reaches center).
- +12 if forming a blockade (2 tokens on same cell blocks enemies).
- Consider enemy distances: prefer moves that escape enemy threats.
- Prefer moves that keep token spread (don't leave tokens stranded on base too long).
- Look ahead 1 step: estimate what enemy AI would do after this move.
- Apply a slight randomization (±1 score noise) to avoid predictability.

#### AI Turn Automation:
In `GameContext`, use a `useEffect` watching `phase === 'rolling' && activePlayer.type !== 'human'`:
- After a 800ms delay (for UX realism), dispatch `ROLL_DICE`.
- After dice animation + 600ms delay, dispatch the chosen `SELECT_TOKEN`.

---

## SUB-PROMPT 9 — Audio Engine

### Goal
Implement a rich audio system using the Web Audio API for all game sounds.

### `engine/audioEngine.ts`

Create an `AudioEngine` class with:

```typescript
class AudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;

  // Programmatic sound generation methods:
  playDiceRoll(): void;      // Randomized rumbling noise → click
  playTokenMove(): void;     // Soft wooden tap
  playCapture(): void;       // Dramatic crash + minor chord
  playTokenEnter(): void;    // Bright ascending arpeggio
  playTokenFinish(): void;   // Victory fanfare (3-note ascending)
  playWin(): void;           // Full fanfare (5-note progression)
  playTick(): void;          // Timer tick (short beep)
  playButtonClick(): void;   // UI click (very short)
  playBonus(): void;         // Extra roll granted sound

  // Background music: procedural looping pad
  startMusic(): void;
  stopMusic(): void;
  setMasterVolume(vol: number): void;  // 0-1
  setSfxEnabled(enabled: boolean): void;
  setMusicEnabled(enabled: boolean): void;
}
```

**Implement each sound procedurally using Web Audio API nodes:**

- `playDiceRoll()`: Use `AudioBufferSourceNode` with white noise buffer, apply `BiquadFilterNode` (bandpass, freq sweeping 200→800Hz over 0.8s), fade out.
- `playTokenMove()`: Short (80ms) sine wave at 440Hz with quick exponential decay.
- `playCapture()`: Oscillator at 220Hz with `sawtooth` wave, quick distortion filter, decay 300ms.
- `playTokenEnter()`: Three sine oscillators: C4 → E4 → G4, each 150ms, creating ascending arpeggio.
- `playTokenFinish()`: Five-note ascending fanfare using sine waves: C4-E4-G4-C5, 200ms each.
- `playTick()`: 800Hz sine, 40ms, very quick decay.
- **Background music**: Create a looping ambient pad using 3–4 sine oscillators detuned slightly, playing a simple chord progression (I → IV → V → I) every 4 seconds.

### `hooks/useSound.ts`

```typescript
const useSound = () => {
  // Lazily initialize AudioEngine on first user interaction
  // Expose: playDiceRoll, playCapture, playTokenMove, etc.
  // Respect settings.soundEnabled and settings.musicEnabled
};
```

---

## SUB-PROMPT 10 — Home Screen & Lobby

### Goal
Build a gorgeous, animated home screen and game lobby with full player configuration.

### `components/screens/HomeScreen.tsx`

**Visual design:**
- Full-screen background: deep dark (`#0a0812`) with an animated particle field (30–50 small gold/jewel-colored dots slowly drifting).
- Center: Large "LUDO ROYALE" title in Cinzel font, 72px, with a gold gradient text fill (CSS: `background: linear-gradient(135deg, #f9d976, #f0b429, #d97706); -webkit-background-clip: text`).
- Subtitle: "The Classic Game. Reborn." in Crimson Pro italic.
- Animated logo: a stylized Ludo board icon (simplified SVG) with rotating outer ring.
- Three main buttons with Framer Motion hover/tap animations:
  - **Play** (large, gold gradient)
  - **How to Play** (medium, outlined)
  - **Settings** (medium, outlined)
- Bottom: version number + "Made with ♟" in small italic text.

**Particle animation:**
- Use `requestAnimationFrame` in a `useEffect` on a full-screen canvas behind the UI.
- Particles: small circles (2–4px), colors from the four player colors + gold, moving slowly with slight drift and edge-wrapping.

### `components/screens/LobbyScreen.tsx`

**Section 1 — Game Mode:**
- Three large card buttons: "2 Players", "3 Players", "4 Players".
- Each card shows: player slots visualization (colored circles for taken slots, empty circle for empty slots).
- Selected mode has a gold border + scale-up effect.

**Section 2 — Player Configuration:**
Show a row/card for each player slot (based on selected mode):
- Color swatch (fixed: Red P1, Blue P2, Green P3, Yellow P4).
- Player type toggle: `Human` / `AI Easy` / `AI Medium` / `AI Hard` — styled as a pill toggle.
- Name input field (for human players): styled text input with player color bottom border.
- Avatar selector: grid of 8 emoji options with title (e.g., 🦁 "The Lion", ⚔️ "The Warrior", 🧙 "The Wizard", 👑 "The King", 🐉 "The Dragon", 🎯 "The Archer", 🔥 "The Flame", 💎 "The Diamond").

**Section 3 — Game Options:**
- Turn Timer: Off / 15s / 30s / 60s (pill toggle).
- Hints: Show movable tokens — Toggle switch.
- Animation Speed: Slow / Normal / Fast (pill toggle).
- Sound Effects: Toggle.
- Background Music: Toggle.

**Section 4 — Start:**
- Large "Start Game" button (gold gradient, full width, 56px height).
- "Back" link top-left.

---

## SUB-PROMPT 11 — Game Screen & Canvas Integration

### Goal
Wire everything together in the main game screen, integrating the canvas, all panels, and game loop.

### `hooks/useCanvas.ts`

```typescript
const useCanvas = (canvasRef: RefObject<HTMLCanvasElement>) => {
  // Sets up canvas dimensions, devicePixelRatio scaling, resize observer
  // Returns: ctx, canvasSize, scale factor
};
```

Handle **HiDPI / Retina displays**:
- Multiply canvas width/height by `window.devicePixelRatio`.
- Scale the context by `devicePixelRatio`.
- Set CSS width/height to logical pixels.

Handle **responsive sizing**:
- On mobile: canvas should be `min(100vw, 100vh - 200px)` (leaving room for dice panel).
- On desktop: canvas is fixed at 750px.
- Use `ResizeObserver` to re-scale when window changes.

### `hooks/useAnimations.ts`

Manage the `requestAnimationFrame` game loop:
```typescript
const useAnimations = (gameState, dispatch) => {
  // RAF loop that:
  // 1. Clears the canvas
  // 2. Blits the pre-rendered static board
  // 3. Calls renderHighlights()
  // 4. Calls renderMovePath() if token is selected
  // 5. Calls renderTokens() with current animation states
  // 6. Calls renderCaptureEffect() if active
  // 7. Updates animation progress, dispatches ANIMATION_COMPLETE when done
};
```

### `components/game/GameCanvas.tsx`

```typescript
const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ctx, canvasSize } = useCanvas(canvasRef);
  const { gameState, dispatch } = useGameState();
  const { playSound } = useSound();

  // Handle canvas click: map pixel coordinates back to board cell,
  // determine if a token was clicked, dispatch SELECT_TOKEN
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Get click position relative to canvas
    // Scale by devicePixelRatio
    // Find which token (if any) was clicked
    // Dispatch appropriate action
  };

  useAnimations(canvasRef, ctx, gameState, dispatch);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="cursor-pointer rounded-xl shadow-2xl"
      style={{ touchAction: 'none' }}
    />
  );
};
```

**Touch support**: Add `onTouchStart` handler that converts touch coordinates to match the click handler.

### `components/screens/GameScreen.tsx`

Orchestrate the full game layout:
- Import and render: `GameCanvas`, `PlayerPanel` (×2 or ×4), `DicePanel`, `TurnTimer`, `ScoreBoard`.
- Pause button (top-right): opens `PauseModal`.
- Handle keyboard shortcuts: `Space` → roll dice, `Escape` → pause.
- Show `WinnerModal` when `gameState.phase === 'game-over'`.

---

## SUB-PROMPT 12 — Win Condition, Modals & Extra UI

### Goal
Implement win detection, modals, settings screen, and all remaining UI components.

### `components/game/WinnerModal.tsx`

Full-screen overlay with:
- Framer Motion entrance animation: scale from 0.5 to 1.0, fade in (500ms).
- Large trophy emoji: 🏆 (128px).
- Winner's color swatch + name: "[Name] Wins!".
- Confetti particle effect (launch 100 colored particles from the top using canvas or CSS).
- Stats summary: turns played, captures made, tokens finished first.
- Two buttons: "Play Again" (same settings) / "New Game" (back to lobby).

### Pause Modal (`PauseModal.tsx`):
- Blurred backdrop.
- Options: Resume / Restart / Settings / Quit to Menu.

### `components/screens/SettingsScreen.tsx`:
- Volume sliders for Master, SFX, Music (styled range inputs).
- Animation speed toggle.
- Hint system toggle.
- Keyboard shortcuts reference.
- Theme selector: "Classic" / "Dark Luxury" / "Neon" (changes board color palette via CSS variables).
- Reset all settings to defaults.

### Theme System:
Define three themes in CSS variables:
```css
[data-theme="classic"] {
  --board-bg: #f8f5eb;
  --board-border: #8B6914;
  --cell-safe: #86efac;
  --app-bg: #1e1b2e;
}
[data-theme="dark"] {
  --board-bg: #2d2a3e;
  --board-border: #c4a000;
  --cell-safe: #166534;
  --app-bg: #0a0812;
}
[data-theme="neon"] {
  --board-bg: #0f0f1a;
  --board-border: #00ffff;
  --cell-safe: #00ff88;
  --app-bg: #050510;
}
```

### How to Play Screen:
- Step-by-step illustrated guide using SVG mini-diagrams.
- Covers: rolling, entering tokens, movement, safe zones, captures, home run, winning.
- Animated walkthrough: auto-advances through steps every 4 seconds with a progress bar.

---

## SUB-PROMPT 13 — Polish, Responsiveness & Accessibility

### Goal
Final polish pass covering responsive design, accessibility, performance, and UX details.

### Responsive Design Checklist:
- [ ] Game canvas scales correctly on all screen sizes (320px to 2560px).
- [ ] Player panels reflow correctly on tablet and mobile.
- [ ] Dice panel is always visible and reachable on mobile (bottom of screen, sticky).
- [ ] Touch targets are minimum 44×44px on mobile.
- [ ] All modals are scrollable on small screens.
- [ ] Font sizes use `clamp()` for fluid scaling.
- [ ] No horizontal scrolling on any screen.
- [ ] Test at: 320px (iPhone SE), 375px, 390px, 768px, 1024px, 1440px, 1920px.

### Accessibility:
- All interactive elements have `aria-label` attributes.
- Canvas has `role="img"` with `aria-label="Ludo game board"`.
- Keyboard navigation: Tab through dice, tokens (when selectable), action buttons.
- `prefers-reduced-motion`: if user prefers reduced motion, skip token movement animation (teleport instantly) and reduce particle effects.
- Color contrast: all text meets WCAG AA standards.
- Screen reader announcements: use `aria-live="polite"` div to announce turn changes and dice results.

### Performance:
- Board static elements pre-rendered to `OffscreenCanvas`.
- Token rendering only loops through tokens that are not in base (optimization for early game).
- Particle systems capped at 60 particles max at any time.
- `requestAnimationFrame` loop only runs when `gameState.phase !== 'idle'`.
- Memoize expensive computations with `useMemo` (board cell coordinates, path calculations).
- Canvas cleared with `clearRect` (not `fillRect` with white) for transparency support.

### UX Polish Details:
- Hover tooltips on all tokens showing their current step count.
- "It's your turn!" subtle notification banner slides in for human players.
- Dice roll button has a satisfying `scale(0.95)` press animation.
- Board has a very subtle rotation on load (0.5° → 0° over 1s) just to feel "alive".
- When a player wins, all other tokens on board "shrink" and fade slightly.
- Long-press on a token (mobile) shows a tooltip with token info.
- Add a subtle ambient glow around the entire board matching the active player's color, cycling as turns change.

### LocalStorage Persistence:
- Save `GameSettings` to localStorage on every settings change.
- Save in-progress `GameState` to localStorage after each move (allows page refresh recovery).
- On load: check for a saved in-progress game, offer "Continue Game?" modal.

---

## SUB-PROMPT 14 — Bonus Features (Implement All)

### Goal
Implement the following premium features that elevate the game beyond a standard Ludo implementation.

### Feature 1: Spectator Camera
On desktop, add a subtle parallax effect: the board slightly shifts (±5px) as the mouse moves, creating a depth illusion using `transform: perspective(1000px) rotateX(Xdeg) rotateY(Ydeg)` (max ±3°).

### Feature 2: Move Preview
When hovering over a movable token, show a ghost/preview of where the token would land, with a semi-transparent token at the destination cell and a dashed path line. Show whether the destination is a safe cell, a capture opportunity, or a home run entry.

### Feature 3: Statistics Dashboard
After each game, show a detailed stats modal:
- Bar chart (drawn on canvas or SVG) showing: dice roll distribution per player.
- Timeline showing captures over time.
- "Most Valuable Move" highlight: the single move with the highest impact (capturing 2 tokens, or reaching home run).
- Player ranking table: 1st–4th with stats.

### Feature 4: Dice Roll History
Persistent strip at the bottom showing the last 12 dice rolls across all players (color-coded by player, showing the value). Helps players track patterns.

### Feature 5: Token Nicknames
Each token can have a procedurally generated nickname shown in a tooltip:
- Red tokens: "Ruby", "Crimson", "Scarlet", "Flame"
- Blue tokens: "Sapphire", "Azure", "Cobalt", "Wave"
- Green tokens: "Emerald", "Jade", "Forest", "Moss"
- Yellow tokens: "Topaz", "Amber", "Goldie", "Saffron"

### Feature 6: Achievement Toasts
Show brief achievement pop-up toasts (Framer Motion AnimatePresence, slide in from top-right, auto-dismiss after 3s) for:
- First capture of the game: "First Blood! 🩸"
- Capturing 3+ tokens total: "Conqueror! ⚔️"
- Getting all 4 tokens out of base: "Full Deploy! 🚀"
- Landing on a safe zone when in danger: "Safe! 🛡️"
- Rolling three 6s (and losing turn): "Too Lucky! 🎰"

### Feature 7: Quick Rematch
After a game ends, a "Quick Rematch" button resets the board with the same players and settings instantly (no lobby screen), with a cool board-wipe animation (radial wipe from center outward).

### Feature 8: Board Coordinates
Toggleable (via settings): show small cell coordinate numbers at the corner of each track cell (useful for learning / debugging). Off by default.

### Feature 9: Game Log Export
After a game ends, offer "Export Game Log" — generates a plain-text summary of all game events (formatted nicely) and copies to clipboard or triggers a `.txt` file download.

### Feature 10: Power-up Mode (Optional Toggle)
If enabled in settings, randomly place 3 "power-up" cells on the board each game (shown with a ⚡ icon). When a token lands on a power-up cell:
- **Speed Boost**: Move an extra 2 cells.
- **Shield**: Token is immune to capture for one turn (shown with a shield icon on the token).
- **Double Roll**: Roll the dice twice and choose which value to use.
Power-ups regenerate after being used.

---

## SUB-PROMPT 15 — Final Integration, Testing & Deployment

### Goal
Complete integration, final testing checklist, and production build.

### Integration Checklist:
- [ ] All screens navigate correctly: Home → Lobby → Game → Home.
- [ ] Game initializes correctly for all modes (2, 3, 4 players).
- [ ] All AI difficulties play correctly without errors.
- [ ] Dice roll → token selection → movement flow works end to end.
- [ ] Captures work: enemy token returns to base.
- [ ] Home run track functions correctly (tokens can't overshoot home).
- [ ] Safe zones prevent captures.
- [ ] Blockade rule works (2 tokens on same cell blocks enemies).
- [ ] Winning condition triggers correctly (all 4 tokens finished).
- [ ] Turn timer works and auto-moves on expiry.
- [ ] Sound system initializes correctly after first user interaction.
- [ ] All animations complete without errors or hanging.
- [ ] Canvas scales correctly on window resize.
- [ ] LocalStorage save/restore works.
- [ ] Settings persist across page refreshes.

### TypeScript Strict Mode — Ensure no errors:
```bash
npx tsc --noEmit
```
Fix all type errors. No `any` types except in truly unavoidable cases (clearly commented).

### Performance Audit:
- FPS during gameplay: target 60fps on desktop, 30+ fps on mid-range mobile.
- Initial bundle size: target <500KB gzipped (use `vite-bundle-analyzer`).
- Canvas rendering: no allocations in the RAF loop (pre-allocate all objects).

### Production Build:
```bash
npm run build
npm run preview
```
Ensure preview build works correctly with no console errors.

### README.md:
Write a comprehensive `README.md` including:
- Game overview and screenshot placeholder.
- Tech stack.
- Installation instructions.
- How to play.
- Project structure overview.
- Configuration options.
- Contributing guidelines.

---

## APPENDIX A — Color Reference

| Element | Color | Hex |
|---|---|---|
| App background | Obsidian | `#0a0812` |
| Board track | Parchment | `#f8f5eb` |
| Grid lines | Warm tan | `#c4b89a` |
| Safe cells | Soft green | `#86efac` |
| Center zone | Dark navy | `#1e1b2e` |
| Gold accent | Rich gold | `#f0b429` |
| Gold dark | Amber | `#d97706` |
| Red player | Crimson | `#ef4444` |
| Blue player | Sapphire | `#3b82f6` |
| Green player | Emerald | `#10b981` |
| Yellow player | Topaz | `#f59e0b` |
| Text primary | Warm white | `#fef9ee` |
| Text secondary | Muted gold | `#d4b483` |
| Card background | Dark navy | `#1e1b2e` |
| Card border | Subtle gold | `rgba(240,180,41,0.2)` |

---

## APPENDIX B — File Responsibility Matrix

| File | Responsibility |
|---|---|
| `engine/types.ts` | All TypeScript types |
| `engine/constants.ts` | Board layout, colors, timings |
| `engine/gameReducer.ts` | Game state machine |
| `engine/pathfinder.ts` | Token movement math |
| `engine/collision.ts` | Capture / blockade logic |
| `engine/ai.ts` | AI decision making |
| `engine/audioEngine.ts` | Sound system |
| `renderers/boardRenderer.ts` | Static board drawing |
| `renderers/tokenRenderer.ts` | Token drawing + animation |
| `renderers/effectsRenderer.ts` | Particles, highlights |
| `renderers/diceRenderer.ts` | 3D die drawing |
| `hooks/useGameState.ts` | Game state context hook |
| `hooks/useCanvas.ts` | Canvas setup + scaling |
| `hooks/useAnimations.ts` | RAF game loop |
| `hooks/useDice.ts` | Dice roll logic + animation |
| `hooks/useTimer.ts` | Turn countdown timer |
| `hooks/useSound.ts` | Sound hook |
| `context/GameContext.tsx` | Game state provider |
| `context/SettingsContext.tsx` | Settings provider |
| `components/screens/*` | Full page views |
| `components/game/*` | Game HUD components |
| `components/ui/*` | Shared UI primitives |

---

## APPENDIX C — Key Ludo Rules Implementation Notes

1. **Entering the board:** A token can only leave its home base when a 6 is rolled. The token is placed on the player's starting cell. Rolling a 6 grants an extra roll.

2. **Movement:** Tokens move clockwise around the outer track. After completing a full loop, they enter their color-specific home run track.

3. **Capturing:** Landing on a cell occupied by exactly one enemy token sends that enemy back to base. The capturing player gets a bonus dice roll.

4. **Safe zones:** Marked cells where captures cannot happen. Tokens on safe zones cannot be captured.

5. **Blockade:** Two tokens of the same color on the same cell form a blockade. No enemy token can pass through or land on a blockade.

6. **Home run:** The last 6 cells of the track are color-specific and only accessible to tokens of that color. Tokens must enter the home run and advance exactly to the final cell. Overshooting is not allowed (token stays in place if the dice value would overshoot).

7. **Winning:** First player to get all 4 tokens to the center finishing zone wins. Continue play for 2nd, 3rd, 4th place if desired.

8. **No valid moves:** If a player rolls but cannot move any token (all blocked, all finished, or only base tokens with non-6 roll), the turn passes automatically.

9. **Three sixes rule:** If a player rolls three consecutive 6s in a single turn, the turn is forfeited (prevents excessive exploitation).

---

*End of Ludo Royale Agent Prompt — v1.0*
*Estimated implementation time: 8–12 hours for a skilled agent.*
*Total files to create: ~40 TypeScript/TSX files.*
