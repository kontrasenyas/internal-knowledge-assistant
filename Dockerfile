FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Install Node.js for Angular build
RUN apt-get update && apt-get install -y nodejs npm

# Copy and restore .NET project
COPY ["InternalKnowledgeAssistant.Server/InternalKnowledgeAssistant.Server.csproj", "InternalKnowledgeAssistant.Server/"]
RUN dotnet restore "InternalKnowledgeAssistant.Server/InternalKnowledgeAssistant.Server.csproj"

# Copy Angular client and install dependencies
COPY ["internalknowledgeassistant.client/package*.json", "internalknowledgeassistant.client/"]
WORKDIR "/src/internalknowledgeassistant.client"
RUN npm ci

# Copy all source files
WORKDIR "/src"
COPY . .

# Build Angular client
WORKDIR "/src/internalknowledgeassistant.client"
RUN npm run build -- --configuration production

# Build .NET project
WORKDIR "/src/InternalKnowledgeAssistant.Server"
RUN dotnet build "InternalKnowledgeAssistant.Server.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "InternalKnowledgeAssistant.Server.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create data directory for SQLite database
RUN mkdir -p /app/data

ENTRYPOINT ["dotnet", "InternalKnowledgeAssistant.Server.dll"]
