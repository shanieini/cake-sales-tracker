"use client";

import { useMemo, useState, type FormEvent } from "react";
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
import { cakeStrings as s } from "@/lib/strings";
import { toIsoDate } from "@/lib/summarize";
import type { CakeSaleInput } from "@/lib/store";
import type { CakeSale, CakeType } from "@/lib/types";

type Props = {
  open: boolean;
  editing: CakeSale | null;
  cakeTypes: CakeType[];
  onOpenChange: (open: boolean) => void;
  onSave: (input: CakeSaleInput) => void;
  /** Jumps to the cake-type catalog — used by the empty-state prompt below,
   * when there's nothing to pick from yet. */
  onManageCakeTypes: () => void;
};

export default function AddSaleSheet({
  open,
  editing,
  cakeTypes,
  onOpenChange,
  onSave,
  onManageCakeTypes,
}: Props) {
  const isDesktop = useIsDesktop();
  const [error, setError] = useState<string | null>(null);
  const [cakeTypeName, setCakeTypeName] = useState(editing?.cakeType ?? "");
  const [price, setPrice] = useState(
    editing ? String(editing.pricePerUnit) : "",
  );

  // `cakeTypeName`/`price`/`error` are only ever correct because CakeTracker
  // gives this whole component a fresh `key` on every open (see its call
  // site) — that's what makes AddSaleSheet itself remount, resetting these
  // `useState` initializers to run again for the new target. Without that
  // key, this component doesn't unmount between sheet opens (CakeTracker
  // would otherwise render one long-lived instance, only toggling `open`/
  // `editing`), and switching which sale is being edited would leave the
  // previous sale's cake type and price sitting in the form — looking like
  // valid input for the *new* target and silently overwriting it on save.
  // The uncontrolled fields below (quantity, date, note) don't depend on
  // this: their `key={editing?.id ?? "new"}` form-level remount would reset
  // them either way, since their initial values live in the DOM, not in
  // this component's state — but a lower-level key can't reset state
  // declared *above* it (in this component itself), which is exactly the
  // bug that left cakeTypeName/price stale before.

  // The catalog, plus — only when editing a sale whose cake type was since
  // deleted from it — a stand-in entry so the dropdown still shows and keeps
  // that original name instead of silently blanking it out.
  const selectableTypes = useMemo(() => {
    if (editing && !cakeTypes.some((type) => type.name === editing.cakeType)) {
      return [{ id: `editing-${editing.id}`, name: editing.cakeType }, ...cakeTypes];
    }
    return cakeTypes;
  }, [cakeTypes, editing]);

  // Picking a cake type always fills in its price — a deliberate, one-time
  // choice from a dropdown, not a keystroke, so there's no reason to hold
  // back the way free-text typing would have needed to. Clears the field
  // (rather than leaving it) when the newly picked type has no price of its
  // own — the deleted-cake-type stand-in in `selectableTypes` is one way to
  // hit this, and a previously-picked type's price is exactly the kind of
  // stale, still-looks-valid number this page's own edit-state bug (see the
  // effect above) was caught by leaving behind.
  function handleSelectCakeType(name: string | null) {
    setCakeTypeName(name ?? "");
    const match = cakeTypes.find((type) => type.name === name);
    setPrice(match?.defaultPrice !== undefined ? String(match.defaultPrice) : "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const quantity = Number(data.get("quantity"));
    const pricePerUnit = Number(price);
    const date = String(data.get("date") ?? "");
    const note = String(data.get("note") ?? "").trim();

    if (!cakeTypeName) return setError(s.errorCakeType);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return setError(s.errorQuantity);
    }
    // `!price.trim()` first: `Number("")` is `0`, which is otherwise a
    // perfectly valid (free/complimentary sale) price, so a blank field
    // would silently save as ₪0 instead of being flagged as unfilled —
    // same required-field treatment `validateCakeTypeInput` already gives
    // a cake type's own price.
    if (!price.trim() || !Number.isFinite(pricePerUnit) || pricePerUnit < 0) {
      return setError(s.errorPrice);
    }
    if (!date) return setError(s.errorDate);

    setError(null);
    onSave({
      cakeType: cakeTypeName,
      quantity,
      pricePerUnit,
      date,
      note: note || undefined,
    });
    onOpenChange(false);
  }

  const title = editing ? s.editSale : s.logSale;
  const submitLabel = editing ? s.saveChanges : s.addSale;

  const form = (
    // Keyed by the edited row (or "new") so defaults re-initialise when the
    // target changes.
    <form
      key={editing?.id ?? "new"}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cakeType">{s.cakeType}</Label>
        {selectableTypes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/70 px-4 py-5 text-center">
            <p className="text-sm text-muted">{s.noCakeTypesInSaleForm}</p>
            <Button
              type="button"
              variant="outline"
              onClick={onManageCakeTypes}
              className="h-9"
            >
              {s.manageCakes}
            </Button>
          </div>
        ) : (
          <Select value={cakeTypeName} onValueChange={handleSelectCakeType}>
            <SelectTrigger
              id="cakeType"
              autoFocus={isDesktop}
              className="h-11 w-full text-base"
            >
              <SelectValue placeholder={s.cakeTypePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {selectableTypes.map((type) => (
                <SelectItem key={type.id} value={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="quantity">{s.quantity}</Label>
          <Input
            id="quantity"
            type="number"
            name="quantity"
            inputMode="numeric"
            min="1"
            step="1"
            defaultValue={editing?.quantity ?? 1}
            className="h-11"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="pricePerUnit">{s.priceEach}</Label>
          <Input
            id="pricePerUnit"
            type="number"
            name="pricePerUnit"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="h-11"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">{s.date}</Label>
        <DateField
          id="date"
          name="date"
          placeholder={s.selectDate}
          defaultValue={editing?.date ?? toIsoDate(new Date())}
          className="h-11"
        />
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
        <Button
          type="submit"
          disabled={selectableTypes.length === 0}
          className="h-11 flex-1"
        >
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
