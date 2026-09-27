"use client";

// 收藏功能：LocalStorage 实现（暂不接数据库）
// TODO(backend): 接入用户系统后，将收藏同步到服务端

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "worldflavors:favorites";
// 品牌更名（WorldCuisine → WorldFlavors）前的旧 key：首次读取时自动迁移，避免用户收藏丢失
const LEGACY_STORAGE_KEY = "worldcuisine:favorites";

function readFavorites(): string[] {
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        // 迁移旧数据到新 key 并清除旧 key
        window.localStorage.setItem(STORAGE_KEY, legacy);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        raw = legacy;
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return []; // 数据损坏时静默重置
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  // loaded 标记：避免服务端渲染与首次客户端渲染不一致导致的水合问题
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    setLoaded(true);
  }, []);

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 隐私模式等场景写入失败时忽略
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  return { favorites, loaded, toggle, isFavorite };
}
