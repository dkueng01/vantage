"use client";

import { useState, useEffect, useCallback } from 'react';
import { VantageData, CalendarEvent, Category } from '@/lib/types';
import { useUser } from "@stackframe/stack";
import { CategoryService } from '@/service/category-service';
import { EventService } from '@/service/event-service';

export function useVantage(initialYear: number = 2026) {
  const user = useUser();
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState<VantageData>({
    year: currentYear,
    categories: [],
    events: []
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [cats, evts] = await Promise.all([
        CategoryService.getAll(user),
        EventService.getAll(user)
      ]);

      const eventsForYear = evts.filter(e =>
        e.startDate.getFullYear() === currentYear ||
        e.endDate.getFullYear() === currentYear
      );

      setData(prev => ({
        year: currentYear,
        categories: cats,
        events: eventsForYear
      }));
    } finally { setIsLoading(false); }
  }, [user, currentYear]);

  const changeYear = (year: number) => setCurrentYear(year);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addEvent = async (title: string, startDate: Date, endDate: Date, categoryId: string) => {
    if (!user) return;

    const tempId = Math.random().toString();
    const newEvent: CalendarEvent = {
      id: tempId, title, startDate, endDate, categoryId
    };

    setData(prev => ({ ...prev, events: [...prev.events, newEvent] }));

    try {
      await EventService.create(user, newEvent);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
    }));

    await EventService.update(user, id, updates);
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    setData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));

    await EventService.delete(user, id);
  };

  const addCategory = async (name: string, color: string) => {
    if (!user) return;
    const tempCat = { id: Math.random().toString(), name, color };
    setData(prev => ({ ...prev, categories: [...prev.categories, tempCat] }));

    try {
      await CategoryService.create(user, name, color);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      events: prev.events.filter(e => e.categoryId !== id)
    }));

    await CategoryService.delete(user, id);
  };

  return {
    data,
    isLoading,
    year: currentYear,
    changeYear,
    addEvent,
    updateEvent,
    deleteEvent,
    addCategory,
    deleteCategory,
    refresh: fetchData
  };
}