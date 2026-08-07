import { Router } from "express";
import authRouter from "./auth.routes";
import adminRouter from "./admin.routes";
import clientRouter from "./client.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/client", clientRouter);
