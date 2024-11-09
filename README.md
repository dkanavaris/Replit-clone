# Replit-clone

This is a Replit-Clone project. Users can login by using their credentials. Then they can create a new project or
continue working on a older one. Users can share their project's URL with other users so that they can collaborate 
ont the project. When working on the same project file users can view the changes other users make in real time.
The code is also highlighted. For the compilation and exectuion of the project a terminal is also provided which users
have limited authorization (e.g cannot exetucte sudo command etc.).

## Setup
Run "npm install" in the master directory to install all the dependencies.

A MongoDB is required to store the users info.
In order to connect to your database create an enviroment file(.env) and assign the url of your database to
a variable called DB_URL.

Also a directory named "users" must be created at the current directory. In this directory
a sub-directory is created for each user where projects will be stored. The sub-directories
are created upon successfull sign-up.


## Docker

You can run the application within a docker container
To do that run

```bash
docker-compose up -d
```

And wait for the build and deployment to finish

If you widh to only build run
```bash
docker-compose build
```

## Execution
To start the server run "npm start" then connect to http://localhost:3000

Icons used are from : https://tabler-icons.io/

![alt_text](https://github.com/dkanavaris/Replit-clone/blob/main/login.PNG)
![alt_text](https://github.com/dkanavaris/Replit-clone/blob/main/project.PNG)
