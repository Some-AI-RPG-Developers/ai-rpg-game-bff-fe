import { NextRequest, NextResponse } from 'next/server';
import { NewTurn } from '@/types/api.alias.types';
import {GameService} from "@/services/game.service";
import {getGameServiceInstance} from "@/global";

// POST /api/v1/games/{gameId}/turns - Submit a new turn for the game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body: NewTurn = await request.json();
    
    // Validate required fields
    if (!body.characterActions || body.characterActions.length === 0) {
      return NextResponse.json(
        { status: 400, message: 'Missing required field: characterActions' },
        { status: 400 }
      );
    }
    
    // Check if the game exists
    const gameService: GameService = getGameServiceInstance()
    const game = await gameService.getGame(gameId);
    
    if (!game) {
      return NextResponse.json(
        { status: 404, message: `Game with ID '${gameId}' not found` },
        { status: 404 }
      );
    }
    
    // Submit the turn
    const success = await gameService.submitTurn(gameId, body);
    
    if (!success) {
      return NextResponse.json(
        { status: 500, message: 'Failed to submit turn' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Turn submission accepted' }, { status: 202 });
  } catch (error) {
    console.error('Error submitting turn:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal server error occurred while processing the request' },
      { status: 500 }
    );
  }
} 