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


# Debugging

dotnet publish TVFeedsApi -c Release -o ./publish 

dotnet publish\TVFeedsApi.dll 
Now listening on: http://localhost:5125

frontend started: VITE v6.3.2  ready in 128 ms 

  ➜  Local:   http://localhost:5173/ >> localhost/:1 Access to fetch at 'http://localhost:5125/api/Channel' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

api.jsx:11 
 GET http://localhost:5125/api/Channel net::ERR_FAILED 500 (Internal Server Error)
api.jsx:30 API request failed: Failed to fetch
App.jsx:83 Failed to fetch IPTV channels: TypeError: Failed to fetch
    at handleRequest (api.jsx:11:28)
    at fetchAllChannels (api.jsx:42:10)
    at loadChannels (App.jsx:75:40)
    at App.jsx:90:9


# obj 
is your workbench: tools, parts, glue, instructions

# bin 
is the finished model ready to go on display or get used

# publish correctly?
dotnet publish -c Release -o ./publish --no-self-contained

# Warning: Failed to determine the https port for redirect
HTTP-only (port 5125) and haven't configured HTTPS (this is just a warning, not an error)