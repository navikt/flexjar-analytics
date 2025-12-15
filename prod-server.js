import { createServer } from "node:http";
// @ts-expect-error - fromNodeMiddleware is deprecated but works for sirv, while defineNodeHandler fails
import { H3, eventHandler, fromNodeMiddleware } from "h3";
import { toNodeHandler } from "h3/node";
import sirv from "sirv";
import handler from "./dist/server/server.js";

const port = process.env.PORT || 3000;

const app = new H3();

// Serve static assets from dist/client
const staticHandler = sirv("dist/client", {
  single: false,
  dev: false,
});

app.use(fromNodeMiddleware(staticHandler));

// SSR handler
app.use(
  eventHandler((event) => {
    return handler.fetch(event.req);
  }),
);

const listener = toNodeHandler(app);
const server = createServer(listener);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
