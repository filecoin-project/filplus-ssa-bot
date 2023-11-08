#!/usr/bin/env node

import { Command } from "commander";
import { config } from "./config";
import { checkApplications } from "./bot/checkApplications";

const program = new Command();

program.version("1.0.0").description("SSA Bot CLI");

program
  .command("run-bot")
  .description(`Run the bot checking all applications`)
  .action(async () => {
    try {
      await checkApplications();
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program
  .command("test-env")
  .description(`Check test env ${config.appId}`)
  .action(async () => {
    console.log(
      `If everything is ok, you should see the following health check issue: ${config.healthCheckIssue}`,
    );
  });

program.parse(process.argv);
