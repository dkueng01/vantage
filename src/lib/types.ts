// lib/types.ts

export interface Category {
  id: string;
  name: string;
  color: string; // z.B. "bg-red-500" oder Hex
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  categoryId: string; // Referenz zur Kategorie statt fester "Type" string
  description?: string;
}

export interface VantageData {
  year: number;
  categories: Category[];
  events: CalendarEvent[];
}