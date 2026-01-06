"use client";

import { useState, useEffect, useCallback } from 'react';
import { VantageData, CalendarEvent, Category } from '@/lib/types';
import { useUser } from "@stackframe/stack";
import { CategoryService } from '@/service/category-service';
import { EventService } from '@/service/event-service';

export function useVantage() {
  const user = useUser(); // Holen des aktuellen Users
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState<VantageData>({
    year: 2026,
    categories: [],
    events: []
  });

  // --- DATEN LADEN ---
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Parallel abrufen für Performance
      const [cats, evts] = await Promise.all([
        CategoryService.getAll(user),
        EventService.getAll(user)
      ]);

      setData(prev => ({
        ...prev,
        categories: cats,
        events: evts
      }));
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initiale Ladung
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // --- ACTIONS (Async Wrapper) ---

  const addEvent = async (title: string, startDate: Date, endDate: Date, categoryId: string) => {
    if (!user) return;

    // Optimistic Update (Sofort anzeigen, im Hintergrund speichern)
    const tempId = Math.random().toString();
    const newEvent: CalendarEvent = {
      id: tempId, title, startDate, endDate, categoryId
    };

    setData(prev => ({ ...prev, events: [...prev.events, newEvent] }));

    try {
      await EventService.create(user, newEvent);
      // Nach erfolgreichem Speichern könnte man neu laden, um die echte ID zu bekommen
      fetchData();
    } catch (e) {
      console.error(e);
      // Rollback bei Fehler (optional)
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;
    // UI Update
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
    }));

    // DB Update
    await EventService.update(user, id, updates);
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    // UI Update
    setData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));

    // DB Update
    await EventService.delete(user, id);
  };

  const addCategory = async (name: string, color: string) => {
    if (!user) return;
    // UI Update
    const tempCat = { id: Math.random().toString(), name, color };
    setData(prev => ({ ...prev, categories: [...prev.categories, tempCat] }));

    try {
      await CategoryService.create(user, name, color);
      fetchData(); // Reload für echte ID
    } catch (e) { console.error(e); }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      // Events dieser Kategorie auch im UI entfernen
      events: prev.events.filter(e => e.categoryId !== id)
    }));

    await CategoryService.delete(user, id);
  };

  return {
    data,
    isLoading, // Kannst du nutzen um Spinner anzuzeigen
    addEvent,
    updateEvent,
    deleteEvent,
    addCategory,
    deleteCategory,
    refresh: fetchData
  };
}