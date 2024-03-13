import express from "express";
import applicationRouter from "./server/routes";
// import { getDmobHealth } from "./services/filplusService";
// import { getBackendHealth } from "./services/backendService";
import "./scheduler";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/application", applicationRouter);

/**
 * Healthcheck endpoint
 *
 * @returns Promise<void>
 */
app.get("/health", async (req, res) => {
  // if (!(await getBackendHealth())) {
  //   return res.status(400).send("Backend service is down");
  // }
  // if (!(await getDmobHealth())) {
  //   return res.status(400).send("Dmob service is down");
  // }
  console.log("Checking Health");
  return res.status(200).send("OK");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
