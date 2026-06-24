import app from "./app";
import config from "./config";
import prisma from "./shared/prisma";
import { startSendProcessor } from "./shared/services/send-processor";

async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
      return;
    } catch (error) {
      console.error(`Database connection attempt ${i}/${retries} failed`);
      if (i === retries) throw error;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function main() {
  try {
    await connectWithRetry();

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);

      startSendProcessor();
      //   const runSendProcessor =
      //     config.env === "production" ||
      //     process.env.ENABLE_SEND_PROCESSOR === "true";

      // if (runSendProcessor) {
      //   startSendProcessor();
      // } else {
      //   console.log(
      //      "[SendProcessor] Disabled in development (set ENABLE_SEND_PROCESSOR=true to enable)"
      //   );
      // }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
