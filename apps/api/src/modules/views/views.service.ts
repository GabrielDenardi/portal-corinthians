import type { IncrementArticleViewDTO } from "@portal-corinthians/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

const VIEW_WINDOW_HOURS = 6;

@Injectable()
export class ViewsService {
  constructor(private readonly prisma: PrismaService) {}

  async incrementArticleView(slug: string, clientKey = "anonymous"): Promise<IncrementArticleViewDTO> {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const windowBucket = computeViewWindowBucket();

    try {
      const [, updated] = await this.prisma.$transaction([
        this.prisma.articleView.create({
          data: {
            articleId: article.id,
            clientKey,
            windowBucket,
          },
        }),
        this.prisma.article.update({
          where: { id: article.id },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        }),
      ]);

      return { viewCount: updated.viewCount };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const unchanged = await this.prisma.article.findUniqueOrThrow({
          where: { id: article.id },
          select: { viewCount: true },
        });

        return { viewCount: unchanged.viewCount };
      }

      throw error;
    }
  }
}

export function computeViewWindowBucket(referenceDate = new Date()) {
  const bucket = Math.floor(referenceDate.getUTCHours() / VIEW_WINDOW_HOURS);
  return `${referenceDate.toISOString().slice(0, 10)}:${bucket}`;
}
