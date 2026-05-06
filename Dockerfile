# syntax=docker/dockerfile:1.7

FROM node:22.12.0-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN npm install -g pnpm@10.11.0

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm config set store-dir /pnpm/store
RUN pnpm install --frozen-lockfile

FROM deps AS dev
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]

FROM deps AS build
ARG VITE_BASE_API_URL
ARG VITE_PRIVATE_API_KEY
ENV VITE_BASE_API_URL=$VITE_BASE_API_URL
ENV VITE_PRIVATE_API_KEY=$VITE_PRIVATE_API_KEY
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS prod
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]