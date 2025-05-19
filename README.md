# AI RPG Game BFF Frontend

This project serves as the Backend for Frontend (BFF) for the AI RPG Game application. It provides RESTful APIs for game creation, management, and turn handling.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Documentation

The API follows the OpenAPI specification located in `src/openapi/bff-api.yaml`.

### Available Endpoints

#### Create a new game

```bash
# Create a new game
curl -X POST http://localhost:3000/api/v1/games \
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
  }'
```

Response:
```json
{
  "gameId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Get a game by ID

```bash
# Get a game by ID
curl -X GET http://localhost:3000/api/v1/games/{gameId}
```

Response:
```json
{
  "gameId": "123e4567-e89b-12d3-a456-426614174000",
  "gamePrompt": "Create a medieval fantasy adventure where a group of heroes must save their kingdom from a dragon",
  "synopsis": "A brave band of heroes embarks on a perilous journey to defend their kingdom from an ancient dragon",
  "maxScenesNumber": 5,
  "characters": [
    {
      "name": "Sir Roland",
      "description": "A brave knight with shining armor and unwavering loyalty",
      "prompt": "You are a noble knight who values honor and courage above all else",
      "status": "active"
    },
    ...
  ],
  "scenes": [...],
  "objectives": [...],
  "finalObjective": {...}
}
```

#### Start a game

```bash
# Start a game
curl -X POST http://localhost:3000/api/v1/games/{gameId}
```

Response:
```json
{
  "message": "Game started successfully"
}
```

#### Submit a turn

```bash
# Submit a turn
curl -X POST http://localhost:3000/api/v1/games/{gameId}/turns \
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
  }'
```

Response:
```json
{
  "message": "Turn submission accepted"
}
```

## Development

The project uses:

1. Next.js 15 with App Router
2. OpenAPI for API specification
3. TypeScript for type safety

API types are automatically generated from the OpenAPI specification during build.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## MongoDB Integration

The application now supports MongoDB for data persistence. The implementation focuses on the GetGame endpoint which retrieves game data from MongoDB.

### Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Create a `.env.local` file in the project root with:
   ```
   MONGODB_URI=mongodb://localhost:27017
   ```
   (Change the URI if using MongoDB Atlas)

3. Seed the database with sample data:
   ```bash
   npm run seed-db
   ```

### Implementation Details

- The application uses a layered architecture for database operations:
  - `MongodbClient`: Handles database connection management
  - `GameRepository`: Manages game collection operations

- The code follows SOLID principles:
  - Single Responsibility: Each class has one responsibility
  - Open-Closed: Interfaces allow extending functionality without modifying code
  - Liskov Substitution: Implementations can be substituted for interfaces
  - Interface Segregation: Clean, focused interfaces for each concern
  - Dependency Inversion: High-level modules depend on abstractions

- The application maintains fallback to in-memory storage if MongoDB is unavailable

### Testing

You can test the MongoDB integration by:

1. Seeding the database with `npm run seed-db`
2. Starting the application with `npm run dev`
3. Using the sample game IDs printed from the seed script to test the GetGame endpoint
