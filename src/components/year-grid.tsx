// components/calendar/year-grid.tsx
import React, { useState, useCallback } from 'react';
import { CalendarEvent, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { isWeekend, isToday, isWithinInterval, isSameDay, isBefore } from 'date-fns';

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];

interface YearGridProps {
  year: number;
  events: CalendarEvent[];
  categories: Category[];
  // Änderung: Wir übergeben jetzt Start UND Ende
  onRangeSelect: (startDate: Date, endDate: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function YearGrid({ year, events, categories, onRangeSelect, onEventClick }: YearGridProps) {

  // DRAG STATE
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);

  const getDaysInMonth = (monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

  const getEventColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.color : 'bg-gray-400';
  };

  // MAUS HANDLER

  const handleMouseDown = (date: Date, e: React.MouseEvent) => {
    // Verhindere Drag, wenn wir auf ein Event klicken (wird durch stopPropagation im Event-Div geregelt, aber sicher ist sicher)
    if (e.button !== 0) return; // Nur Linksklick
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStart) {
      setDragEnd(date);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      // Sortieren, falls rückwärts gezogen wurde
      const start = isBefore(dragStart, dragEnd) ? dragStart : dragEnd;
      const end = isBefore(dragStart, dragEnd) ? dragEnd : dragStart;

      onRangeSelect(start, end);
    }
    // Reset
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Globaler MouseUp Listener, falls man außerhalb des Grids loslässt
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

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
          <div onMouseLeave={() => {
            // Optional: Drag abbrechen wenn Maus Grid verlässt
            if (isDragging) { setIsDragging(false); setDragStart(null); setDragEnd(null); }
          }}>
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

                      // DRAG SELECTION VISUALISIERUNG
                      let isSelected = false;
                      if (isDragging && dragStart && dragEnd) {
                        const start = isBefore(dragStart, dragEnd) ? dragStart : dragEnd;
                        const end = isBefore(dragStart, dragEnd) ? dragEnd : dragStart;
                        isSelected = isWithinInterval(currentDate, { start, end });
                      }

                      // Events filtern
                      const activeEvents = events.filter(e =>
                        isWithinInterval(currentDate, { start: e.startDate, end: e.endDate })
                      );

                      // Wir sortieren Events, damit kurze oben liegen oder nach Prio
                      // Hier simple Sortierung
                      activeEvents.sort((a, b) => a.id.localeCompare(b.id));

                      return (
                        <div
                          key={dIdx}
                          onMouseDown={(e) => handleMouseDown(currentDate, e)}
                          onMouseEnter={() => handleMouseEnter(currentDate)}
                          onMouseUp={handleMouseUp} // Hier feuert das Ende
                          className={cn(
                            "flex-1 rounded-sm border transition-all cursor-pointer relative overflow-hidden flex flex-col",
                            // Basis Hintergrund
                            isWe ? "bg-slate-50" : "bg-white",
                            "border-slate-100",
                            // Heute
                            isTd && "ring-2 ring-blue-600 ring-offset-1 z-20",
                            // Drag Selection Highlight (Blau einfärben)
                            isSelected && "bg-blue-100 border-blue-300 ring-1 ring-blue-300 z-10",
                            // Hover (nur wenn nicht dragging)
                            !isDragging && "hover:border-slate-400 hover:shadow-md"
                          )}
                        >
                          {/* Wochentag Punkt */}
                          {isWe && (
                            <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-300"></div>
                          )}

                          {/* Events rendern */}
                          {activeEvents.map((event, i) => (
                            <Tooltip key={event.id}>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation(); // Wichtig: Drag/Click nicht auf Zelle durchlassen
                                    onEventClick(event);
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()} // Wichtig: Drag nicht starten auf Event
                                  className={cn(
                                    "w-full flex-1 transition-opacity",
                                    getEventColor(event.categoryId),
                                    "opacity-90 hover:opacity-100",
                                    i > 0 && "border-t border-white/20"
                                  )}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-bold">{event.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
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