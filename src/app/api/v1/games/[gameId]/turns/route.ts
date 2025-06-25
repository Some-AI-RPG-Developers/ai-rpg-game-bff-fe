import { NextRequest, NextResponse } from 'next/server';
import { NewTurn, ChosenCharacterAction } from '@/server/types/rest/api.alias.types';
import {GameService} from "@/server/services/game.service";
import {getGameServiceInstance} from "@/global";

// POST /api/v1/games/{gameId}/turns - Submit a new turn for the game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
): Promise<Response>  {
  try {
    const { gameId } = await params;
    console.debug(`POST /api/v1/games/${gameId}/turns - Submit a turn for the game`)

    if (!gameId) {
      return Response.json(
          {error: `Missing param gamedId: ${gameId}`},
          {status: 400})
    }

    const body: NewTurn = await request.json();
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

    // Convert character names to character IDs
    const nameToIdMap = new Map<string, string>();
    game.characters.forEach(char => {
      nameToIdMap.set(char.name, char.characterId);
    });

    const convertedCharacterActions: ChosenCharacterAction[] = body.characterActions
      .map(action => ({
          characterId: nameToIdMap.get(action.characterName),
          characterName: action.characterName,
          chosenOption: action.chosenOption
        }));
            
    await gameService.submitTurn(gameId, {
      ...body,
      characterActions: convertedCharacterActions
    });
    return NextResponse.json("", { status: 202 });

  } catch (error) {
    console.error('Error submitting turn:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal server error occurred while processing the request' },
      { status: 500 }
    );
  }
} 