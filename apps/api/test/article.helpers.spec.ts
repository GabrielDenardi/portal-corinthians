import { describe, expect, it } from "vitest";

import { createArticleSlug, inferCategory } from "../src/modules/articles/article.helpers";

describe("article helpers", () => {
  it("creates a normalized article slug", () => {
    expect(createArticleSlug("Corinthians chega ao dérbi com pressão pós-perda")).toBe(
      "corinthians-chega-ao-derbi-com-pressao-pos-perda",
    );
  });

  it("infers category from article text", () => {
    expect(inferCategory("Diretoria monitora janela", "Mercado e reforço para a zaga")).toBe("mercado");
    expect(inferCategory("Corinthians Feminino mantém posse", "Brabas aceleram ritmo")).toBe("feminino");
  });
});
