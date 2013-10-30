Trellme
=======

### TrellMe Reporting Tool for Trello Boards

### Setup instructions for the server application:
```bash
$ cd server/
$ make init  # This is going to install the required NodeJS packages.
$ make build # This is going to compile the CoffeeScript app into plain Javascript.
```
---
### Setup instructions for the client application:
```bash
$ cd client/
$ make init  # (Required) This is going to install all NodeJS dependencies
$ make build # (Required) This is going to create the trellme.js dist file.
```
---
### Running and accessing the application:

1. Make sure that you have MongoDB installed and running. 
   MongoDB reference:  http://docs.mongodb.org/manual/tutorial/getting-started/
2. Then please run this command from your Trellme's server directory:

```bash
$ cd server/
$ node ./lib/app.js
```

The application will be running by default under port 300, so access `http://localhost:3000/` from your browser.
