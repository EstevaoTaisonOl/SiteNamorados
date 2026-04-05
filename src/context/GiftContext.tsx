"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Memory {
  id: string;
  imageUrl: string;
  message: string;
}

interface GiftData {
  recipientName: string;
  senderName: string;
  introMessage: string;
  theme: string;
  musicId: string;
  musicPreviewUrl: string;
  stories: Memory[];
  journey: Memory[];
  isPaid: boolean;
}

interface GiftContextType {
  giftData: GiftData;
  updateGiftData: (data: Partial<GiftData>) => void;
  addStory: (story: Omit<Memory, "id">) => void;
  removeStory: (id: string) => void;
  addJourneyItem: (item: Omit<Memory, "id">) => void;
  removeJourneyItem: (id: string) => void;
  resetGift: () => void;
}

const DEFAULT_GIFT: GiftData = {
  recipientName: "",
  senderName: "",
  introMessage: "uma pequena jornada dedicada a você.",
  theme: "nostalgia",
  musicId: "track1",
  musicPreviewUrl: "",
  stories: [],
  journey: [],
  isPaid: false,
};

const GiftContext = createContext<GiftContextType | undefined>(undefined);

export function GiftProvider({ children }: { children: React.ReactNode }) {
  const [giftData, setGiftData] = useState<GiftData>(DEFAULT_GIFT);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("eternal-gift-draft-v3");
    if (saved) {
      try {
        setGiftData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved gift", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("eternal-gift-draft-v3", JSON.stringify(giftData));
    }
  }, [giftData, isLoaded]);

  const updateGiftData = (data: Partial<GiftData>) => {
    setGiftData((prev) => ({ ...prev, ...data }));
  };

  const addStory = (story: Omit<Memory, "id">) => {
    const newStory = { ...story, id: `story-${Math.random().toString(36).substr(2, 9)}` };
    setGiftData((prev) => ({
      ...prev,
      stories: [...prev.stories, newStory],
    }));
  };

  const removeStory = (id: string) => {
    setGiftData((prev) => ({
      ...prev,
      stories: prev.stories.filter((s) => s.id !== id),
    }));
  };

  const addJourneyItem = (item: Omit<Memory, "id">) => {
    const newItem = { ...item, id: `journey-${Math.random().toString(36).substr(2, 9)}` };
    setGiftData((prev) => ({
      ...prev,
      journey: [...prev.journey, newItem],
    }));
  };

  const removeJourneyItem = (id: string) => {
    setGiftData((prev) => ({
      ...prev,
      journey: prev.journey.filter((j) => j.id !== id),
    }));
  };

  const resetGift = () => {
    setGiftData(DEFAULT_GIFT);
    localStorage.removeItem("eternal-gift-draft-v3");
  };

  return (
    <GiftContext.Provider value={{ 
      giftData, 
      updateGiftData, 
      addStory, 
      removeStory, 
      addJourneyItem, 
      removeJourneyItem, 
      resetGift 
    }}>
      {children}
    </GiftContext.Provider>
  );
}

export function useGift() {
  const context = useContext(GiftContext);
  if (context === undefined) {
    throw new Error("useGift must be used within a GiftProvider");
  }
  return context;
}
