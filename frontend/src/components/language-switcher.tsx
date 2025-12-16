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

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const localeRegex = useMemo(() => /^\/(en|hi|gu)(?=\/|$)/, []);

  const handleLanguageChange = (newLocale: string) => {
    if (!pathname) return;
    const withoutLocale = pathname.replace(localeRegex, "");
    const newPath = `/${newLocale}${withoutLocale || "/"}`;
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
          <SelectValue>{currentLanguage?.nativeName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
