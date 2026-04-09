import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "../app.module";
import { MatchesService } from "../modules/matches/matches.service";

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

  try {
    const matchesService = app.get(MatchesService);
    const matchesProcessed = await matchesService.syncSchedule();
    console.log(`Match sync completed with ${matchesProcessed} records.`);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
