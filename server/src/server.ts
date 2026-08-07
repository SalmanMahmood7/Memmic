import { app } from "./app";
import { settings } from "./config";
import { logger } from "./logger";

app.listen(settings.PORT, () => {
  logger.info(`MEMMIC Backend (Node) listening on port ${settings.PORT}`);
});
