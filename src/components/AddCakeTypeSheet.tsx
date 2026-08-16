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
import { useCakeTypes, type CakeTypeInput } from "@/lib/store";
import { cakeStrings as s } from "@/lib/strings";
import type { CakeType } from "@/lib/types";

type Props = {
  open: boolean;
  editing: CakeType | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CakeTypeInput) => void;
};

/**
 * Add-or-edit form for a single cake type (name + default price), same
 * responsive Dialog/Drawer shape as `AddSaleSheet`/`AddExpenseSheet`. Used
 * by the `/cakes` price-list page — the older inline add-only form still
 * lives in `ManageCakeTypesSheet` for quick add/delete from elsewhere in
 * the app, but only this one supports editing an existing price.
 */
export default function AddCakeTypeSheet({
  open,
  editing,
  onOpenChange,
  onSave,
}: Props) {
  const isDesktop = useIsDesktop();
  const cakeTypes = useCakeTypes();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const priceRaw = String(data.get("defaultPrice") ?? "").trim();
    const defaultPrice = Number(priceRaw);

    if (!name) return setError(s.errorCakeTypeName);
    // Excludes the row being edited, so saving a cake type without changing
    // its name doesn't flag itself as a duplicate of itself.
    const isDuplicate = cakeTypes.some(
      (type) =>
        type.id !== editing?.id &&
        type.name.toLowerCase() === name.toLowerCase(),
    );
    if (isDuplicate) return setError(s.duplicateCakeType);
    if (!priceRaw || !Number.isFinite(defaultPrice) || defaultPrice < 0) {
      return setError(s.errorDefaultPrice);
    }

    setError(null);
    onSave({ name, defaultPrice });
    onOpenChange(false);
  }

  const title = editing ? s.editCakeType : s.addCakeType;
  const submitLabel = editing ? s.saveChanges : s.addCakeType;

  const form = (
    // Keyed by the edited row (or "new") so defaults re-initialise when the
    // target changes, same trick as the sale/expense forms.
    <form
      key={editing?.id ?? "new"}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{s.cakeType}</Label>
        <Input
          id="name"
          type="text"
          name="name"
          placeholder={s.cakeNamePlaceholder}
          defaultValue={editing?.name ?? ""}
          autoFocus={isDesktop}
          className="h-11"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultPrice">{s.defaultPrice}</Label>
        <Input
          id="defaultPrice"
          type="number"
          name="defaultPrice"
          inputMode="decimal"
          min="0"
          step="0.01"
          defaultValue={editing?.defaultPrice ?? ""}
          className="h-11"
        />
      </div>
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
