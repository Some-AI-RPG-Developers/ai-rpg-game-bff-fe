import {NextRequest, NextResponse} from 'next/server';
import {GameService} from "@/services/game.service";
import {Game} from "@/types/rest/api.alias.types";
import {getGameServiceInstance} from "@/global";

// GET /api/v1/games/{gameId} - Get game by ID
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
): Promise<Response> {
  try {
    const { gameId } = await params;
    if (!gameId) {
      return Response.json(
          {error: `Missing param gamedId: ${gameId}`},
          {status: 400})
    }

    const gameService: GameService = getGameServiceInstance()
    const game: Game | null = await gameService.getGame(gameId);
    
    if (!game) {
      return NextResponse.json(
        { status: 404, message: `Game with ID '${gameId}' not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    console.error('Error retrieving game:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal server error occurred while processing the request' },
      { status: 500 }
    );
  }
}

// POST /api/v1/games/{gameId} - Start a game by ID
export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    const gameService: GameService = getGameServiceInstance()
    const game = await gameService.getGame(gameId);
    console.debug(`POST /api/v1/games/${gameId} - Start a game by ID`)
    
    if (!game) {
      return NextResponse.json(
        { status: 404, message: `Game with ID '${gameId}' not found` },
        { status: 404 }
      );
    }
    
    // Check if the game has already been started
    if (game.scenes && game.scenes.length > 0) {
      return NextResponse.json(
        { status: 409, message: 'Game has already been started' },
        { status: 409 }
      );
    }
    
    await gameService.startGame(gameId);
    
    return NextResponse.json("", { status: 202 });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal server error occurred while processing the request' },
      { status: 500 }
    );
  }
} 