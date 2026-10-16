import { app } from "./lib/app.js";
import { env } from "./lib/env.js";

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Backend escuahdno en el puerto http://localhost:${port}/health (${env.nodeEnv})`);
});
