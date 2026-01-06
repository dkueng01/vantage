import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { isWeekend, isToday, getDay, isWithinInterval, isSameDay } from 'date-fns';
import { CalendarEvent, Category } from '@/lib/types';

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];

interface YearGridProps {
  year: number;
  events: CalendarEvent[];
  categories: Category[]; // NEU
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function YearGrid({ year, events, categories, onDayClick, onEventClick }: YearGridProps) {

  const getDaysInMonth = (monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

  const getEventColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.color : 'bg-gray-400'; // Fallback
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full overflow-x-auto pb-4 select-none">
        <div className="min-w-[1200px] xl:min-w-full grid grid-cols-[60px_1fr] gap-4">

          {/* Y-Axis */}
          <div className="flex flex-col gap-2 pt-8">
            {MONTHS.map((m) => (
              <div key={m} className="h-16 flex items-center justify-center font-bold text-xl text-slate-400">
                {m}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div>
            {/* Header */}
            <div className="flex mb-2 px-1">
              {Array.from({ length: 31 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-[10px] font-bold text-slate-400">
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {MONTHS.map((_, mIdx) => {
                const daysInMonth = getDaysInMonth(mIdx);

                return (
                  <div key={mIdx} className="h-16 flex gap-1 relative">
                    {Array.from({ length: 31 }, (_, dIdx) => {
                      const dayNum = dIdx + 1;

                      if (dayNum > daysInMonth) {
                        return <div key={dIdx} className="flex-1 border-transparent" />;
                      }

                      const currentDate = new Date(year, mIdx, dayNum);
                      const isWe = isWeekend(currentDate);
                      const isTd = isToday(currentDate);

                      // Finde alle Events, die diesen Tag abdecken
                      const activeEvents = events.filter(e =>
                        isWithinInterval(currentDate, { start: e.startDate, end: e.endDate })
                      );

                      // Sortierung (damit lange Events eher unten/hinten sind oder oben, je nach Prio)
                      // Hier einfache Sortierung nach Typ
                      activeEvents.sort((a, b) => a.categoryId === 'misogi' ? -1 : 1);

                      return (
                        <div
                          key={dIdx}
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              onDayClick(currentDate);
                            }
                          }}
                          className={cn(
                            "flex-1 rounded-sm border transition-all cursor-pointer relative overflow-hidden flex flex-col",
                            isWe ? "bg-slate-100 border-slate-200" : "bg-white border-slate-100",
                            isTd && "ring-2 ring-blue-600 ring-offset-1 z-20", // Z-Index erhöht
                            "hover:border-slate-400 hover:shadow-md"
                          )}
                        >
                          {/* Wochentag Indikator (sehr dezent) */}
                          {isWe && (
                            <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-300"></div>
                          )}

                          {/* Event Rendering: Split View */}
                          {activeEvents.map((event, i) => {
                            // Prüfen ob es der Start oder das Ende ist (für abgerundete Ecken innerhalb der Bar)
                            const isStart = isSameDay(currentDate, event.startDate);
                            const isEnd = isSameDay(currentDate, event.endDate);

                            return (
                              <Tooltip key={event.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation(); // Wichtig! Nicht das DayClick Event feuern
                                      onEventClick(event);
                                    }}
                                    className={cn(
                                      "w-full flex-1 transition-opacity cursor-pointer", // flex-1 teilt die Höhe auf!
                                      getEventColor(event.categoryId),
                                      "opacity-90 hover:opacity-100",
                                      // Border zwischen gestapelten Events
                                      i > 0 && "border-t border-white/20"
                                    )}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-bold">{event.title}</p>
                                  <p className="text-xs opacity-80">
                                    {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}