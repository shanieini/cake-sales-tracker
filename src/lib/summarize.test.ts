import { describe, expect, it } from "vitest";
import {
  formatCakeAmount,
  formatMonthLabel,
  groupExpensesByDay,
  groupSalesByDay,
  saleTotal,
  summarizeByCakeType,
  summarizeByMonth,
  summarizeByYear,
  summarizeCakeExpenses,
  summarizeCakeSales,
  summarizeProfitByMonth,
  summarizeProfitByYear,
  toIsoDate,
} from "./summarize";
import type { CakeExpense, CakeSale } from "./types";

let nextId = 1;
function makeSale(overrides: Partial<CakeSale> = {}): CakeSale {
  const id = String(nextId++);
  return {
    id,
    cakeType: "Chocolate cake",
    quantity: 1,
    pricePerUnit: 20,
    date: "2026-08-15",
    createdAt: `2026-08-15T10:0${id}:00.000Z`,
    ...overrides,
  };
}

let nextExpenseId = 1;
function makeExpense(overrides: Partial<CakeExpense> = {}): CakeExpense {
  const id = String(nextExpenseId++);
  return {
    id,
    description: "Flour and sugar",
    category: "ingredients",
    amount: 50,
    date: "2026-08-15",
    createdAt: `2026-08-15T11:0${id}:00.000Z`,
    ...overrides,
  };
}

describe("saleTotal", () => {
  it("multiplies quantity by price per unit", () => {
    expect(saleTotal({ quantity: 3, pricePerUnit: 15 })).toBe(45);
  });

  it("rounds to cents", () => {
    expect(saleTotal({ quantity: 3, pricePerUnit: 0.1 })).toBe(0.3);
  });
});

describe("formatCakeAmount", () => {
  it("prefixes the amount with the shekel sign, two decimals", () => {
    expect(formatCakeAmount(12.5)).toBe("₪12.50");
  });

  it("rounds display to two decimals without changing the value", () => {
    expect(formatCakeAmount(0.1 + 0.2)).toBe("₪0.30");
  });
});

describe("toIsoDate", () => {
  it("formats as YYYY-MM-DD in local time", () => {
    expect(toIsoDate(new Date(2026, 7, 5))).toBe("2026-08-05");
  });
});

describe("summarizeCakeSales", () => {
  const today = new Date(2026, 7, 15); // 2026-08-15

  it("returns all zeros for no sales", () => {
    const summary = summarizeCakeSales([], today);
    expect(summary).toEqual({
      todayRevenue: 0,
      todayCount: 0,
      weekRevenue: 0,
      monthRevenue: 0,
      allTimeRevenue: 0,
      allTimeCount: 0,
      topSeller: null,
    });
  });

  it("counts a sale from today in today, week, and month", () => {
    const sale = makeSale({ date: "2026-08-15", quantity: 2, pricePerUnit: 10 });
    const summary = summarizeCakeSales([sale], today);
    expect(summary.todayRevenue).toBe(20);
    expect(summary.todayCount).toBe(2);
    expect(summary.weekRevenue).toBe(20);
    expect(summary.monthRevenue).toBe(20);
    expect(summary.allTimeRevenue).toBe(20);
  });

  it("excludes a sale from 8 days ago from the week total", () => {
    const sale = makeSale({ date: "2026-08-07" }); // 8 days before 2026-08-15
    const summary = summarizeCakeSales([sale], today);
    expect(summary.weekRevenue).toBe(0);
    expect(summary.monthRevenue).toBe(sale.pricePerUnit);
    expect(summary.allTimeRevenue).toBe(sale.pricePerUnit);
  });

  it("includes a sale from exactly 6 days ago in the week total", () => {
    const sale = makeSale({ date: "2026-08-09" }); // 6 days before 2026-08-15
    const summary = summarizeCakeSales([sale], today);
    expect(summary.weekRevenue).toBe(sale.pricePerUnit);
  });

  it("excludes last month's sale from the month total", () => {
    const sale = makeSale({ date: "2026-07-31" });
    const summary = summarizeCakeSales([sale], today);
    expect(summary.monthRevenue).toBe(0);
    expect(summary.allTimeRevenue).toBe(sale.pricePerUnit);
  });

  it("picks the cake type with the most units sold as the top seller", () => {
    const sales = [
      makeSale({ cakeType: "Chocolate cake", quantity: 3 }),
      makeSale({ cakeType: "Lemon cake", quantity: 5 }),
      makeSale({ cakeType: "Chocolate cake", quantity: 1 }),
    ];
    const summary = summarizeCakeSales(sales, today);
    expect(summary.topSeller).toEqual({ cakeType: "Lemon cake", quantity: 5 });
  });
});

