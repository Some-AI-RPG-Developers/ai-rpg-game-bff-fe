#!/bin/bash

echo "Testing API routes for the RPG Game BFF"
echo "--------------------------------------"
echo ""

# Create a new game
echo "1. Creating a new game..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/games \
  -H "Content-Type: application/json" \
  -d '{
    "gamePrompt": "Create a medieval fantasy adventure where a group of heroes must save their kingdom from a dragon",
    "characters": [
      {
        "name": "Sir Roland",
        "characterPrompt": "A noble knight who values honor and courage above all else"
      },
      {
        "name": "Lady Elara",
        "characterPrompt": "A wise mage seeking to protect the realm with her magical powers"
      },
      {
        "name": "Thorne",
        "characterPrompt": "A skilled ranger with a deep connection to nature and exceptional tracking abilities"
      }
    ]
  }')

echo "Response: $RESPONSE"
GAME_ID=$(echo $RESPONSE | sed -n 's/.*"gameId":"\([^"]*\)".*/\1/p')
echo "Extracted Game ID: $GAME_ID"
echo ""

# Get the game details
echo "2. Getting game details for ID: $GAME_ID"
GAME_DETAILS=$(curl -s -X GET http://localhost:3000/api/v1/games/$GAME_ID)
echo "Response: $GAME_DETAILS"
echo ""

# Start the game
echo "3. Starting the game with ID: $GAME_ID"
START_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/games/$GAME_ID)
echo "Response: $START_RESPONSE"
echo ""

# Get the updated game details
echo "4. Getting updated game details for ID: $GAME_ID"
UPDATED_GAME=$(curl -s -X GET http://localhost:3000/api/v1/games/$GAME_ID)
echo "Response: $UPDATED_GAME"
echo ""

# Submit a turn
echo "5. Submitting a turn for game ID: $GAME_ID"
TURN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/games/$GAME_ID/turns \
  -H "Content-Type: application/json" \
  -d '{
    "characterActions": [
      {
        "characterName": "Sir Roland",
        "chosenOption": "Charge in with shield raised to protect the party"
      },
      {
        "characterName": "Lady Elara",
        "chosenOption": "Cast a protective barrier spell around the group"
      },
      {
        "characterName": "Thorne",
        "chosenOption": "Take position on high ground with bow ready"
      }
    ]
  }')
echo "Response: $TURN_RESPONSE"
echo ""

# Get the final game state
echo "6. Getting final game state for ID: $GAME_ID"
FINAL_GAME=$(curl -s -X GET http://localhost:3000/api/v1/games/$GAME_ID)
echo "Response: $FINAL_GAME"
echo ""

echo "API test complete!" 