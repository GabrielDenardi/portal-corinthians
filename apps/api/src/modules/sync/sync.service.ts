import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async runJob(jobName: string, runner: () => Promise<number>) {
    const syncRun = await this.prisma.syncRun.create({
      data: {
        jobName,
        status: "running",
      },
    });

    try {
      const recordsProcessed = await runner();

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: "succeeded",
          recordsProcessed,
          finishedAt: new Date(),
        },
      });

      return recordsProcessed;
    } catch (error) {
      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: "failed",
          message: error instanceof Error ? error.message : "Unknown sync error",
          finishedAt: new Date(),
        },
      });

      throw error;
    }
  }
}
