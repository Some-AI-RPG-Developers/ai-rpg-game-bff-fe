# API Testing Scripts

This directory contains HTTP test files for testing the AI RPG Game BFF API endpoints.

## Test Files

### 1. `api-tests.http`
**Purpose:** Focused testing of all API v1 endpoints  
**Scope:** Core functionality with streamlined test cases  
**Best for:** Quick validation and development testing

**Endpoints Covered:**
- `POST /api/v1/games` - Create game
- `GET /api/v1/games/{gameId}` - Get game details  
- `POST /api/v1/games/{gameId}` - Start game
- `POST /api/v1/games/{gameId}/turns` - Submit turn
- `GET /api/v1/games/{gameId}/updates` - Subscribe to updates (SSE)

### 2. `api-tests-comprehensive.http`
**Purpose:** Comprehensive testing of all API endpoints  
**Scope:** Full application testing including health checks, error scenarios, and performance tests  
**Best for:** Integration testing and QA validation

**Additional Coverage:**
- Health check endpoints (`/api/health/*`)
- Error handling scenarios
- Performance testing
- Real-time updates (SSE)
- Edge cases and validation

## Prerequisites

### 1. MongoDB Setup
```bash
# Local MongoDB
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Environment Configuration
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=ai-rpg
GAMES_COLLECTION=games
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=0.1.0
MAX_HEAP_SIZE_MB=512
```

### 3. Application Setup
```bash
# Install dependencies
npm install

# Start the application
npm run dev
```

## How to Use

### Option 1: VS Code REST Client Extension
1. Install the "REST Client" extension in VS Code
2. Open any `.http` file
3. Click "Send Request" above each test case
4. View responses in the adjacent panel

### Option 2: IntelliJ HTTP Client
1. Open the `.http` file in IntelliJ IDEA
2. Click the green arrow next to each request
3. View responses in the HTTP Response panel

### Option 3: Command Line (using httpie)
```bash
# Install httpie
pip install httpie

# Example requests
http POST localhost:3000/api/v1/games gamePrompt="Test game" characters:='[{"name":"Hero","characterPrompt":"A brave hero"}]'
```

## Test Execution Strategy

### Quick Development Testing
1. Use `api-tests.http`
2. Run tests 1-7 for basic functionality
3. Run error scenarios (tests 8-12) for validation
4. Run complete game flow (tests 13-20) for end-to-end testing

### Comprehensive Testing
1. Use `api-tests-comprehensive.http`
2. Start with health checks (tests 1-3)
3. Run game management tests (tests 4-11)
4. Execute turn submission tests (tests 12-17)
5. Verify game states (tests 18-19)
6. Test error scenarios (tests 20-25)
7. Validate SSE functionality (tests 26-28)

## Expected Responses

### Successful Game Creation
```json
{
  "gameId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Game Details Response
```json
{
  "gameId": "123e4567-e89b-12d3-a456-426614174000",
  "gamePrompt": "Create a medieval fantasy adventure...",
  "synopsis": "A brave band of heroes embarks on a journey...",
  "maxScenesNumber": 5,
  "characters": [...],
  "scenes": [...],
  "objectives": [...],
  "finalObjective": {...}
}
```

### Turn Submission Response
```json
{
  "message": "Turn submission accepted"
}
```

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`
- Verify network connectivity

**404 Not Found**
- Check if application is running on correct port
- Verify endpoint URLs
- Ensure game IDs are valid

**400 Bad Request**
- Validate request payload structure
- Check required fields are present
- Verify character names match game characters

**500 Internal Server Error**
- Check application logs
- Verify MongoDB connectivity
- Check environment variables

### Debugging Tips

1. **Monitor Application Logs**
   ```bash
   npm run dev
   # Watch console output for errors
   ```

2. **Check MongoDB Data**
   ```bash
   mongosh
   use ai-rpg
   db.games.find().pretty()
   ```

3. **Verify Health Endpoints**
   ```bash
   curl http://localhost:3000/api/health
   ```

4. **Test Individual Endpoints**
   Start with simple GET requests before complex POST operations

## SSE Testing

Server-Sent Events (SSE) endpoints require special handling:

### Using curl
```bash
curl -N -H "Accept: text/event-stream" \
  http://localhost:3000/api/v1/games/{gameId}/updates
```

### Using JavaScript
```javascript
const eventSource = new EventSource('/api/v1/games/{gameId}/updates');
eventSource.onmessage = function(event) {
  console.log('Game update:', JSON.parse(event.data));
};
```

## Performance Testing

For load testing, consider using:
- **Artillery.js** for HTTP load testing
- **k6** for performance testing
- **Apache Bench (ab)** for simple load tests

Example with Artillery:
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Create and play games"
    flow:
      - post:
          url: "/api/v1/games"
          json:
            gamePrompt: "Test game"
            characters: [{"name": "Hero", "characterPrompt": "A hero"}]
```

## Contributing

When adding new endpoints:
1. Add test cases to both HTTP files
2. Include error scenarios
3. Update this README
4. Test with MongoDB integration
5. Verify SSE functionality if applicable 