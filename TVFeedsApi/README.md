# undo latest migration
ef migrations remove

# apply migrations
dotnet ef database update