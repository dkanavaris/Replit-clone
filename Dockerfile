FROM node:18.20.4-alpine3.20

# Set the working directory
WORKDIR /opt/app

# Install Python 3 and build tools
RUN apk add --no-cache python3 make g++ 

# Optional: Create a symlink for Python if needed
RUN ln -sf python3 /usr/bin/python

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Remove build dependencies to reduce image size (optional)
# Uncomment the following line if you want to remove build tools after installation
# RUN apk del python3 make g++



# Copy the rest of your application code
COPY . .

RUN touch /opt/app/users

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
