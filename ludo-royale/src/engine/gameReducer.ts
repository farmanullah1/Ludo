import { GameState, GameSettings, Player, Token, TokenPosition, GameEvent, GamePhase, DiceState } from './types';
import { getMovableTokens, getTokenPath, getPixelPosition } from './pathfinder';
import { SAFE_CELLS, TURN_ORDER, ANIM_DURATION } from './constants';

export type GameAction =
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
  | { type: 'UNDO_MOVE' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' };

const addEvent = (state: GameState, type: GameEvent['type'], description: string, playerColor = state.players[state.activePlayerIndex]?.color): GameState => {
  return {
    ...state,
    eventLog: [
      {
        id: Math.random().toString(36).substr(2, 9),
        turn: state.turnNumber,
        playerColor,
        type,
        description,
        timestamp: Date.now()
      },
      ...state.eventLog
    ].slice(0, 50)
  };
};

export const INITIAL_STATE: GameState = {
  phase: 'idle',
  players: [],
  activePlayerIndex: 0,
  dice: { values: [1], rolling: false, rollCount: 0, usedValues: [], canRoll: false },
  animations: [],
  winner: null,
  turnNumber: 1,
  eventLog: [],
  settings: {
    mode: '4-player',
    players: [],
    turnTimeLimit: null,
    soundEnabled: true,
    musicEnabled: true,
    animationSpeed: 'normal',
    showMovableHints: true,
    blockadeRules: 'standard',
    extraDiceRolls: true,
    safeZoneProtection: true
  },
  boardCells: [],
  selectedTokenId: null,
  movableTokenIds: [],
  captureEffect: null
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      const settings = action.payload;
      const players: Player[] = settings.players.map((pConfig, pIndex) => ({
        id: `p-${pConfig.color}`,
        name: pConfig.name,
        color: pConfig.color,
        type: pConfig.type,
        isActive: true,
        stats: { tokensFinished: 0, tokensCapured: 0, doublesRolled: 0, turnsPlayed: 0, totalMovesMade: 0 },
        avatar: pConfig.avatar,
        tokens: Array.from({ length: 4 }).map((_, i) => ({
          id: `${pConfig.color}-${i}`,
          color: pConfig.color,
          index: i,
          position: { type: 'base' },
          isHome: true,
          isFinished: false,
          stepCount: 0,
          animating: false
        }))
      }));

      return {
        phase: 'rolling',
        players,
        activePlayerIndex: 0,
        dice: { values: [1], rolling: false, rollCount: 0, usedValues: [], canRoll: true },
        animations: [],
        winner: null,
        turnNumber: 1,
        eventLog: [],
        settings,
        boardCells: [], // Generated in component
        selectedTokenId: null,
        movableTokenIds: [],
        captureEffect: null
      };
    }

    case 'ROLL_DICE': {
      return { ...state, dice: { ...state.dice, rolling: true }, phase: 'rolling' };
    }

    case 'DICE_RESULT': {
      const val = action.payload.value;
      const rollCount = state.dice.rollCount + 1;
      
      let nextState = {
        ...state,
        dice: { ...state.dice, values: [val] as [number], rolling: false, rollCount, canRoll: false }
      };

      nextState = addEvent(nextState, 'roll', `Rolled a ${val}`);

      // Check 3 sixes rule
      if (val === 6 && rollCount === 3 && state.settings.extraDiceRolls) {
        nextState = addEvent(nextState, 'skip', `Rolled three 6s! Turn forfeited.`);
        return { ...nextState, phase: 'idle' }; // will trigger end turn
      }

      const activePlayer = nextState.players[nextState.activePlayerIndex];
      const allTokens = nextState.players.flatMap(p => p.tokens);
      const movableIds = getMovableTokens(activePlayer, val, allTokens);

      nextState.movableTokenIds = movableIds;

      if (movableIds.length === 0) {
        nextState = addEvent(nextState, 'skip', `No valid moves.`);
        return nextState; // Let an effect handle END_TURN or we could inline it
      } else if (movableIds.length === 1 && !state.settings.showMovableHints) {
        // Auto select if only one valid move and hints are off
        nextState.selectedTokenId = movableIds[0];
        nextState.phase = 'moving-token';
      } else {
        nextState.phase = 'selecting-token';
      }

      return nextState;
    }

    case 'SELECT_TOKEN': {
      if (!state.movableTokenIds.includes(action.payload.tokenId)) return state;
      return {
        ...state,
        selectedTokenId: action.payload.tokenId,
        phase: 'moving-token'
      };
    }

    case 'MOVE_TOKEN': {
      const { tokenId, targetPosition } = action.payload;
      const diceVal = state.dice.values[0];
      const activePlayer = state.players[state.activePlayerIndex];
      let hasCaptured = false;
      let hasFinished = false;

      // 1. Update active player's tokens
      const movingToken = activePlayer.tokens.find(t => t.id === tokenId);
      const path = movingToken ? getTokenPath(movingToken, diceVal, []) : [];
      const pathPoints = movingToken ? path.map(pos => ({ 
        ...getPixelPosition(pos, [], movingToken.index, movingToken.color),
        position: pos
      })) : [];

      let nextPlayers = state.players.map(p => {
        if (p.id !== activePlayer.id) return p;
        return {
          ...p,
          stats: { ...p.stats, totalMovesMade: p.stats.totalMovesMade + 1 },
          tokens: p.tokens.map(t => {
            if (t.id === tokenId) {
              const newStepCount = t.position.type === 'base' ? 0 : t.stepCount + diceVal;
              if (targetPosition.type === 'finished') hasFinished = true;
              return {
                ...t,
                position: targetPosition,
                stepCount: newStepCount,
                isHome: targetPosition.type === 'base',
                isFinished: targetPosition.type === 'finished',
                animating: true
              };
            }
            return t;
          })
        };
      });

      // ... existing capture logic ...
      
      const moveAnim: import('./types').AnimationState = {
        type: 'move',
        tokenId,
        path: pathPoints,
        progress: 0,
        duration: diceVal * ANIM_DURATION.tokenMove,
        startTime: Date.now()
      };

      let nextState = {
        ...state,
        players: nextPlayers,
        animations: [...state.animations, moveAnim],
        selectedTokenId: null,
        movableTokenIds: []
      };

      if (hasCaptured) nextState = addEvent(nextState, 'capture', `Captured an enemy! Extra roll!`);
      if (hasFinished) nextState = addEvent(nextState, 'finish', `Token finished! Extra roll!`);

      // 3. Determine next phase
      const rolledSix = diceVal === 6;
      if ((rolledSix || hasCaptured || hasFinished) && !nextState.players[state.activePlayerIndex].tokens.every(t => t.isFinished)) {
        nextState.phase = 'bonus-roll';
      } else {
        nextState.phase = 'idle'; // Will trigger END_TURN
      }

      // Check if won
      const finishedCount = nextPlayers[state.activePlayerIndex].tokens.filter(t => t.isFinished).length;
      if (finishedCount === 4) {
        nextState.phase = 'game-over';
        nextState.winner = nextState.players[state.activePlayerIndex];
      }

      return nextState;
    }

    case 'CAPTURE_TOKEN': {
      const { capturedTokenId, capturedBy } = action.payload;
      const tokensUpdated = state.players.map(p => ({
        ...p,
        stats: p.id === capturedBy ? { ...p.stats, tokensCapured: p.stats.tokensCapured + 1 } : p.stats,
        tokens: p.tokens.map(t => {
          if (t.id === capturedTokenId) {
            return {
              ...t,
              position: { type: 'base' },
              stepCount: 0,
              isHome: true
            };
          }
          return t;
        })
      }));

      return addEvent({
        ...state,
        players: tokensUpdated,
      }, 'capture', `Captured an enemy token!`);
    }

    case 'TOKEN_FINISHED': {
      // Mark token finished
      let nextState = { ...state };
      let won = false;
      const tokensUpdated = nextState.players.map(p => {
        if (p.id === state.players[state.activePlayerIndex].id) {
          const newTokens = p.tokens.map(t => t.id === action.payload.tokenId ? { ...t, isFinished: true, position: { type: 'finished' } as TokenPosition } : t);
          const finishedCount = newTokens.filter(t => t.isFinished).length;
          if (finishedCount === 4) won = true;
          return {
            ...p,
            stats: { ...p.stats, tokensFinished: p.stats.tokensFinished + 1 },
            tokens: newTokens
          };
        }
        return p;
      });

      nextState.players = tokensUpdated;
      nextState = addEvent(nextState, 'finish', `Token reached home!`);

      if (won) {
        nextState.phase = 'game-over';
        nextState.winner = nextState.players[nextState.activePlayerIndex];
      }
      return nextState;
    }

    case 'ANIMATION_COMPLETE': {
      const { animationId } = action.payload;
      return {
        ...state,
        players: state.players.map(p => ({
          ...p,
          tokens: p.tokens.map(t => t.id === animationId ? { ...t, animating: false } : t)
        })),
        animations: state.animations.filter(a => a.tokenId !== animationId)
      };
    }

    case 'END_TURN': {
      let nextIndex = state.activePlayerIndex;
      let nextPlayer;
      let iterations = 0;
      do {
        nextIndex = (nextIndex + 1) % state.players.length;
        nextPlayer = state.players[nextIndex];
        iterations++;
      } while (nextPlayer.tokens.every(t => t.isFinished) && iterations < state.players.length);

      return {
        ...state,
        activePlayerIndex: nextIndex,
        turnNumber: state.turnNumber + 1,
        phase: 'rolling',
        dice: { values: [1], rolling: false, rollCount: 0, usedValues: [], canRoll: true },
        movableTokenIds: [],
        selectedTokenId: null
      };
    }

    case 'BONUS_ROLL': {
      return {
        ...state,
        phase: 'rolling',
        dice: { ...state.dice, rolling: false, canRoll: true }
      };
    }

    case 'TIMER_EXPIRED': {
      // Logic for timer expired
      return { ...state, phase: 'idle' }; // Trigger end turn via effect
    }

    default:
      return state;
  }
};
