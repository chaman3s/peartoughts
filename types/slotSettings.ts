export type SlotTimeType = "24" | "office" | "morning" | "evening" | "custom";

export type SlotTimeRange = {
  id: number;
  startTime: string;
  endTime: string;
};

export type SlotCustomGroup = {
  id: number;
  days: string[];
  slots: SlotTimeRange[];
};

export type PersistedSlotSettings = {
  days: string[];
  timeType: SlotTimeType;
  customSlots: SlotCustomGroup[];
  note: string;
  slotDuration: number;
  slotPrice: number;
  updatedAt?: string;
};
