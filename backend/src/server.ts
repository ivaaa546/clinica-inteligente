import { app } from "./lib/app.js";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { VideoRevocationProcessor } from "./modules/video-calls/video-revocation.processor.js";
import { VideoWindowCloser } from "./modules/video-calls/video-window-closer.js";

const videoWindowCloser = new VideoWindowCloser(prisma, new VideoRevocationProcessor(prisma));
const videoWindowIntervalMs = 60_000;
setInterval(() => {
  void videoWindowCloser.run().catch((error: unknown) => {
    console.error("No se pudo procesar el cierre de videollamadas", error);
  });
}, videoWindowIntervalMs).unref();

// El puerto proviene de la configuracion validada y usa 3000 como valor predeterminado.
app.listen(env.port, () => {
  console.log(`Backend escuahdno en el puerto http://localhost:${env.port}/health (${env.nodeEnv})`);
});
