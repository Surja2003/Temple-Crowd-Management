"use client";

import { usePathname } from "next/navigation";
import en from "@/../public/locales/en/common.json";
import hi from "@/../public/locales/hi/common.json";
import gu from "@/../public/locales/gu/common.json";


type Dict = typeof en & { admin: typeof import('@/../public/locales/en/admin.json') };
const admin = require('@/../public/locales/en/admin.json');
const adminHi = require('@/../public/locales/hi/admin.json');
const adminGu = require('@/../public/locales/gu/admin.json');

const MAP: Record<string, Dict> = {
  en: { ...en, admin },
  hi: { ...hi, admin: adminHi },
  gu: { ...gu, admin: adminGu },
};

function detectLocaleFromPathname(pathname: string | null): "en" | "hi" | "gu" {
  if (!pathname) return "en";
  
  // Check if pathname starts with a locale
  const match = pathname.match(/^\/(en|hi|gu)(?:\/|$)/);
  if (match && match[1] in MAP) {
    return match[1] as "en" | "hi" | "gu";
  }
  
  return "en";
}

export function useI18n() {
  const pathname = usePathname();
  const locale = detectLocaleFromPathname(pathname);
  const dict = MAP[locale] || MAP.en;

  const t = (ns: keyof Dict | 'admin', key: string): string => {
    const section = dict[ns as keyof Dict] as Record<string, string> | undefined;
    return section?.[key] ?? key;
  };

  return { t, locale };
}
