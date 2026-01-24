import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
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
  name: z.string().min(1, "Bitte gib einen Namen ein"),
  color: z.string().min(1, "Bitte wähle eine Farbe"),
})

const COLORS = [
  { value: "bg-red-500", label: "Rot" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-amber-400", label: "Gelb" },
  { value: "bg-green-500", label: "Grün" },
  { value: "bg-emerald-500", label: "Smaragd" },
  { value: "bg-teal-400", label: "Türkis" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-blue-500", label: "Blau" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-purple-500", label: "Lila" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-slate-600", label: "Grau" },
  { value: "bg-slate-800", label: "Schwarz" },
]

interface AddCategoryDialogProps {
  onAddCategory: (name: string, color: string) => void;
}

export function AddCategoryDialog({ onAddCategory }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "bg-blue-500",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddCategory(values.name, values.color);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full h-8 border-dashed flex-shrink-0 whitespace-nowrap">
          <Plus className="w-3 h-3 mr-1" /> Neu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Kategorie</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Arbeit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farbe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color.value}`}></div>
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Erstellen</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
