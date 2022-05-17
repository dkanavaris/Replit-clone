# Replit-clone

This is a Replit-Clone project. Users can login by using their credentials. Then they can create a new project or
continue working on a older one. Users can share their project's URL with other users so that they can collaborate 
ont the project. When working on the same project file users can view the changes other users make in real time.
The code is also highlighted. For the compilation and exectuion of the project a terminal is also provided which users
have limited authorization (e.g cannot exetucte sudo command etc.).

## Setup
Run "npm install" in the master directory to install all the dependencies.

A MongoDB is required to store the users info.

Also a directory named "users" must be created at the current directory. In this directory
a sub-directory is created for each user where projects will be stored. The sub-directories
are created upon successfull sign-up.

To connect to the database create an enviroment file(.env) and assing the url of your database to
a variable called DB_URL.

## Execution
To start the server run "npm start" or you can run "npm run devstart" to start the server with nodemon
so if any change occus in the source no server restarting is neccessary.

Icons used are from : https://tabler-icons.io/
