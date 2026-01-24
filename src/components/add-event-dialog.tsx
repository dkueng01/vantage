import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Category } from '@/lib/types';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  title: z.string().min(1, "Bitte gib einen Titel ein"),
  categoryId: z.string().min(1, "Bitte wähle eine Kategorie"),
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "Das Enddatum muss nach dem Startdatum liegen",
  path: ["endDate"],
});

interface AddEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRange: { start: Date; end: Date } | null;
  categories: Category[];
  onAddEvent: (title: string, startDate: Date, endDate: Date, categoryId: string) => void;
}

export function AddEventDialog({ isOpen, onClose, categories, defaultRange, onAddEvent }: AddEventDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  })

  useEffect(() => {
    if (isOpen && defaultRange) {
      form.reset({
        title: "",
        categoryId: categories[0]?.id || "",
        startDate: defaultRange.start,
        endDate: defaultRange.end,
      })
    }
  }, [isOpen, defaultRange, categories, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddEvent(values.title, values.startDate, values.endDate, values.categoryId);
    onClose();
  };

  if (!defaultRange) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuer Eintrag</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Was hast du vor?</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Urlaub in Spanien" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1 leading-normal">Bis wann?</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal pl-3",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {field.value ? (
                              format(field.value, "d. MMM", { locale: de })
                            ) : (
                              <span>Datum wählen</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < form.getValues("startDate")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md">
              Geplant: <strong>{form.watch("title") || "..."}</strong> vom {form.watch("startDate") && format(form.watch("startDate"), "d.M.", { locale: de })} bis {form.watch("endDate") && format(form.watch("endDate"), "d.M.yyyy", { locale: de })}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!form.formState.isValid}>Speichern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}