describe("groupSalesByDay", () => {
  it("returns an empty array for no sales", () => {
    expect(groupSalesByDay([])).toEqual([]);
  });

  it("groups sales that share a date", () => {
    const a = makeSale({ date: "2026-08-15" });
    const b = makeSale({ date: "2026-08-15" });
    const groups = groupSalesByDay([a, b]);
    expect(groups).toHaveLength(1);
    expect(groups[0].date).toBe("2026-08-15");
    expect(groups[0].sales.map((s) => s.id)).toEqual(
      [a, b].sort((x, y) => y.createdAt.localeCompare(x.createdAt)).map((s) => s.id),
    );
  });

  it("orders days most recent first", () => {
    const early = makeSale({ date: "2026-08-01" });
    const late = makeSale({ date: "2026-08-10" });
    const groups = groupSalesByDay([early, late]);
    expect(groups.map((g) => g.date)).toEqual(["2026-08-10", "2026-08-01"]);
  });
});

describe("formatMonthLabel", () => {
  it("formats a YYYY-MM key as a short month + year", () => {
    // he-IL's short-month form for August; assert loosely on shape rather
    // than the exact Hebrew string (ICU data can render it a couple of
    // equally-correct ways) — it must at least carry the year.
    expect(formatMonthLabel("2026-08")).toContain("2026");
  });
});

describe("summarizeByMonth", () => {
  it("returns an empty array for no sales", () => {
    expect(summarizeByMonth([])).toEqual([]);
  });

  it("sums revenue and cake count within a month", () => {
    const sales = [
      makeSale({ date: "2026-08-02", quantity: 2, pricePerUnit: 10 }),
      makeSale({ date: "2026-08-20", quantity: 3, pricePerUnit: 10 }),
    ];
    const months = summarizeByMonth(sales);
    expect(months).toHaveLength(1);
    expect(months[0].key).toBe("2026-08");
    expect(months[0].revenue).toBe(50);
    expect(months[0].count).toBe(5);
  });

  it("picks each month's own top seller, independent of other months", () => {
    const sales = [
      // August: chocolate wins.
      makeSale({ date: "2026-08-02", cakeType: "Chocolate cake", quantity: 5 }),
      makeSale({ date: "2026-08-05", cakeType: "Lemon cake", quantity: 2 }),
      // September: lemon wins.
      makeSale({ date: "2026-09-02", cakeType: "Chocolate cake", quantity: 1 }),
      makeSale({ date: "2026-09-05", cakeType: "Lemon cake", quantity: 4 }),
    ];
    const months = summarizeByMonth(sales);
    const august = months.find((m) => m.key === "2026-08");
    const september = months.find((m) => m.key === "2026-09");
    expect(august?.topSeller).toEqual({ cakeType: "Chocolate cake", quantity: 5 });
    expect(september?.topSeller).toEqual({ cakeType: "Lemon cake", quantity: 4 });
  });

  it("keeps different months separate, oldest first", () => {
    const sales = [
      makeSale({ date: "2026-08-01", quantity: 1, pricePerUnit: 10 }),
      makeSale({ date: "2026-06-01", quantity: 1, pricePerUnit: 10 }),
      makeSale({ date: "2026-07-01", quantity: 1, pricePerUnit: 10 }),
    ];
    const months = summarizeByMonth(sales);
    expect(months.map((m) => m.key)).toEqual(["2026-06", "2026-07", "2026-08"]);
  });
});

describe("summarizeByYear", () => {
  it("returns an empty array for no sales", () => {
    expect(summarizeByYear([])).toEqual([]);
  });

  it("sums revenue and cake count within a year, oldest first", () => {
    const sales = [
      makeSale({ date: "2025-12-31", quantity: 1, pricePerUnit: 10 }),
      makeSale({ date: "2026-01-01", quantity: 2, pricePerUnit: 10 }),
      makeSale({ date: "2026-06-01", quantity: 3, pricePerUnit: 10 }),
    ];
    const years = summarizeByYear(sales);
    expect(years.map((y) => y.key)).toEqual(["2025", "2026"]);
    expect(years[0]).toMatchObject({ revenue: 10, count: 1 });
    expect(years[1]).toMatchObject({ revenue: 50, count: 5 });
  });

  it("picks each year's own top seller", () => {
    const sales = [
      makeSale({ date: "2025-06-01", cakeType: "Chocolate cake", quantity: 2 }),
      makeSale({ date: "2026-06-01", cakeType: "Chocolate cake", quantity: 1 }),
      makeSale({ date: "2026-07-01", cakeType: "Lemon cake", quantity: 6 }),
    ];
    const years = summarizeByYear(sales);
    expect(years.find((y) => y.key === "2025")?.topSeller).toEqual({
      cakeType: "Chocolate cake",
      quantity: 2,
    });
    expect(years.find((y) => y.key === "2026")?.topSeller).toEqual({
      cakeType: "Lemon cake",
      quantity: 6,
    });
  });
});

