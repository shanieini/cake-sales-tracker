import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CakeTracker from "./CakeTracker";

const cakeTypes = [
  { id: "t1", name: "Chocolate cake", defaultPrice: 20 },
  { id: "t2", name: "Lemon cake", defaultPrice: 8 },
];
const sale = {
  id: "s1",
  cakeType: "Lemon cake",
  quantity: 6,
  pricePerUnit: 8,
  date: "2026-08-10",
  createdAt: "2026-08-10T10:00:00.000Z",
};

beforeEach(() => {
  localStorage.setItem("cake-sales:types:v1", JSON.stringify(cakeTypes));
  localStorage.setItem("cake-sales:v1", JSON.stringify([sale]));
});

describe("CakeTracker", () => {
  // End-to-end regression test for the AddSaleSheet stale-state bug,
  // through the real component wiring (not AddSaleSheet in isolation): open
  // "Log Sale", pick a cake type without saving, cancel, then edit the
  // existing (different) sale — and confirm the edit form shows *that*
  // sale's own cake type and price, not the cancelled attempt's. This is
  // what actually exercises CakeTracker's `openSaleSheet` bumping its
  // session key on every open; a regression that dropped `key={sheetSession}`
  // from the AddSaleSheet call site would fail here even though
  // AddSaleSheet's own tests (which supply the key change directly) would
  // still pass.
  it("doesn't carry a cancelled sale's cake type/price into editing a different sale", async () => {
    const user = userEvent.setup();
    render(<CakeTracker />);

    await user.click(screen.getByRole("button", { name: "רישום מכירה" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Chocolate cake" }));
    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(20);
    await user.click(screen.getByRole("button", { name: "ביטול" }));

    await user.click(screen.getByRole("button", { name: "עריכת מכירה" }));

    // Scoped to the dropdown trigger, not the page as a whole — the sale
    // history row behind the (still-open) sheet also says "Lemon cake".
    const cakeTypeField = within(screen.getByRole("combobox"));
    expect(cakeTypeField.getByText("Lemon cake")).toBeInTheDocument();
    expect(cakeTypeField.queryByText("Chocolate cake")).not.toBeInTheDocument();
    expect(screen.getByLabelText("מחיר ליחידה")).toHaveValue(8);
  });
});
