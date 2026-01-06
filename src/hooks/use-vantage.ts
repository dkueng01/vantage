// hooks/use-vantage.ts
"use client";

import { useState } from 'react';
import { VantageData, CalendarEvent, Category } from '@/lib/types';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Urlaub 🌴', color: 'bg-teal-400' },
  { id: 'c2', name: 'Uni / Studium 🎓', color: 'bg-indigo-500' },
  { id: 'c3', name: 'Sport ⚽', color: 'bg-orange-500' },
  { id: 'c4', name: 'Arbeit 💼', color: 'bg-slate-600' },
  { id: 'c5', name: 'Feiern 🎉', color: 'bg-pink-500' },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Trip nach Madrid',
    startDate: new Date(2026, 1, 5),
    endDate: new Date(2026, 1, 8),
    categoryId: 'c1' // Urlaub
  },
  {
    id: 'e2',
    title: 'Klausurenphase',
    startDate: new Date(2026, 0, 20),
    endDate: new Date(2026, 1, 2),
    categoryId: 'c2' // Uni
  }
];

export function useVantage() {
  const [data, setData] = useState<VantageData>({
    year: 2026,
    categories: INITIAL_CATEGORIES,
    events: INITIAL_EVENTS
  });

  // --- EVENTS ---

  const addEvent = (title: string, startDate: Date, endDate: Date, categoryId: string) => {
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      startDate: startOfDay(startDate),
      endDate: endOfDay(endDate),
      categoryId
    };
    setData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteEvent = (id: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  // --- KATEGORIEN ---

  const addCategory = (name: string, color: string) => {
    const newCat: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      color
    };
    setData(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
  };

  const deleteCategory = (id: string) => {
    // Optional: Events dieser Kategorie auch löschen oder auf 'Standard' setzen
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      events: prev.events.filter(e => e.categoryId !== id) // Events mitlöschen (einfachste Lösung)
    }));
  };

  return {
    data,
    addEvent,
    updateEvent,
    deleteEvent,
    addCategory,
    deleteCategory
  };
}