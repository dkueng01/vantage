import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarEvent } from '@/lib/types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  onDelete: (id: string) => void;
}

export function EditEventDialog({ isOpen, onClose, event, onUpdate, onDelete }: EditEventDialogProps) {
  const [title, setTitle] = useState("");

  // Wenn Dialog aufgeht, Daten laden
  useEffect(() => {
    if (event) {
      setTitle(event.title);
    }
  }, [event]);

  if (!event) return null;

  // Check: Ist es ein System-Event (Misogi/Adventure/Habit)?
  const isSystemEvent = ['misogi', 'adventure', 'habit'].includes(event.categoryId);

  const handleSave = () => {
    onUpdate(event.id, { title });
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Wirklich löschen?")) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Termin Details</DialogTitle>
        </DialogHeader>

        {isSystemEvent ? (
          <div className="py-4 space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <h3 className="font-bold text-lg mb-1">{event.title}</h3>
              <p className="text-sm text-slate-500">
                {format(event.startDate, "d. MMM", { locale: de })} - {format(event.endDate, "d. MMM yyyy", { locale: de })}
              </p>
              <span className="inline-block mt-2 px-2 py-1 bg-slate-200 text-xs rounded uppercase font-bold text-slate-600">
                {event.categoryId}
              </span>
            </div>

            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Dies ist ein strategisches Ziel. Bitte bearbeite es über die "Pillars" Karten oben im Dashboard.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={onClose}>Schließen</Button>
            </DialogFooter>
          </div>
        ) : (
          /* Normales Event: Bearbeitbar */
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="text-sm text-slate-500">
              Zeitraum: {format(event.startDate, "d. MMM", { locale: de })} - {format(event.endDate, "d. MMM yyyy", { locale: de })}
            </div>

            <DialogFooter className="flex justify-between sm:justify-between w-full">
              <Button variant="destructive" size="icon" onClick={handleDelete} title="Löschen">
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Abbrechen</Button>
                <Button onClick={handleSave}>Speichern</Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}