import { getApiClient } from "@/lib/api-client";
import { CalendarEvent, DbEvent } from "@/lib/types";
import { CurrentUser } from "@stackframe/stack";
import { UserService } from "./user-service";
import { startOfDay } from 'date-fns';

const toIsoDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const EventService = {
  async getForYear(user: CurrentUser, year: number): Promise<CalendarEvent[]> {
    const pg = await getApiClient(user);

    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;

    const { data, error } = await pg
      .from("events")
      .select("*")
      .gte('start_date', startOfYear)
      .lte('start_date', endOfYear)
      .order('start_date', { ascending: true });

    if (error) throw error;

    return (data as DbEvent[]).map(e => {
      const rawStart = new Date(e.start_date);
      const rawEnd = new Date(e.end_date);

      return {
        id: e.id,
        title: e.title,
        startDate: startOfDay(rawStart),
        endDate: startOfDay(rawEnd),
        categoryId: e.category_id,
        description: e.description
      };
    });
  },

  async getAll(user: CurrentUser): Promise<CalendarEvent[]> {
    const pg = await getApiClient(user);

    const { data, error } = await pg
      .from("events")
      .select("*");

    if (error) throw error;

    return (data as DbEvent[]).map(e => {
      const rawStart = new Date(e.start_date);
      const rawEnd = new Date(e.end_date);

      return {
        id: e.id,
        title: e.title,
        startDate: startOfDay(rawStart),
        endDate: startOfDay(rawEnd),
        categoryId: e.category_id,
        description: e.description
      };
    });
  },

  async create(user: CurrentUser, event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await UserService.ensureUserExists(user);
    const pg = await getApiClient(user);

    const dateStrStart = toIsoDateString(event.startDate);
    const dateStrEnd = toIsoDateString(event.endDate);

    const { data, error } = await pg
      .from("events")
      .insert({
        user_id: user.id,
        category_id: event.categoryId,
        title: event.title,
        start_date: dateStrStart,
        end_date: dateStrEnd,
        description: event.description
      })
      .select()
      .single();

    if (error) throw error;
    const e = data as DbEvent;

    return {
      id: e.id,
      title: e.title,
      startDate: new Date(e.start_date),
      endDate: new Date(e.end_date),
      categoryId: e.category_id,
      description: e.description
    };
  },

  async update(user: CurrentUser, id: string, updates: Partial<CalendarEvent>): Promise<void> {
    const pg = await getApiClient(user);

    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.startDate) dbUpdates.start_date = toIsoDateString(updates.startDate);
    if (updates.endDate) dbUpdates.end_date = toIsoDateString(updates.endDate);
    if (updates.categoryId) dbUpdates.category_id = updates.categoryId;

    const { error } = await pg
      .from("events")
      .update(dbUpdates)
      .eq("id", id);

    if (error) throw error;
  },

  async delete(user: CurrentUser, id: string): Promise<void> {
    const pg = await getApiClient(user);
    const { error } = await pg.from("events").delete().eq("id", id);
    if (error) throw error;
  }
};