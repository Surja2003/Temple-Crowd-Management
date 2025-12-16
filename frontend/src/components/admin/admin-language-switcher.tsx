"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export default function AdminLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const localeRegex = useMemo(() => /^\/(en|hi|gu)(?=\/|$)/, []);

  const handleLanguageChange = (newLocale: string) => {
    if (!pathname) return;
    // Always replace the locale at the root of the URL
    const withoutLocale = pathname.replace(localeRegex, "");
    // If the path does not start with /admin, ensure it does
    let adminPath = withoutLocale.startsWith('/admin') ? withoutLocale : `/admin${withoutLocale}`;
    // Remove any duplicate slashes
    adminPath = adminPath.replace(/\/+/g, '/');
    const newPath = `/${newLocale}${adminPath}`;
    const withSearch = typeof window !== 'undefined' && window.location.search ? `${newPath}${window.location.search}` : newPath;
    if (withSearch !== (pathname + (typeof window !== 'undefined' ? window.location.search : ''))) {
      router.push(withSearch);
    }
  };

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  ];

  const currentLocale = useMemo(() => {
    const m = pathname?.match(localeRegex);
    return (m?.[1] as "en" | "hi" | "gu") || "en";
  }, [pathname, localeRegex]);
  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={currentLocale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto border-none shadow-none p-0 h-auto">
          <SelectValue>{currentLanguage?.nativeName || currentLanguage?.name}</SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.nativeName} <span className="ml-2 text-xs text-muted-foreground">({lang.name})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
