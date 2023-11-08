import express from "express";
import applicationRouter from "./server/routes";
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
  console.log("Healthcheck");
  return res.status(200).send("OK");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
