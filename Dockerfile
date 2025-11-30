###
# Multi-stage Dockerfile for Church Prompt Directory (Astro + Node adapter)
# - Builder: installs deps, builds Astro site
# - Runner: installs production deps, copies `dist` and runs the app
###

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies & build (single install for speed)
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Build-time environment variables (required for getStaticPaths in Astro)
ARG PUBLIC_CONVEX_URL
ARG CONVEX_URL
ARG PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG PUBLIC_SITE_URL

ENV PUBLIC_CONVEX_URL=$PUBLIC_CONVEX_URL
ENV CONVEX_URL=$CONVEX_URL
ENV PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy runtime artifacts & node_modules from builder, prune dev deps
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
RUN npm prune --production

# Non-root user for security (node user exists in official image)
USER node

EXPOSE 3000
# Directly run Astro's generated entrypoint (set by @astrojs/node adapter)
CMD ["node", "dist/server/entry.mjs"]
