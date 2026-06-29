# Base image
FROM node:18-alpine AS base

# Step 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Step 2: Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 🚀 DUMMY VARIABLES: Prevents Next.js 15 from crashing during the build phase
ENV NEXT_TELEMETRY_DISABLED=1
ENV MONGODB_URI="mongodb+srv://dummy:dummy@cluster0.mongodb.net/dummy"
ENV JWT_SECRET="dummy_secret_for_build"
ENV TOKEN_SECRET = "dummy_secret_for_build"
# Add any other variables here if your build complains about them missing

RUN npm run build

# Step 3: Production environment
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Don't run the container as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the optimized standalone build from Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]