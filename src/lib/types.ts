export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  categoryId: string;
  description?: string;
}

export interface VantageData {
  year: number;
  categories: Category[];
  events: CalendarEvent[];
}

export interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DbEvent {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  created_at: string;
}