FROM node:lts-buster

# Install necessary dependencies
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libxcomposite1 \
  libxrandr2 \
  libxdamage1 \
  libpango1.0-0 \
  libasound2 \
  libxtst6 \
  libxshmfence1 \
  libnss3-dev \
  libgbm-dev && \
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
