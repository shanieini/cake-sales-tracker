"use client";

import { useState, type FormEvent } from "react";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DateField from "@/components/DateField";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_META } from "@/lib/expense-categories";
import { cakeStrings as s } from "@/lib/strings";
import { toIsoDate } from "@/lib/summarize";
import type { CakeExpenseInput } from "@/lib/store";
import type { CakeExpense, ExpenseCategory } from "@/lib/types";

type Props = {
  open: boolean;
  editing: CakeExpense | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CakeExpenseInput) => void;
};

export default function AddExpenseSheet({
  open,
  editing,
  onOpenChange,
  onSave,
}: Props) {
  const isDesktop = useIsDesktop();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const description = String(data.get("description") ?? "").trim();
    const category = String(data.get("category") ?? "") as ExpenseCategory;
    const amount = Number(data.get("amount"));
    const date = String(data.get("date") ?? "");
    const note = String(data.get("note") ?? "").trim();

    if (!description) return setError(s.errorExpenseDescription);
    if (!Number.isFinite(amount) || amount <= 0) {
      return setError(s.errorExpenseAmount);
    }
    if (!date) return setError(s.errorDate);

    setError(null);
    onSave({
      description,
      category,
      amount,
      date,
      note: note || undefined,
    });
    onOpenChange(false);
  }

  const title = editing ? s.editExpense : s.logExpense;
  const submitLabel = editing ? s.saveChanges : s.addExpense;

  const form = (
    // Keyed by the edited row (or "new") so defaults re-initialise when the
    // target changes, same trick as the sale form.
    <form
      key={editing?.id ?? "new"}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{s.expenseDescription}</Label>
        <Input
          id="description"
          type="text"
          name="description"
          placeholder={s.expenseDescriptionPlaceholder}
          defaultValue={editing?.description ?? ""}
          autoFocus={isDesktop}
          className="h-11"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">{s.expenseCategory}</Label>
        <Select
          name="category"
          defaultValue={editing?.category ?? "ingredients"}
          items={EXPENSE_CATEGORIES.map((category) => ({
            value: category,
            label: EXPENSE_CATEGORY_META[category].label,
          }))}
        >
          <SelectTrigger id="category" className="h-11 w-full text-base">
            <SelectValue>
              {(value: ExpenseCategory) => (
                <>
                  <ExpenseCategoryBadge category={value} />
                  {EXPENSE_CATEGORY_META[value].label}
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                <ExpenseCategoryBadge category={category} />
                {EXPENSE_CATEGORY_META[category].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="amount">{s.expenseAmount}</Label>
          <Input
            id="amount"
            type="number"
            name="amount"
            inputMode="decimal"
            min="0"
            step="0.01"
            defaultValue={editing?.amount ?? ""}
            className="h-11"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="date">{s.date}</Label>
          <DateField
            id="date"
            name="date"
            placeholder={s.selectDate}
            defaultValue={editing?.date ?? toIsoDate(new Date())}
            className="h-11"
          />
        </div>
      </div>
      <Textarea
        name="note"
        placeholder={s.noteOptional}
        defaultValue={editing?.note ?? ""}
        rows={2}
        className="resize-none"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="submit" className="h-11 flex-1">
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="h-11"
        >
          {s.cancel}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[80vh] overflow-y-auto p-4 pt-2">{form}</div>
      </DrawerContent>
    </Drawer>
  );
}
