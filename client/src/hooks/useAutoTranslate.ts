/**
 * useAutoTranslate
 * Translates an array of Spanish texts to English using the server-side LLM.
 * Results are cached in a module-level Map so repeated calls are instant.
 */
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { Lang } from "@/lib/i18n";

// Module-level cache: key = original Spanish text, value = English translation
const translationCache = new Map<string, string>();

// Pending queue to batch requests
let pendingTexts: string[] = [];
let pendingCallbacks: Map<string, Array<(t: string) => void>> = new Map();
let batchTimer: ReturnType<typeof setTimeout> | null = null;

type TranslateResult = {
  /** Returns the translated text if available, otherwise the original */
  tx: (original: string) => string;
  /** True while a translation request is in flight */
  isTranslating: boolean;
};

/**
 * Hook that provides a `tx(text)` function.
 * When lang === "ES", tx() returns the original text unchanged.
 * When lang === "EN", tx() returns the cached translation or the original while loading.
 *
 * @param texts - array of texts that will be pre-fetched for translation
 * @param lang  - current language
 */
export function useAutoTranslate(texts: string[], lang: Lang): TranslateResult {
  const [, forceUpdate] = useState(0);
  const mutateRef = useRef<((input: { texts: string[]; targetLang: "EN" }) => Promise<{ translations: string[] }>) | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const translateMutation = trpc.translate.texts.useMutation();
  mutateRef.current = translateMutation.mutateAsync;

  useEffect(() => {
    if (lang !== "EN" || texts.length === 0) return;

    // Filter texts that are not yet cached
    const uncached = texts.filter(t => t && !translationCache.has(t));
    if (uncached.length === 0) return;

    setIsTranslating(true);

    // Add to pending and schedule batch
    uncached.forEach(text => {
      if (!pendingTexts.includes(text)) {
        pendingTexts.push(text);
      }
    });

    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = setTimeout(async () => {
      const batch = [...pendingTexts];
      pendingTexts = [];
      batchTimer = null;

      if (!mutateRef.current || batch.length === 0) return;

      try {
        // Split into chunks of 30 to avoid token limits
        const chunks: string[][] = [];
        for (let i = 0; i < batch.length; i += 30) {
          chunks.push(batch.slice(i, i + 30));
        }

        for (const chunk of chunks) {
          const result = await mutateRef.current({ texts: chunk, targetLang: "EN" });
          chunk.forEach((original, idx) => {
            if (result.translations[idx]) {
              translationCache.set(original, result.translations[idx]);
            }
          });
        }
      } catch (err) {
        console.warn("[useAutoTranslate] Translation failed, using originals", err);
      } finally {
        setIsTranslating(false);
        forceUpdate(n => n + 1);
      }
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, texts.join("|")]);

  const tx = (original: string): string => {
    if (lang !== "EN" || !original) return original;
    return translationCache.get(original) ?? original;
  };

  return { tx, isTranslating };
}

/** Clear the translation cache (useful for testing) */
export function clearTranslationCache() {
  translationCache.clear();
}
