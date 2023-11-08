import { Router } from "express";
import { checkApplication, checkApplications } from "../bot/checkApplications";
import { getApiClients } from "../services/filplusService";
import { getApplication } from "../services/backendService";
import { logError } from "../utils/consoleLogger";

const router = Router();

/**
 * Checks all applications for the need of a new datacap allocation.
 *
 * @returns Promise<void>
 */
router.post("/all", async (req, res) => {
  try {
    await checkApplications();
    return res
      .status(200)
      .send("All applications check completed successfully");
  } catch (error) {
    logError(`Error checking applications: ${error.message}`);
    return res
      .status(500)
      .send(`Error checking applications: ${error.message}`);
  }
});

/**
 * Check if an application needs a new datacap allocation.
 *
 * @param {string} id - The application id.
 * @returns Promise<void>
 */
router.post("/:id", async (req, res) => {
  const appId = req.params.id;

  try {
    const { data: apiClients, error, success } = await getApiClients();
    if (!success) {
      logError(`Get Api Clients Error: ${error}`);
      throw new Error(`Get Api Clients Error: ${error}`);
    }
    const {
      application,
      error: appError,
      success: appSuccess,
    } = await getApplication(appId);
    if (!appSuccess) {
      throw new Error(`Get Application Error: ${appError}`);
    }

    if (application == null) {
      throw new Error(`Application ${appId} not found`);
    }

    await checkApplication(application, apiClients);
    return res
      .status(200)
      .send(`Application ${appId} check completed successfully`);
  } catch (error) {
    logError(`Error processing application ${appId}: ${error.message}`);
    return res
      .status(500)
      .send(`Error processing application ${appId}: ${error.message}`);
  }
});

export default router;
