"use client";

import { useState } from "react";
import { YearGrid } from "@/components/year-grid";
import { AddEventDialog } from "@/components/add-event-dialog";
import { EditEventDialog } from "@/components/edit-event-dialog";
import { UserNav } from "@/components/user-nav";
import { useVantage } from "@/hooks/use-vantage";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/lib/types";
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stackClientApp } from "@/stack/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("bg-blue-500");

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    setSelectedRange({ start, end });
    setIsAddDialogOpen(true);
  };

  const categoryCounts = data.categories.reduce((acc, cat) => {
    const count = data.events.filter(e => e.categoryId === cat.id).length;
    acc[cat.id] = count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">

      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center font-bold text-xl select-none">
            V
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 hidden md:block">
            Vantage
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-full p-1 pl-4 gap-2">

            <div className="flex items-center gap-2 text-slate-600 select-none mr-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-lg font-bold tabular-nums tracking-tight">
                {data.year}
              </span>
            </div>

            <div className="w-[1px] h-6 bg-slate-200"></div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                onClick={() => changeYear(data.year - 1)}
                title="Vorheriges Jahr"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                onClick={() => changeYear(data.year + 1)}
                title="Nächstes Jahr"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <UserNav user={user} />
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto space-y-6">

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex-1 w-full overflow-hidden flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-slate-400 whitespace-nowrap mr-2">
              Kategorien:
            </span>

            <div className="flex-1 overflow-x-auto flex items-center gap-3 pb-2 -mb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {data.categories.map(cat => (
                <TooltipProvider key={cat.id}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-sm font-medium group cursor-default transition-colors hover:border-slate-300 whitespace-nowrap flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                        {cat.name}

                        {categoryCounts[cat.id] > 0 && (
                          <span className="ml-1.5 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                            {categoryCounts[cat.id]}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">
                        {categoryCounts[cat.id] || 0} Einträge
                      </p>
                      <p className="text-xs text-slate-400">im Jahr {data.year}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full h-8 border-dashed flex-shrink-0 whitespace-nowrap">
                    <Plus className="w-3 h-3 mr-1" /> Neu
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Neue Kategorie</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input placeholder="z.B. Arbeit" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Farbe (Tailwind Class)</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newCatColor}
                        onChange={e => setNewCatColor(e.target.value)}
                      >
                        <option value="bg-red-500">Rot</option>
                        <option value="bg-orange-500">Orange</option>
                        <option value="bg-amber-400">Gelb</option>
                        <option value="bg-green-500">Grün</option>
                        <option value="bg-emerald-500">Smaragd</option>
                        <option value="bg-teal-400">Türkis</option>
                        <option value="bg-cyan-500">Cyan</option>
                        <option value="bg-blue-500">Blau</option>
                        <option value="bg-indigo-500">Indigo</option>
                        <option value="bg-purple-500">Lila</option>
                        <option value="bg-pink-500">Pink</option>
                        <option value="bg-slate-600">Grau</option>
                        <option value="bg-slate-800">Schwarz</option>
                      </select>
                    </div>
                    <Button onClick={() => {
                      if (newCatName) {
                        addCategory(newCatName, newCatColor);
                        setNewCatName("");
                      }
                    }}>Erstellen</Button>
                  </div>
                </DialogContent>
              </Dialog>
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

        <div className="bg-white p-2 md:p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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