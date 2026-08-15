"use client";

import { useState, type FormEvent } from "react";
import { Trash2Icon } from "lucide-react";
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
import { addCakeType, deleteCakeType, useCakeTypes } from "@/lib/store";
import { cakeStrings as s } from "@/lib/strings";
import { formatCakeAmount } from "@/lib/summarize";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ManageCakeTypesSheet({ open, onOpenChange }: Props) {
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
    const isDuplicate = cakeTypes.some(
      (type) => type.name.toLowerCase() === name.toLowerCase(),
    );
    if (isDuplicate) return setError(s.duplicateCakeType);
    // Required, not optional: the sale form's price field only autofills
    // when the picked cake type actually has a price to fill it with.
    if (!priceRaw || !Number.isFinite(defaultPrice) || defaultPrice < 0) {
      return setError(s.errorDefaultPrice);
    }

    setError(null);
    addCakeType({ name, defaultPrice });
    event.currentTarget.reset();
  }

  const content = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{s.manageCakesBody}</p>

      {cakeTypes.length === 0 ? (
        <p className="text-sm text-muted">{s.noCakeTypesYet}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cakeTypes.map((type) => (
            <li
              key={type.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{type.name}</div>
                {type.defaultPrice !== undefined && (
                  <div className="text-xs text-muted" dir="ltr">
                    {formatCakeAmount(type.defaultPrice)}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                aria-label={s.deleteCakeTypeAria}
                onClick={() => deleteCakeType(type.id)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-border/70 pt-4"
      >
        <div className="flex gap-2">
          {/* No `required`/`min` here on purpose — the browser's own
              validation popup would show in whatever language the browser
              is set to, not Hebrew. Validated in handleSubmit instead, same
              as every other field in this app. */}
          <Input
            type="text"
            name="name"
            placeholder={s.cakeNamePlaceholder}
            className="h-11 flex-1"
          />
          <Input
            type="number"
            name="defaultPrice"
            placeholder={s.defaultPrice}
            step="0.01"
            className="h-11 w-32"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="h-11">
          {s.addCakeType}
        </Button>
      </form>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{s.manageCakesTitle}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{s.manageCakesTitle}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[80vh] overflow-y-auto p-4 pt-2">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
