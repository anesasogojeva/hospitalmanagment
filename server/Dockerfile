FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY dizajn_Projekti.csproj .
RUN dotnet restore dizajn_Projekti.csproj
COPY . .
RUN dotnet publish dizajn_Projekti.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "dizajn_Projekti.dll"]