describe("summarizeByCakeType", () => {
  it("returns an empty array for no sales", () => {
    expect(summarizeByCakeType([])).toEqual([]);
  });

  it("sums quantity and revenue per cake type, most units first", () => {
    const sales = [
      makeSale({ cakeType: "Chocolate cake", quantity: 3, pricePerUnit: 20 }),
      makeSale({ cakeType: "Lemon cake", quantity: 5, pricePerUnit: 10 }),
      makeSale({ cakeType: "Chocolate cake", quantity: 1, pricePerUnit: 20 }),
    ];
    expect(summarizeByCakeType(sales)).toEqual([
      { cakeType: "Lemon cake", quantity: 5, revenue: 50 },
      { cakeType: "Chocolate cake", quantity: 4, revenue: 80 },
    ]);
  });
});

describe("summarizeProfitByMonth", () => {
  it("returns an empty array for no sales and no expenses", () => {
    expect(summarizeProfitByMonth([], [])).toEqual([]);
  });

  it("nets revenue against expenses within the same month", () => {
    const sales = [makeSale({ date: "2026-08-02", quantity: 2, pricePerUnit: 20 })];
    const expenses = [makeExpense({ date: "2026-08-10", amount: 15 })];
    const months = summarizeProfitByMonth(sales, expenses);
    expect(months).toEqual([
      { key: "2026-08", label: expect.any(String), revenue: 40, expenses: 15, net: 25 },
    ]);
  });

  it("includes an expense-only month with a negative net, not a gap", () => {
    const expenses = [makeExpense({ date: "2026-07-01", amount: 40 })];
    const months = summarizeProfitByMonth([], expenses);
    expect(months).toHaveLength(1);
    expect(months[0]).toMatchObject({ key: "2026-07", revenue: 0, expenses: 40, net: -40 });
  });

  it("keeps different months separate, oldest first", () => {
    const sales = [
      makeSale({ date: "2026-08-01", quantity: 1, pricePerUnit: 10 }),
      makeSale({ date: "2026-06-01", quantity: 1, pricePerUnit: 10 }),
    ];
    const months = summarizeProfitByMonth(sales, []);
    expect(months.map((m) => m.key)).toEqual(["2026-06", "2026-08"]);
  });
});

describe("summarizeProfitByYear", () => {
  it("returns an empty array for no sales and no expenses", () => {
    expect(summarizeProfitByYear([], [])).toEqual([]);
  });

  it("nets revenue against expenses within the same year", () => {
    const sales = [makeSale({ date: "2026-03-01", quantity: 3, pricePerUnit: 10 })];
    const expenses = [makeExpense({ date: "2026-11-01", amount: 12 })];
    const years = summarizeProfitByYear(sales, expenses);
    expect(years).toEqual([
      { key: "2026", label: "2026", revenue: 30, expenses: 12, net: 18 },
    ]);
  });
});

describe("groupExpensesByDay", () => {
  it("returns an empty array for no expenses", () => {
    expect(groupExpensesByDay([])).toEqual([]);
  });

  it("groups expenses that share a date, orders days most recent first", () => {
    const early = makeExpense({ date: "2026-08-01" });
    const late = makeExpense({ date: "2026-08-10" });
    const groups = groupExpensesByDay([early, late]);
    expect(groups.map((g) => g.date)).toEqual(["2026-08-10", "2026-08-01"]);
  });
});

describe("summarizeCakeExpenses", () => {
  const today = new Date(2026, 7, 15); // 2026-08-15

  it("returns all zeros and no categories for no expenses", () => {
    const summary = summarizeCakeExpenses([], today);
    expect(summary).toEqual({
      todayTotal: 0,
      weekTotal: 0,
      monthTotal: 0,
      allTimeTotal: 0,
      byCategory: [],
    });
  });

  it("counts a today expense in today, week, and month", () => {
    const expense = makeExpense({ date: "2026-08-15", amount: 40 });
    const summary = summarizeCakeExpenses([expense], today);
    expect(summary.todayTotal).toBe(40);
    expect(summary.weekTotal).toBe(40);
    expect(summary.monthTotal).toBe(40);
    expect(summary.allTimeTotal).toBe(40);
  });

  it("excludes an expense from 8 days ago from the week total", () => {
    const expense = makeExpense({ date: "2026-08-07", amount: 40 });
    const summary = summarizeCakeExpenses([expense], today);
    expect(summary.weekTotal).toBe(0);
    expect(summary.monthTotal).toBe(40);
    expect(summary.allTimeTotal).toBe(40);
  });

  it("excludes last month's expense from the month total", () => {
    const expense = makeExpense({ date: "2026-07-31", amount: 40 });
    const summary = summarizeCakeExpenses([expense], today);
    expect(summary.monthTotal).toBe(0);
    expect(summary.allTimeTotal).toBe(40);
  });

  it("breaks totals down by category, largest first", () => {
    const expenses = [
      makeExpense({ category: "ingredients", amount: 30 }),
      makeExpense({ category: "packaging", amount: 90 }),
      makeExpense({ category: "ingredients", amount: 20 }),
    ];
    const summary = summarizeCakeExpenses(expenses, today);
    expect(summary.byCategory).toEqual([
      { category: "packaging", total: 90 },
      { category: "ingredients", total: 50 },
    ]);
  });
});
