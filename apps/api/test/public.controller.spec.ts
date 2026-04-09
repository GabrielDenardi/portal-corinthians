import "reflect-metadata";

import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PublicController } from "../src/modules/public/public.controller";
import { PublicService } from "../src/modules/public/public.service";

describe("PublicController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [
        {
          provide: PublicService,
          useValue: {
            getHome: async () => ({ featured: null, highlights: [], latest: [], mostRead: [], spotlight: [], categories: [], upcomingMatch: null, updatedAt: new Date().toISOString() }),
            getArticle: async (slug: string) => ({ slug, title: "Teste", dek: "Resumo", summary: "Resumo", category: { slug: "profissional", label: "Profissional", description: "..." }, sourceName: "Fonte", sourceUrl: "https://example.com", publishedAt: new Date().toISOString(), readTime: "3 min", viewCount: 1, body: ["Linha 1"], related: [] }),
            getCategoryArticles: async (slug: string) => ({ category: { slug, label: "Profissional", description: "..." }, items: [], page: 1, limit: 12, total: 0, totalPages: 1 }),
            getMatches: async () => [],
            incrementArticleView: async () => ({ viewCount: 2 }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns home feed", async () => {
    const response = await request(app.getHttpServer()).get("/public/home");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("updatedAt");
  });

  it("increments article views", async () => {
    const response = await request(app.getHttpServer())
      .post("/public/articles/teste/view")
      .send({ clientKey: "client-key-123" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ viewCount: 2 });
  });
});
