import cron from "node-cron";
import { checkApplications } from "./bot/checkApplications";

// Schedule check applications every 1 hour
cron.schedule("0 * * * *", async () => {
  console.log("CRON: Running check applications");
  await checkApplications();
  console.log("CRON: Finished check applications");
});
