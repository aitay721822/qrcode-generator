"use client";

import type { FlatNamespace, KeyPrefix } from "i18next";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type FallbackNs,
  type UseTranslationOptions,
  type UseTranslationResponse,
  useTranslation,
} from "react-i18next";
import { i18next } from "./i18n";

const runsOnServerSide = typeof window === "undefined";

type $Tuple<T> = readonly [T?, ...T[]];

export function useT<
  Ns extends FlatNamespace | $Tuple<FlatNamespace>,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>,
): UseTranslationResponse<FallbackNs<Ns>, KPrefix> {
  const lng = useParams()?.lng;
  if (typeof lng !== "string")
    throw new Error("useT is only available inside /app/[lng]");
  if (runsOnServerSide && i18next.resolvedLanguage !== lng) {
    i18next.changeLanguage(lng);
  } else {
    // biome-ignore lint/correctness/useHookAtTopLevel: it's ok to use hooks conditionally
    const [activeLng, setActiveLng] = useState(i18next.resolvedLanguage);
    // biome-ignore lint/correctness/useHookAtTopLevel: it's ok to use hooks conditionally
    useEffect(() => {
      if (activeLng === i18next.resolvedLanguage) return;
      setActiveLng(i18next.resolvedLanguage);
    }, [activeLng]);
    // biome-ignore lint/correctness/useHookAtTopLevel: it's ok to use hooks conditionally
    useEffect(() => {
      if (!lng || i18next.resolvedLanguage === lng) return;
      i18next.changeLanguage(lng);
    }, [lng]);
  }
  return useTranslation(ns, options);
}
