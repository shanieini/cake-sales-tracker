import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CakeTracker from "./CakeTracker";
import { addCakeSale, addCakeType, setStoresUser } from "@/lib/store";

afterEach(() => {
  vi.restoreAllMocks();
});

/** Logs a Chocolate cake sale through the real "רישום מכירה" form. */
async function logChocolateSale(
  user: ReturnType<typeof userEvent.setup>,
  quantity: number,
) {
  await user.click(screen.getByRole("button", { name: "רישום מכירה" }));
  await user.click(screen.getByRole("combobox", { name: "עוגה" }));
  await user.click(await screen.findByRole("option", { name: "Chocolate cake" }));
  await user.clear(screen.getByLabelText("כמות"));
  await user.type(screen.getByLabelText("כמות"), String(quantity));
  await user.click(screen.getByRole("button", { name: "הוספת מכירה" }));
}

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

  it("pops the celebration up after a new sale, with what was sold, until it's dismissed", async () => {
    // Pins the random pick to the first phrase.
    vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    render(<CakeTracker salePopupEnabled />);

    await logChocolateSale(user, 60);

    const popup = await screen.findByRole("dialog", { name: "יא מוסס זין" });
    expect(within(popup).getByText("Chocolate cake × 60")).toBeInTheDocument();
    expect(within(popup).getByText("₪1,200.00")).toBeInTheDocument();
    // The first emoji in the list: the animated middle finger.
    expect(within(popup).getByRole("img", { name: "אצבע משולשת" })).toHaveAttribute(
      "src",
      "/celebrations/1f595.webp",
    );
    expect(screen.getByTestId("confetti")).toBeInTheDocument();

    await user.click(within(popup).getByRole("button", { name: "יאללה" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "יא מוסס זין" })).not.toBeInTheDocument(),
    );
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
  });

  it("gives two sales in a row two different phrases and two different emoji", async () => {
    // Always the first option: the first phrase and emoji, then (with those
    // ruled out as repeats) the second of each.
    vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    render(<CakeTracker salePopupEnabled />);

    await logChocolateSale(user, 1);
    const first = await screen.findByRole("dialog", { name: "יא מוסס זין" });
    expect(within(first).getByRole("img", { name: "אצבע משולשת" })).toBeInTheDocument();
    await user.click(within(first).getByRole("button", { name: "יאללה" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "יא מוסס זין" })).not.toBeInTheDocument(),
    );

    await logChocolateSale(user, 2);
    const second = await screen.findByRole("dialog", { name: "יא אוכל בתחת" });
    expect(
      within(second).getByRole("img", { name: "שתי אצבעות משולשות" }),
    ).toBeInTheDocument();
  });

  it("doesn't pop the celebration up after editing an existing sale", async () => {
    const user = userEvent.setup();
    render(<CakeTracker salePopupEnabled />);

    await user.click(screen.getByRole("button", { name: "עריכת מכירה" }));
    await user.click(screen.getByRole("button", { name: "שמירת שינויים" }));

    expect(screen.queryByRole("dialog", { name: "יא מוסס זין" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
  });

  // The popup is switched off for now (SALE_POPUP_ENABLED in
  // src/lib/features.ts): a new sale is logged as usual, with no popup.
  it("logs a new sale without any popup while the popup is switched off", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    render(<CakeTracker />);

    await logChocolateSale(user, 3);

    // 6 cakes in the fixture sale, plus these 3.
    expect(await screen.findByText("9 עוגות נמכרו עד כה")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "יא מוסס זין" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    expect(screen.queryByTestId("celebration-hero")).not.toBeInTheDocument();
  });
});
