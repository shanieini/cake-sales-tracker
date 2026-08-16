"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  PlusIcon,
  SquarePenIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react";
import AddCakeTypeSheet from "@/components/AddCakeTypeSheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  addCakeType,
  deleteCakeType,
  updateCakeType,
  useCakeTypes,
  type CakeTypeInput,
} from "@/lib/store";
import { formatCakeAmount } from "@/lib/summarize";
import { cakeStrings as s } from "@/lib/strings";
import type { CakeType } from "@/lib/types";

/**
 * `/cakes` — a full page listing every cake type with its price, the
 * read-focused counterpart to `ManageCakeTypesSheet` (which still exists
 * as a quick add/delete popup reachable mid-flow, e.g. from the sale form's
 * empty-catalog prompt). This page is where a baker actually checks or
 * updates prices — it's the only place that supports editing one, not just
 * adding or deleting.
 */
export default function CakeTypesPage() {
  const cakeTypes = useCakeTypes();
  const [sheet, setSheet] = useState<{
    open: boolean;
    editing: CakeType | null;
  }>({ open: false, editing: null });

  function handleSave(input: CakeTypeInput) {
    if (sheet.editing) updateCakeType(sheet.editing.id, input);
    else addCakeType(input);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label={s.backAria}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowRightIcon className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {s.cakesPageTitle}
          </h1>
          <p className="text-xs text-muted">{s.cakesPageSubtitle}</p>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setSheet({ open: true, editing: null })}
        className="h-12 w-full gap-2"
      >
        <PlusIcon className="size-4" />
        {s.addCakeType}
      </Button>

      <AddCakeTypeSheet
        open={sheet.open}
        editing={sheet.editing}
        onOpenChange={(open) => setSheet((prev) => ({ ...prev, open }))}
        onSave={handleSave}
      />

      {cakeTypes.length === 0 ? (
        <Card className="flex-col items-center gap-2 px-4 py-8 text-center shadow-sm">
          <TagsIcon className="size-7 text-muted" aria-hidden />
          <p className="text-sm text-muted">{s.cakesEmptyBody}</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {cakeTypes.map((type) => (
            <li key={type.id}>
              <Card className="flex-row items-center justify-between gap-2 p-3 shadow-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{type.name}</div>
                  {type.defaultPrice !== undefined && (
                    <div
                      className="mt-0.5 text-sm font-semibold text-primary"
                      dir="ltr"
                    >
                      {formatCakeAmount(type.defaultPrice)}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={s.editCakeTypeAria}
                    onClick={() => setSheet({ open: true, editing: type })}
                  >
                    <SquarePenIcon className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={s.deleteCakeTypeAria}
                    onClick={() => deleteCakeType(type.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
