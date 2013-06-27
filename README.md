trellme
=======

### TrellMe Reporting Tool for Trello Boards

### Installation

    > make init
    > make build

### Running the back-end

[1] Please start "mongod" before you start this app. 

[2] Please create the trellme database if you haven't done so - one time only.

     $ mongo
     mongo> use node-mongo-loginskel

  MongoDB reference:  http://docs.mongodb.org/manual/tutorial/getting-started/

[3] Then please run this command from your trellme directory:

    > node ./lib/app.js

### Running the front-end

Currently "Signup" is not put in the front-end html yet. If you haven't done so, please sign up and create a user.

[1] Please start the back-end.

[2] If you haven't signed up: open your browser and access this url http://localhost:3000/app/signup and create a user. Please be sure to enter a correct Trello username.

[3] Open a Finder (Mac) and go to the trellme directory. Double click on the frontend/trellme.html. 

[4] Login and then click "Auth Trello" button to authorize this app to access your Trello account. You can authorize as many times as you like but usually once is enough - access key will be stored in the database.

[5] Click "Get My Boards" to see your board info.


End

