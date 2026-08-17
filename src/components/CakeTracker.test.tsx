import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CakeTracker from "./CakeTracker";
import { addCakeSale, addCakeType, setStoresUser } from "@/lib/store";

beforeEach(() => {
  // No signed-in user in this test environment. `setStoresUser(null)`
  // resets every store's cache to empty (same as a real sign-out), and
  // `addCakeType`/`addCakeSale` below still populate that cache the same
  // optimistic way they do for a real signed-in user — they just skip the
  // Supabase write itself since there's no user id to attach it to (see
  // `src/lib/store.ts`).
  setStoresUser(null);
  addCakeType({ name: "Chocolate cake", defaultPrice: 20 });
  addCakeType({ name: "Lemon cake", defaultPrice: 8 });
  addCakeSale({
    cakeType: "Lemon cake",
    quantity: 6,
    pricePerUnit: 8,
    date: "2026-08-10",
  });
});

describe("CakeTracker", () => {
  // End-to-end regression test for the AddSaleSheet stale-state bug,
  // through the real component wiring (not AddSaleSheet in isolation): open
  // "Log Sale", pick a cake type without saving, cancel, then edit the
  // existing (different) sale — and confirm the edit form shows *that*
  // sale's own cake type and price, not the cancelled attempt's. This is
  // what actually exercises CakeTracker's `openSaleSheet` bumping its
  // session counter on every open; a regression that dropped
  // `formKey={sheetSession}` from the AddSaleSheet call site would fail
  // here even though AddSaleSheet's own tests (which supply the formKey
  // change directly) would still pass.
  it("doesn't carry a cancelled sale's cake type/price into editing a different sale", async () => {
    const user = userEvent.setup();
    render(<CakeTracker />);

    await user.click(screen.getByRole("button", { name: "רישום מכירה" }));
    await user.click(screen.getByRole("combobox", { name: "עוגה" }));
    await user.click(await screen.findByRole("option", { name: "Chocolate cake" }));
    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(20);
    await user.click(screen.getByRole("button", { name: "ביטול" }));

    await user.click(screen.getByRole("button", { name: "עריכת מכירה" }));

    // Scoped to the dropdown trigger, not the page as a whole — the sale
    // history row behind the (still-open) sheet also says "Lemon cake".
    const cakeTypeField = within(screen.getByRole("combobox", { name: "עוגה" }));
    expect(cakeTypeField.getByText("Lemon cake")).toBeInTheDocument();
    expect(cakeTypeField.queryByText("Chocolate cake")).not.toBeInTheDocument();
    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(8);
  });
});
