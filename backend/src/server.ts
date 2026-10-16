import { app } from "./lib/app.js";
import { env } from "./lib/env.js";

// El puerto proviene de la configuracion validada y usa 3000 como valor predeterminado.
app.listen(env.port, () => {
  console.log(`Backend escuahdno en el puerto http://localhost:${env.port}/health (${env.nodeEnv})`);
});
