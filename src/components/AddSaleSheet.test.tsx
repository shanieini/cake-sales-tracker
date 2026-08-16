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

function renderSheet(props: Partial<React.ComponentProps<typeof AddSaleSheet>> = {}) {
  return render(
    <AddSaleSheet
      formKey={0}
      open={true}
      editing={null}
      cakeTypes={cakeTypes}
      onOpenChange={() => {}}
      onSave={() => {}}
      onManageCakeTypes={() => {}}
      {...props}
    />,
  );
}

describe("AddSaleSheet", () => {
  // Regression test for two things at once, both from the same fix:
  // 1. (a real bug) SaleForm's cakeTypeName/price are controlled state
  //    seeded once via useState(editing?...) — without a fresh mount per
  //    open, switching which sale is being edited left the previous
  //    sale's cake type and price sitting in the form, looking like valid
  //    input for the new target and silently overwriting it on save.
  // 2. (a regression an earlier version of this fix introduced) keying
  //    the *whole* AddSaleSheet — Drawer/Dialog chrome included — to force
  //    that remount broke the sheet's open/close animation, since a fresh
  //    Drawer instance mounts already-open in one commit instead of
  //    transitioning from closed to open across two. `formKey` only
  //    remounts the inner SaleForm now, so the Drawer/Dialog DOM node
  //    itself should be the exact same node across a formKey change.
  it("resets the form on a formKey bump without remounting the Drawer around it", () => {
    const saleA = makeSale({ id: "a", cakeType: "Chocolate cake", pricePerUnit: 20 });
    const saleB = makeSale({ id: "b", cakeType: "Lemon cake", pricePerUnit: 8 });

    const { rerender } = renderSheet({ formKey: 1, editing: saleA });
    expect(screen.getByText("Chocolate cake")).toBeInTheDocument();
    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(20);
    const drawerBefore = document.querySelector('[data-slot="drawer-popup"]');
    expect(drawerBefore).not.toBeNull();

    // A different `formKey`, exactly like CakeTracker bumping its session
    // counter on every open.
    rerender(
      <AddSaleSheet
        formKey={2}
        open={true}
        editing={saleB}
        cakeTypes={cakeTypes}
        onOpenChange={() => {}}
        onSave={() => {}}
        onManageCakeTypes={() => {}}
      />,
    );

    // Same Drawer DOM node — not torn down and recreated.
    expect(document.querySelector('[data-slot="drawer-popup"]')).toBe(drawerBefore);
    // But the form inside it reflects the new sale, not the old one.
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

    await user.click(screen.getByRole("combobox", { name: "עוגה" }));
    await user.click(await screen.findByRole("option", { name: "Custom order" }));

    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(null);
  });

  it("defaults a new sale's payment method to cash and submits whichever one is picked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderSheet({ onSave });

    expect(screen.getByRole("combobox", { name: "אמצעי תשלום" })).toHaveTextContent(
      "מזומן",
    );

    await user.click(screen.getByRole("combobox", { name: "עוגה" }));
    await user.click(await screen.findByRole("option", { name: "Chocolate cake" }));
    await user.click(screen.getByRole("combobox", { name: "אמצעי תשלום" }));
    await user.click(await screen.findByRole("option", { name: "ביט" }));
    await user.click(screen.getByRole("button", { name: "הוספת מכירה" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethod: "bit" }),
    );
  });

  it("preserves an existing sale's payment method when editing it", () => {
    renderSheet({ editing: makeSale({ paymentMethod: "bank_transfer" }) });

    expect(screen.getByRole("combobox", { name: "אמצעי תשלום" })).toHaveTextContent(
      "העברה בנקאית",
    );
  });
});
