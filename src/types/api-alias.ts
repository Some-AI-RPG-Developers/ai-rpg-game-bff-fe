import { components } from './api';

/**
 * Type aliases for API request and response types
 */

/** 
 * Type alias for creating a new game 
 */
export type NewGame = components['schemas']['NewGame'];

/**
 * Type alias for submitting a new turn
 */
export type NewTurn = components['schemas']['NewTurn'];

/**
 * Type alias for a game character
 */
export type Character = components['schemas']['Character'];

/**
 * Type alias for a game
 */
export type Game = components['schemas']['Game'];

/**
 * Type alias for a game scene
 */
export type Scene = components['schemas']['Scene'];

/**
 * Type alias for a game turn
 */
export type Turn = components['schemas']['Turn'];

/**
 * Type alias for character actions in a game
 */
export type CharacterAction = components['schemas']['CharacterAction'];

/**
 * Type alias for character options in a game
 */
export type CharacterOptions = components['schemas']['CharacterOptions'];

/**
 * Type alias for a game objective
 */
export type Objective = components['schemas']['Objective']; 