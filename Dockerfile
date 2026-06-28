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
# We disable telemetry to speed up the build
ENV NEXT_TELEMETRY_DISABLED 1


ENV NEXTAUTH_SECRET="nextauthsecret123"
ENV EMAIL_SERVER_USER= "email@gmai.com"
ENV EMAIL_SERVER_PASSWORD="abcd"
ENV EMAIL_SERVER_HOST="smtp.gmail.com"
ENV EMAIL_SERVER_PORT=587
ENV EMAIL_FROM="from@gmail.com"
ENV CLOUDINARY_CLOUD_NAME = nothing
ENV CLOUDINARY_API_KEY=12345678912340
ENV CLOUDINARY_API_SECRET=sjmiaosndiwniolwqmolw
ENV JWT_SECRET = jidiosjdiosjdiosjijesimcximdiowlejmdiowejmcow
ENV GEMINI_API_KEY = 89u3je903092ks02k02wkkdsoksowjdoowkopsa




ENV MONGODB_URI="mongodb+srv://dummy:dummy@cluster0.mongodb.net/dummy"
RUN npm run build

# Step 3: Production environment
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build from Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Start the server using the standalone server.js
CMD ["node", "server.js"]