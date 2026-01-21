import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { isWeekend, isToday, isBefore, isWithinInterval, startOfToday } from 'date-fns';

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];

interface YearGridProps {
  year: number;
  events: CalendarEvent[];
  categories: Category[];
  onRangeSelect: (startDate: Date, endDate: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function YearGridComponent({ year, events, categories, onRangeSelect, onEventClick }: YearGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);

  const getDaysInMonth = (monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

  const getEventColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.color : 'bg-gray-400';
  };

  const handleMouseDown = (date: Date, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragStart(date);
    setDragEnd(date);
  };

  const handleMouseEnter = (date: Date) => {
    if (dragStart) {
      setIsDragging(true);
      setDragEnd(date);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging && dragStart && dragEnd) {
      const start = isBefore(dragStart, dragEnd) ? dragStart : dragEnd;
      const end = isBefore(dragStart, dragEnd) ? dragEnd : dragStart;
      onRangeSelect(start, end);
    } else if (dragStart && startPos.current) {
      const dist = Math.sqrt(Math.pow(e.clientX - startPos.current.x, 2) + Math.pow(e.clientY - startPos.current.y, 2));
      if (dist < 5) onRangeSelect(dragStart, dragStart);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    startPos.current = null;
  };

  useEffect(() => {
    const cleanup = () => { setIsDragging(false); setDragStart(null); setDragEnd(null); startPos.current = null; };
    window.addEventListener('mouseup', cleanup);
    return () => window.removeEventListener('mouseup', cleanup);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full overflow-x-auto pb-4 select-none">
        <div className="min-w-[1200px] xl:min-w-full grid grid-cols-[60px_1fr] gap-4">

          <div className="flex flex-col gap-2 pt-8">
            {MONTHS.map((m) => (
              <div key={m} className="h-16 flex items-center justify-center font-bold text-xl text-slate-400">
                {m}
              </div>
            ))}
          </div>

          <div>
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
                      if (dayNum > daysInMonth) return <div key={dIdx} className="flex-1 border-transparent" />;

                      const currentDate = new Date(year, mIdx, dayNum);
                      const today = startOfToday();
                      const isPast = isBefore(currentDate, today);
                      const isWe = isWeekend(currentDate);
                      const isTd = isToday(currentDate);

                      let isSelected = false;
                      if (dragStart && dragEnd) {
                        const start = isBefore(dragStart, dragEnd) ? dragStart : dragEnd;
                        const end = isBefore(dragStart, dragEnd) ? dragEnd : dragStart;
                        isSelected = isWithinInterval(currentDate, { start, end });
                      }

                      const activeEvents = events.filter(e =>
                        isWithinInterval(currentDate, { start: e.startDate, end: e.endDate })
                      );
                      activeEvents.sort((a, b) => a.id.localeCompare(b.id));

                      return (
                        <div
                          key={dIdx}
                          onMouseDown={(e) => handleMouseDown(currentDate, e)}
                          onMouseEnter={() => handleMouseEnter(currentDate)}
                          onMouseUp={handleMouseUp}
                          className={cn(
                            "flex-1 rounded-sm border transition-all relative overflow-hidden flex flex-col group cursor-crosshair",
                            isPast
                              ? "bg-slate-100/40 opacity-50 grayscale"
                              : (isWe ? "bg-slate-50" : "bg-white"),
                            "border-slate-100",
                            isTd && "ring-2 ring-blue-600 ring-offset-1 z-20 opacity-100 bg-white",
                            isSelected && "bg-blue-100 border-blue-300 ring-1 ring-blue-300 z-10 opacity-100",
                            !dragStart && "hover:border-slate-400 hover:shadow-md hover:opacity-100"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 right-0.5 text-[7px] font-mono leading-none pointer-events-none z-30",
                            isWe ? "text-slate-400 font-bold" : "text-slate-300",
                            isPast && "text-slate-200"
                          )}>
                            {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][currentDate.getDay()]}
                          </div>

                          <div className="flex-1 w-full flex flex-col max-h-[75%] overflow-hidden">
                            {activeEvents.map((event, i) => (
                              <Tooltip key={event.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEventClick(event);
                                    }}
                                    className={cn(
                                      "w-full flex-1 min-h-[4px] transition-all cursor-pointer hover:brightness-90 z-20 mb-[1px]",
                                      getEventColor(event.categoryId),
                                      isPast && "opacity-70",
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

                          <div className="min-h-[25%] w-full bg-transparent hover:bg-slate-100/50 transition-colors"></div>

                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-40">
                            <span className="text-2xl font-black text-slate-900 drop-shadow-md select-none opacity-40">
                              {dayNum}
                            </span>
                          </div>

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

const arePropsEqual = (prev: YearGridProps, next: YearGridProps) => {
  if (prev.year !== next.year) return false;
  if (prev.events.length !== next.events.length) return false;
  if (prev.categories !== next.categories) return false;

  return true;
};

export const YearGrid = React.memo(YearGridComponent, arePropsEqual);