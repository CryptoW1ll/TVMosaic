# undo latest migration
ef migrations remove

# apply migrations
dotnet ef database update


# dotnet build

# publish
dotnet publish TVFeedsApi -c Release -o ./publish

# run 
dotnet ./publish/YourProjectName.dll

# exe
dotnet publish TVFeedsApi -c Release -o ./publish/Mosaic.exe


CMD: dotnet run
Now listening on: http://localhost:5125
Works on Front End

CMD: dotnet TVFeedsApi\bin\Debug\net9.0\TVFeedsApi.dll
Now listening on: http://localhost:5000
Error on Front End

CMD: dotnet publish\TVFeedsApi.dll
Now listening on: http://localhost:5000
Error on Front End

CMD: Start TVFeedsApi.exe
Now listening on: http://localhost:5000
Error on Front End