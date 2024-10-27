FROM node:20.10.0
WORKDIR /app

# Install required packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    make \
    g++ \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install corepack and yarn
RUN npm install --global corepack && \
    corepack enable && \
    corepack prepare yarn@4.0.2 --activate

# Copy package.json and yarn.lock first to leverage caching
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the Prisma schema and the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn build

# Expose the port
EXPOSE 3000

# Start the application without running migrations automatically
CMD ["sh", "-c", "yarn start:prod"]