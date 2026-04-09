"use client";

import { useEffect } from "react";

interface ArticleViewTrackerProps {
  slug: string;
}

const CLIENT_KEY_STORAGE = "portal-corinthians:client-key";
const VIEW_STORAGE_PREFIX = "portal-corinthians:view:";
const VIEW_WINDOW_MS = 1000 * 60 * 60 * 6;

export function ArticleViewTracker({ slug }: ArticleViewTrackerProps) {
  useEffect(() => {
    const storageKey = `${VIEW_STORAGE_PREFIX}${slug}`;
    const lastView = window.localStorage.getItem(storageKey);

    if (lastView && Date.now() - Number(lastView) < VIEW_WINDOW_MS) {
      return;
    }

    const clientKey = getClientKey();

    void fetch(`/api/article-views/${slug}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ clientKey }),
    }).finally(() => {
      window.localStorage.setItem(storageKey, String(Date.now()));
    });
  }, [slug]);

  return null;
}

function getClientKey() {
  const existing = window.localStorage.getItem(CLIENT_KEY_STORAGE);

  if (existing) {
    return existing;
  }

  const nextValue = crypto.randomUUID();
  window.localStorage.setItem(CLIENT_KEY_STORAGE, nextValue);
  return nextValue;
}
