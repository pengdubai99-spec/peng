"use client";

import { createContext, useContext } from "react";
import { Language } from "./i18n";

interface LangContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
}

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  isRtl: false,
});

export const useLang = () => useContext(LangContext);
