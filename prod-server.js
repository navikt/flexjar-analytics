import { createServer } from "node:http";
import { toNodeListener } from "h3/node";
import handler from "./dist/server/server.js";

const port = process.env.PORT || 3000;

const listener = toNodeListener(handler);
const server = createServer(listener);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
