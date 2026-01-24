"use client";

import { useState } from "react";
import { YearGrid } from "@/components/year-grid";
import { AddEventDialog } from "@/components/add-event-dialog";
import { EditEventDialog } from "@/components/edit-event-dialog";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { UserNav } from "@/components/user-nav";
import { useVantage } from "@/hooks/use-vantage";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/lib/types";
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { stackClientApp } from "@/stack/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { differenceInCalendarDays } from "date-fns";

export default function VantageDashboard() {
  const user = stackClientApp.useUser({ or: "redirect" });
  const {
    data,
    year,
    changeYear,
    addEvent,
    updateEvent,
    deleteEvent,
    addCategory,
  } = useVantage();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);



  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    setSelectedRange({ start, end });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">

      <header className="z-50 w-full bg-slate-50/80 backdrop-blur-md mb-6 transition-all">
        <div className="max-w-[1800px] mx-auto px-4">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center justify-between w-full md:w-auto">

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center font-bold text-lg md:text-xl select-none">
                  V
                </div>
                <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                  Vantage
                </span>
              </div>

              <div className="md:hidden">
                <UserNav user={user} />
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 w-full md:w-auto">

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-full p-1 pl-4 w-full md:w-auto">

                <div className="flex items-center gap-2 text-slate-600 select-none mr-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-lg font-bold tabular-nums tracking-tight">
                    {data.year}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-[1px] h-6 bg-slate-100"></div>

                  <div className="flex gap-1 pr-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 active:scale-95 transition-all"
                      onClick={() => changeYear(data.year - 1)}
                      title="Vorheriges Jahr"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 active:scale-95 transition-all"
                      onClick={() => changeYear(data.year + 1)}
                      title="Nächstes Jahr"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <UserNav user={user} />
              </div>

            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto space-y-6">

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex-1 w-full overflow-hidden flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-slate-400 whitespace-nowrap mr-2">
              Kategorien:
            </span>

            <div className="flex-1 overflow-x-auto flex items-center gap-3 pb-2 -mb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {data.categories.map(cat => {
                const categoryDays = data.categories.reduce((acc, cat) => {
                  const events = data.events.filter(e => e.categoryId === cat.id);

                  const totalDays = events.reduce((sum, event) => {
                    const days = Math.abs(differenceInCalendarDays(event.endDate, event.startDate)) + 1;
                    return sum + days;
                  }, 0);

                  acc[cat.id] = totalDays;
                  return acc;
                }, {} as Record<string, number>);

                return (
                  <TooltipProvider key={cat.id}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-sm font-medium group cursor-default transition-colors hover:border-slate-300 whitespace-nowrap flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                          {cat.name}

                          {categoryDays[cat.id] > 0 && (
                            <span className="ml-1.5 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center font-bold">
                              {categoryDays[cat.id]}d
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">
                          {categoryDays[cat.id] || 0} Tage
                        </p>
                        <p className="text-xs text-slate-400">geplant in {data.year}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}

              <AddCategoryDialog onAddCategory={addCategory} />
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-4 text-xs text-slate-500 border-l pl-4 md:border-l-0 md:pl-0">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border bg-slate-100 rounded-sm"></div> Wochenende
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 ring-2 ring-blue-600 rounded-sm"></div> Heute
            </div>
          </div>
        </div>

        <div className="bg-white p-2 md:p-6 rounded-2xl border border-slate-200 overflow-hidden">
          <YearGrid
            year={data.year}
            events={data.events}
            categories={data.categories}
            onRangeSelect={handleRangeSelect}
            onEventClick={handleEventClick}
          />
        </div>
      </main>

      <AddEventDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        defaultRange={selectedRange}
        categories={data.categories}
        onAddEvent={addEvent}
      />

      <EditEventDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        event={selectedEvent}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />

    </div>
  );
}