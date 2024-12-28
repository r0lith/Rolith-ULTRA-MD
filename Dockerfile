FROM node:lts-buster

# Install necessary dependencies
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp \
  libnss3 && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Copy package.json and install dependencies
COPY package.json .

RUN npm install && npm install qrcode-terminal

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 5000

# Command to run your application
CMD ["node", "index.js"]
