# Replit-clone

Run "npm install" in the master directory to install all the dependencies.

A MongoDB is required to store the users info.

Also a directory named "users" must be created at the current directory. In this directory
a sub-directory is created for each user where projects will be stored. The sub-directories
are created upon successfull sign-up.

To connect to the database create an enviroment file(.env) and assing the url of your database to
a variable called DB_URL.

To start the server run "npm start" or you can run "npm run devstart" to start the server with nodemon
so if any change occus in the source no server restarting is neccessary.