"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import type { Lang } from "../lib/translations";

const STORAGE_KEY = "aoc_accessibility";

export type ThemeType = "standardDark" | "standardLight" | "protanopia" | "deuteranopia" | "tritanopia";

type State = {
  lang: Lang;
  zoom: number;
  highContrast: boolean;
  themeType: ThemeType;
  voiceGuideActive: boolean;
};

const defaultState: State = {
  lang: "en",
  zoom: 0,
  highContrast: false,
  themeType: "standardDark",
  voiceGuideActive: false,
};

function loadState(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s) as Partial<State>;
      return {
        lang: parsed.lang ?? defaultState.lang,
        zoom: Math.min(3, Math.max(0, Number(parsed.zoom) ?? 0)),
        highContrast: Boolean(parsed.highContrast),
        themeType: parsed.themeType ?? defaultState.themeType,
        voiceGuideActive: Boolean(parsed.voiceGuideActive),
      };
    }
  } catch { }
  return defaultState;
}

function saveState(state: State) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { }
}

type ContextValue = State & {
  setLang: (lang: Lang) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setHighContrast: (on: boolean) => void;
  setThemeType: (type: ThemeType) => void;
  speak: (text: string) => Promise<void>;
  startTour: () => void;
  stopTour: () => void;
  isTourRunning: boolean;
  setVoiceGuideActive: (active: boolean) => void;
};

const AccessibilityContext = createContext<ContextValue | null>(null);

import { useRouter, usePathname } from "next/navigation";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(defaultState);
  const [mounted, setMounted] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = React.useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const lastNavTime = React.useRef(0);

  // useLayoutEffect : applique la langue / thème depuis localStorage avant le premier paint (évite flash EN → FR)
  useLayoutEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveState(state);
    document.documentElement.lang = state.lang === "ar" ? "ar" : state.lang === "fr" ? "fr" : "en";
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.documentElement.style.fontSize = `${100 + state.zoom * 15}%`;
    document.body.classList.toggle("a11y-high-contrast", state.highContrast);

    // Apply theme classes
    document.body.classList.remove("a11y-light-mode", "a11y-protanopia", "a11y-deuteranopia", "a11y-tritanopia");
    if (state.themeType === "standardLight") {
      document.body.classList.add("a11y-light-mode");
    } else if (state.themeType !== "standardDark") {
      document.body.classList.add(`a11y-${state.themeType}`);
    }
  }, [state, mounted]);

  // Speech Recognition logic
  useEffect(() => {
    if (!mounted || !state.voiceGuideActive) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    let isActive = true;
    let recognition: any = null;

    const startListening = () => {
      if (!isActive || !state.voiceGuideActive) return;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      try {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = state.lang === "fr" ? "fr-FR" : "en-US";

        recognition.onresult = (event: any) => {
          if (!isActive) return;
          const transcript = event.results[0][0].transcript.toLowerCase().trim();
          console.log("Voice Command:", transcript);

          const now = Date.now();
          if (now - lastNavTime.current < 2000) return;

          const currentPath = pathnameRef.current;

          if ((transcript.includes("go home") || transcript.includes("accueil")) && currentPath !== "/") {
            lastNavTime.current = now;
            speak(state.lang === "fr" ? "Retour à l'accueil" : "Going home");
            router.push("/");
          } else if ((transcript.includes("go hackathon") || transcript.includes("hackathon")) && currentPath !== "/hackathon") {
            lastNavTime.current = now;
            speak(state.lang === "fr" ? "Vers les hackathons" : "Going to hackathons");
            router.push("/hackathon");
          } else if ((transcript.includes("leaderboard") || transcript.includes("classement")) && !currentPath.includes("classements")) {
            lastNavTime.current = now;
            speak(state.lang === "fr" ? "Vers le classement" : "Going to leaderboard");
            router.push("/classements");
          } else if ((transcript.includes("profile") || transcript.includes("profil")) && currentPath !== "/profile") {
            lastNavTime.current = now;
            speak(state.lang === "fr" ? "Vers votre profil" : "Going to your profile");
            router.push("/profile");
          }
        };

        recognition.onerror = (event: any) => {
          if (!isActive || event.error === "aborted" || event.error === "no-speech") return;
          console.error("Speech recognition error", event.error);
        };

        recognition.onend = () => {
          if (isActive && state.voiceGuideActive) {
            setTimeout(startListening, 300);
          }
        };

        recognition.start();
      } catch (e) {
        console.error("Speech recognition start error", e);
      }
    };

    startListening();
    speak(state.lang === "fr" ? "Guide vocal activé" : "Voice guide activated");

    return () => {
      isActive = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) { }
      }
    };
  }, [state.voiceGuideActive, state.lang, mounted, router]);

  const setLang = (lang: Lang) => setState((s) => ({ ...s, lang }));
  const setZoom = (z: number) => setState((s) => ({ ...s, zoom: Math.min(3, Math.max(0, z)) }));
  const zoomIn = () => setState((s) => ({ ...s, zoom: Math.min(3, s.zoom + 1) }));
  const zoomOut = () => setState((s) => ({ ...s, zoom: Math.max(0, s.zoom - 1) }));
  const setHighContrast = (highContrast: boolean) => setState((s) => ({ ...s, highContrast }));
  const setThemeType = (themeType: ThemeType) => setState((s) => ({ ...s, themeType }));
  const setVoiceGuideActive = (voiceGuideActive: boolean) => setState((s) => ({ ...s, voiceGuideActive }));

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;

      // Attempt to find a higher quality/natural voice
      const voices = window.speechSynthesis.getVoices();
      // Priority: Google English Female > Any Google English > Any English Female > Any English
      const preferredVoice =
        voices.find(v => v.name.includes("Google") && v.lang.startsWith("en") && v.name.includes("Female")) ||
        voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
        voices.find(v => v.name.includes("Natural") && v.lang.startsWith("en")) ||
        voices.find(v => v.lang.startsWith("en") && v.name.includes("Female")) ||
        voices.find(v => v.lang.startsWith("en"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const startTour = async () => {
    if (isTourRunning) return;
    setIsTourRunning(true);
    window.speechSynthesis.cancel();

    try {
      // Step 1: Home
      router.push("/");
      await new Promise(r => setTimeout(r, 800)); // Wait for nav
      await speak("Welcome to Arena of Coders. This is your Home page. Here you can see your upcoming events, recent activity, and quick stats. We will now move to Hackathons.");

      // Step 2: Hackathons
      router.push("/hackathon");
      await new Promise(r => setTimeout(r, 800));
      await speak("This is the Hackathons page. Here you can browse ongoing, upcoming, and past coding competitions to join teams and build amazing projects. Next up, the Ranking.");

      // Step 3: Ranking
      router.push("/classements");
      await new Promise(r => setTimeout(r, 800));
      await speak("Welcome to the Global Ranking. Here you can see how you rank against other elite coders in the arena. Finally, let's head to your Profile.");

      // Step 4: Profile
      router.push("/profile");
      await new Promise(r => setTimeout(r, 800));
      await speak("Last stop, your Profile. You can customize your experience here. The tour is now complete. Feel free to explore!");

    } catch (e) {
      console.error("Tour error", e);
    } finally {
      setIsTourRunning(false);
    }
  };

  const stopTour = () => {
    setIsTourRunning(false);
    window.speechSynthesis.cancel();
  };

  const value: ContextValue = {
    ...state,
    setLang,
    setZoom,
    zoomIn,
    zoomOut,
    setHighContrast,
    setThemeType,
    speak,
    startTour,
    stopTour,
    isTourRunning,
    setVoiceGuideActive,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
