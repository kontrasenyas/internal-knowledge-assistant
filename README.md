# 1. Clone the repo
git clone https://github.com/kontrasenyas/internal-knowledge-assistant-backend.git

# 2. Navigate
cd internal-knowledge-assistant-backend

# 3. Run the API
dotnet run --project src/WebApi

# 4. Access Swagger UI
https://localhost:5001/swagger

🧪 Sample Test Flow with Postman
POST /api/auth/register → create user

POST /api/auth/login → get JWT token

Use token in Authorization: Bearer <token>

POST /api/notes → create note

GET /api/notes → list notes

