import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddSaleSheet from "./AddSaleSheet";
import type { CakeSale, CakeType } from "@/lib/types";

const cakeTypes: CakeType[] = [
  { id: "t1", name: "Chocolate cake", defaultPrice: 20 },
  { id: "t2", name: "Lemon cake", defaultPrice: 8 },
  { id: "t3", name: "Custom order" },
];

function makeSale(overrides: Partial<CakeSale> = {}): CakeSale {
  return {
    id: "s1",
    cakeType: "Lemon cake",
    quantity: 6,
    pricePerUnit: 8,
    date: "2026-08-10",
    createdAt: "2026-08-10T10:00:00.000Z",
    ...overrides,
  };
}

function renderSheet(
  props: Partial<React.ComponentProps<typeof AddSaleSheet>> & { key?: string } = {},
) {
  const { key, ...rest } = props;
  return render(
    <AddSaleSheet
      key={key}
      open={true}
      editing={null}
      cakeTypes={cakeTypes}
      onOpenChange={() => {}}
      onSave={() => {}}
      onManageCakeTypes={() => {}}
      {...rest}
    />,
  );
}

describe("AddSaleSheet", () => {
  // AddSaleSheet's own cakeTypeName/price state only ever starts correct
  // because CakeTracker gives it a fresh `key` on every open (see
  // CakeTracker's `openSaleSheet`) — that's the actual fix for a real bug:
  // without a key change, this component doesn't unmount between sheet
  // opens, so switching which sale is being edited left the previous
  // sale's cake type and price sitting in the form, looking like valid
  // input for the new target and silently overwriting it on save. This
  // test exercises AddSaleSheet's half of that contract — that a fresh
  // mount always reflects its own `editing` prop correctly, never a
  // previous instance's leftover state.
  it("shows the sale being edited, not a previous mount's leftover values, once given a fresh key", () => {
    const saleA = makeSale({ id: "a", cakeType: "Chocolate cake", pricePerUnit: 20 });
    const saleB = makeSale({ id: "b", cakeType: "Lemon cake", pricePerUnit: 8 });

    const { rerender } = renderSheet({ key: "a", editing: saleA });
    expect(screen.getByText("Chocolate cake")).toBeInTheDocument();
    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(20);

    // A different `key`, exactly like CakeTracker bumping its session
    // counter on every open — React tears down the old instance and
    // mounts a fresh one instead of reusing it with new props.
    rerender(
      <AddSaleSheet
        key="b"
        open={true}
        editing={saleB}
        cakeTypes={cakeTypes}
        onOpenChange={() => {}}
        onSave={() => {}}
        onManageCakeTypes={() => {}}
      />,
    );

    expect(screen.getByText("Lemon cake")).toBeInTheDocument();
    expect(screen.queryByText("Chocolate cake")).not.toBeInTheDocument();
    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(8);
  });

  it("rejects a blank price instead of silently saving a ₪0 sale", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderSheet({ editing: makeSale(), onSave });

    // The sale's price starts filled in (8); clear it before submitting.
    // `fireEvent.change`, not `userEvent.clear` — `type="number"` inputs
    // don't support the text selection `clear()` relies on internally.
    const priceInput = screen.getByLabelText("מחיר ליחידה");
    fireEvent.change(priceInput, { target: { value: "" } });
    await user.click(screen.getByRole("button", { name: "שמירת שינויים" }));

    expect(await screen.findByText("המחיר לא יכול להיות שלילי.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("clears the price field when switching to a cake type with no default price", async () => {
    const user = userEvent.setup();
    renderSheet({ editing: makeSale() }); // starts on Lemon cake, price 8

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Custom order" }));

    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(null);
  });
});
