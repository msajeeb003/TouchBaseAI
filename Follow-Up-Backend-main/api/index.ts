// Vercel serverless entry point.
// Exports the Express app as the default handler; vercel.json rewrites all
// incoming requests to this function so Express handles routing internally.
import app from "../src/app";

export default app;
