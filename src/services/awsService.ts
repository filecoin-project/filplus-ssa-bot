import * as AWS from "aws-sdk";
import { config } from "../config";
import { logGeneral, logError } from "../utils/consoleLogger";
import type { MetricsData } from "types";

AWS.config.update({
  accessKeyId: config.awsAccessKeyId,
  secretAccessKey: config.awsSecretAccessKey,
  region: "us-east-1",
});

const cloudwatch = new AWS.CloudWatch();

class Metrics {
  private static instance: Metrics;
  private data: MetricsData;

  private constructor() {
    this.data = {};
  }

  public static getInstance(): Metrics {
    if (Metrics.instance === undefined) {
      Metrics.instance = new Metrics();
    }
    return Metrics.instance;
  }

  public updateMetric(key: string, value: string | number): void {
    this.data[key] = value;
  }

  public incrementMetric(key: string): void {
    if (this.data[key] !== undefined) {
      this.data[key]++;
    } else {
      this.data[key] = 1;
    }
  }

  public async sendMetrics(): Promise<void> {
    const metricData = Object.keys(this.data).map((key) => {
      return {
        MetricName: key,
        Value: this.data[key],
      };
    });

    const params = {
      MetricData: metricData,
      Namespace: "filecoin/ssa-bot",
    };

    try {
      await cloudwatch.putMetricData(params).promise();
      logGeneral("Metrics sent to AWS:");
    } catch (err) {
      logError("Error sending metrics to AWS:");
      logError(err);
    }
  }
}

export default Metrics;
