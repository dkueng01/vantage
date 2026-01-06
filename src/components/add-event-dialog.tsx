import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Category } from '@/lib/types'; // Import Category

interface AddEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: Date | null;
  categories: Category[]; // Neue Prop
  onAddEvent: (title: string, startDate: Date, endDate: Date, categoryId: string) => void;
}

export function AddEventDialog({ isOpen, onClose, categories, defaultDate, onAddEvent }: AddEventDialogProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [categoryId, setCategoryId] = useState<string>("");

  // Reset und Init wenn Dialog aufgeht
  useEffect(() => {
    if (isOpen && defaultDate) {
      setStartDate(defaultDate);
      setEndDate(defaultDate);
      setTitle("");
      if (categories.length > 0) setCategoryId(categories[0].id);
    }
  }, [isOpen, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate && title) {
      // Sicherstellen, dass endDate nicht vor startDate liegt
      const finalEnd = endDate < startDate ? startDate : endDate;
      onAddEvent(title, startDate, finalEnd, categoryId);
      onClose();
    }
  };

  if (!defaultDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuer Eintrag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">

          {/* Titel Input */}
          <div className="grid gap-2">
            <Label htmlFor="title">Was hast du vor?</Label>
            <Input
              id="title"
              placeholder="z.B. Urlaub in Spanien"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Typ Auswahl */}
            <div className="grid gap-2">
              <Label>Kategorie</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zeitraum Auswahl (Vereinfacht: Nur Enddatum wählen, Start ist fixiert auf Klick) */}
            <div className="grid gap-2">
              <Label>Bis wann?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "d. MMM", { locale: de }) : <span>Datum wählen</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Zusammenfassung */}
          <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md">
            Geplant: <strong>{title || "..."}</strong> vom {startDate && format(startDate, "d.M.", { locale: de })} bis {endDate && format(endDate, "d.M.yyyy", { locale: de })}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!title}>Speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}