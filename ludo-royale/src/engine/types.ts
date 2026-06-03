// Player identity
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';
export type PlayerType = 'human' | 'ai-easy' | 'ai-medium' | 'ai-hard';

// Token state
export interface Token {
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

export type TokenPosition =
  | { type: 'base' }
  | { type: 'board'; cellIndex: number }   // 0-51 on outer track
  | { type: 'homeRun'; step: number }      // 1-6 on color home run
  | { type: 'finished' };

// Player state
export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  type: PlayerType;
  tokens: Token[];
  isActive: boolean;
  stats: PlayerStats;
  avatar: AvatarConfig;
}

export interface PlayerStats {
  tokensFinished: number;
  tokensCapured: number;
  doublesRolled: number;
  turnsPlayed: number;
  totalMovesMade: number;
}

export interface AvatarConfig {
  iconName: string;
  title: string;   // e.g. "The Conqueror"
}

// Dice
export interface DiceState {
  values: [number, number] | [number];   // Ludo uses one die; optionally two
  rolling: boolean;
  rollCount: number;               // times rolled this turn (max 3 for sixes rule)
  usedValues: number[];            // which dice values were used
  canRoll: boolean;
}

// Game phase
export type GamePhase =
  | 'idle'
  | 'rolling'
  | 'selecting-token'
  | 'moving-token'
  | 'capturing'
  | 'bonus-roll'     // player captured or reached home run
  | 'game-over';

// Game mode
export type GameMode = '2-player' | '3-player' | '4-player';

// Game settings
export interface GameSettings {
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

export interface PlayerConfig {
  name: string;
  type: PlayerType;
  color: PlayerColor;
  avatar: AvatarConfig;
}

// Board cell
export interface BoardCell {
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
export interface AnimationState {
  type: 'move' | 'capture' | 'enter-board' | 'reach-home' | 'dice-roll' | 'particle';
  tokenId?: string;
  path?: Point[];
  progress: number;     // 0-1
  duration: number;     // ms
  startTime: number;
  onComplete?: () => void;
}

export interface Point {
  x: number;
  y: number;
}

// Full game state (for reducer)
export interface GameState {
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

export interface GameEvent {
  id: string;
  turn: number;
  playerColor: PlayerColor;
  type: 'roll' | 'move' | 'capture' | 'enter' | 'finish' | 'skip';
  description: string;
  timestamp: number;
}

export interface CaptureEffect {
  position: Point;
  color: PlayerColor;
  startTime: number;
}
