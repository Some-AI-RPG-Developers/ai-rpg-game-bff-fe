import { NextRequest, NextResponse } from 'next/server';
import {GameId, NewGame} from '@/types/rest/api.alias.types';
import {GameService} from "@/services/game.service";
import {getGameServiceInstance} from "@/global";

// POST /api/v1/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    const body: NewGame = await request.json();
    
    // Validate required fields
    if (!body.gamePrompt || !body.characters || body.characters.length === 0) {
      return NextResponse.json(
        { status: 400, message: 'Missing required fields: gamePrompt or characters' },
        { status: 400 }
      );
    }

    // Create a new game
    const gameService: GameService = getGameServiceInstance()
    const result: GameId = await gameService.createGame(body);
    
    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal server error occurred while processing the request' },
      { status: 500 }
    );
  }
} 