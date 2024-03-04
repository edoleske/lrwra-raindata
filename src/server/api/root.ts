import { createTRPCRouter } from "~/server/api/trpc";
import { rainDataRouter } from "./routers/raindata";
import { downloadRouter } from "./routers/download";
import { chartRouter } from "./routers/chart";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	raindata: rainDataRouter,
	chart: chartRouter,
	download: downloadRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
