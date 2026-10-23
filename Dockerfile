FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.json ./
COPY src ./src
RUN npm ci --no-audit --no-fund --ignore-scripts && npm run build

FROM node:22-alpine
LABEL io.modelcontextprotocol.server.name="io.github.AxelVerneBooks/marketing-scope-mcp"
WORKDIR /app
ENV NODE_ENV=production
# HTTP port; hosts such as Smithery override PORT at runtime.
ENV PORT=3002
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY server.json ./
RUN npm ci --omit=dev --no-audit --no-fund --ignore-scripts && mkdir -p /app/data
VOLUME ["/app/data"]
EXPOSE 3002
ENTRYPOINT ["node", "dist/index.js"]
# No --port flag, so the server listens on $PORT. Pass no args for stdio:
#   docker run -i --rm --entrypoint node marketing-scope-mcp dist/index.js
CMD ["--http"]
