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
  files: Record<string, File>; // Store original files for upload after payment
  eventDate: string; // ISO date
  locationName: string;
  lat: number;
  lng: number;
  isPaid: boolean;
}

interface GiftContextType {
  giftData: GiftData;
  updateGiftData: (data: Partial<GiftData>) => void;
  addStory: (story: Omit<Memory, "id">, file?: File) => void;
  removeStory: (id: string) => void;
  addJourneyItem: (item: Omit<Memory, "id">, file?: File) => void;
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
  files: {},
  eventDate: new Date().toISOString(),
  locationName: "",
  lat: -23.5505, // Default SP (São Paulo)
  lng: -46.6333,
  isPaid: false,
};

const GiftContext = createContext<GiftContextType | undefined>(undefined);

export function GiftProvider({ children }: { children: React.ReactNode }) {
  const [giftData, setGiftData] = useState<GiftData>(DEFAULT_GIFT);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("eternal-gift-draft-v4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear files on reload since they don't persist in localStorage
        setGiftData({ ...parsed, ...DEFAULT_GIFT, ...parsed, files: {} });
      } catch (e) {
        console.error("Failed to parse saved gift", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Don't save files object to localStorage (it would be empty/useless anyway)
      const { files, ...serializableData } = giftData;
      localStorage.setItem("eternal-gift-draft-v4", JSON.stringify(serializableData));
    }
  }, [giftData, isLoaded]);

  const updateGiftData = (data: Partial<GiftData>) => {
    setGiftData((prev) => ({ ...prev, ...data }));
  };

  const addStory = (story: Omit<Memory, "id">, file?: File) => {
    const id = `story-${Math.random().toString(36).substr(2, 9)}`;
    const newStory = { ...story, id };
    setGiftData((prev) => ({
      ...prev,
      stories: [...prev.stories, newStory],
      files: file ? { ...prev.files, [id]: file } : prev.files,
    }));
  };

  const removeStory = (id: string) => {
    setGiftData((prev) => {
      const { [id]: _, ...remainingFiles } = prev.files;
      return {
        ...prev,
        stories: prev.stories.filter((s) => s.id !== id),
        files: remainingFiles,
      };
    });
  };

  const addJourneyItem = (item: Omit<Memory, "id">, file?: File) => {
    const id = `journey-${Math.random().toString(36).substr(2, 9)}`;
    const newItem = { ...item, id };
    setGiftData((prev) => ({
      ...prev,
      journey: [...prev.journey, newItem],
      files: file ? { ...prev.files, [id]: file } : prev.files,
    }));
  };

  const removeJourneyItem = (id: string) => {
    setGiftData((prev) => {
      const { [id]: _, ...remainingFiles } = prev.files;
      return {
        ...prev,
        journey: prev.journey.filter((j) => j.id !== id),
        files: remainingFiles,
      };
    });
  };

  const resetGift = () => {
    setGiftData(DEFAULT_GIFT);
    localStorage.removeItem("eternal-gift-draft-v4");
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
