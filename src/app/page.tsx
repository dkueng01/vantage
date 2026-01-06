"use client";

import React, { useState } from "react";
import { YearGrid } from "@/components/year-grid";
import { AddEventDialog } from "@/components/add-event-dialog";
import { EditEventDialog } from "@/components/edit-event-dialog"; // Sicherstellen, dass der aktualisiert ist
import { UserNav } from "@/components/user-nav";
import { useVantage } from "@/hooks/use-vantage";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/lib/types";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VantageDashboard() {
  const {
    data,
    addEvent,
    updateEvent,
    deleteEvent,
    addCategory,
    deleteCategory
  } = useVantage();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Einfacher State für Kategorie-Erstellung (könnte man in eigene Component auslagern)
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("bg-blue-500");

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">

      {/* Header */}
      <header className="flex justify-between items-center mb-8 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vantage <span className="text-slate-400">{data.year}</span>
          </h1>
        </div>
        <UserNav />
      </header>

      <main className="max-w-[1800px] mx-auto space-y-6">

        {/* Top Bar: Kategorien Verwaltung & Legende */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold uppercase text-slate-400 mr-2">Kategorien:</span>

            {data.categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-sm font-medium group">
                <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                {cat.name}
              </div>
            ))}

            {/* Kategorie Hinzufügen Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full h-8 border-dashed">
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
                    {/* Hier könnte man später einen Color Picker bauen */}
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

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border bg-slate-100 rounded-sm"></div> Wochenende
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 ring-2 ring-blue-600 rounded-sm"></div> Heute
            </div>
          </div>
        </div>

        {/* Kalender */}
        <div className="bg-white p-2 md:p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <YearGrid
            year={data.year}
            events={data.events}
            categories={data.categories} // WICHTIG: Kategorien übergeben
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>
      </main>

      {/* Dialogs */}
      <AddEventDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        defaultDate={selectedDate}
        categories={data.categories} // Kategorien übergeben
        onAddEvent={addEvent}
      />

      {/* EditEventDialog benötigt Update für Kategorien-Auswahl analog zu AddEventDialog */}
      <EditEventDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        event={selectedEvent}
        // categories={data.categories} // Müsste im EditDialog auch hinzugefügt werden
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />

    </div>
  );
}