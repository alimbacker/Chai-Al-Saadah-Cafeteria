import { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutDashboard, Utensils, ClipboardList, Package, BarChart3, Settings as SettingsIcon,
  ChefHat, LogOut, Search, Plus, Minus, Trash2, X, Printer, Mail, MessageCircle,
  CreditCard, Banknote, Smartphone, Clock, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, Wallet, Users, ShoppingBag, Percent, Hash, User, Pause, Play, Pencil,
  Save, Flame, Bell, Moon, Sun, RotateCcw, FileSpreadsheet, Download, Eye, Phone,
  MapPin, Store, Coins, Calendar, Layers, Coffee, Search as SearchIcon, FileText, Receipt as ReceiptIcon, Lock, TrendingDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  CartesianGrid, AreaChart, Area,
} from "recharts";
import * as XLSX from "xlsx";

/* ----------------------------------------------------------------------------
   CHAI AL SAADAH CAFETERIA — Smart Billing & Restaurant Management (POS)
   Single-file React front-end. All data is in-memory for this session.
---------------------------------------------------------------------------- */

const VAT_RATE = 0.05; // 5% UAE VAT (prices are VAT-inclusive, like the printed invoice)

const RESTAURANT_DEFAULT = {
  name: "CHAI AL SAADAH CAFETERIA LLC",
  arabicName: "كافتيريا شاي السعادة ذ م م",
  address1: "Rul Dhadna, Dhana, Dibba Road",
  address2: "Dadnah, Fujairah, UAE",
  phone1: "+971 52 529 1962",
  phone2: "+971 52 524 0845",
  vat: "105182070000001",
  license: "09883 — Dibba Municipality",
  currency: "AED",
  servicePct: 0,
  receiptHeader: "Tax Invoice  •  فاتورة ضريبية",
  receiptFooter: "Thank you — Dhanyabad — شكراً لكم  •  Visit again!",
};

/* ----------------------------- MENU DATA ---------------------------------- */
/* Imported from the uploaded menu (prices in AED, VAT-inclusive).            */

const CATEGORIES = [
  { id: "soup", name: "Soup", emoji: "🍲" },
  { id: "chaat", name: "Chaat", emoji: "🫓" },
  { id: "sandwich", name: "Sandwich", emoji: "🥪" },
  { id: "sukuti", name: "Sukuti", emoji: "🍖" },
  { id: "burger", name: "Burger", emoji: "🍔" },
  { id: "cmomo", name: "Chicken Momo", emoji: "🥟" },
  { id: "vmomo", name: "Veg Momo", emoji: "🥟" },
  { id: "bmomo", name: "Buff Momo", emoji: "🥟" },
  { id: "chowmein", name: "Chowmein", emoji: "🍜" },
  { id: "rice", name: "Fried Rice", emoji: "🍚" },
  { id: "special", name: "Chicken Special", emoji: "🍗" },
  { id: "curry", name: "Curry & Sides", emoji: "🍛" },
  { id: "thakali", name: "Thakali Sets", emoji: "🍱" },
  { id: "shake", name: "Milkshakes", emoji: "🥤" },
  { id: "juice", name: "Fresh Juice", emoji: "🧃" },
];

const RAW_MENU = [
  // Soup
  ["Chicken Soup", "soup", 10], ["Veg Soup", "soup", 8], ["Sweet Corn Chicken Soup", "soup", 11],
  // Chaat
  ["Samosa Chaat", "chaat", 8], ["Mix Chaat", "chaat", 8], ["Chatpat", "chaat", 10],
  ["Panipuri", "chaat", 6], ["Papdi Chaat", "chaat", 8], ["Alo Paratha", "chaat", 4], ["Samosa", "chaat", 1],
  // Sandwich
  ["Chicken Chilly Sandwich", "sandwich", 5], ["Beef Sandwich", "sandwich", 6],
  ["Omelette Sandwich", "sandwich", 4], ["Zinger Sandwich", "sandwich", 11],
  // Sukuti
  ["Sukuti Fry", "sukuti", 20], ["Sukuti Sadheko", "sukuti", 20],
  // Burger
  ["Chicken Burger", "burger", 8], ["Beef Burger", "burger", 13], ["Zinger Burger", "burger", 15],
  // Chicken Momo
  ["Steam Chicken Momo", "cmomo", 13], ["Jhol Chicken Momo", "cmomo", 15], ["Fry Chicken Momo", "cmomo", 15],
  // Veg Momo
  ["Steam Veg Momo", "vmomo", 12], ["Jhol Veg Momo", "vmomo", 14], ["Fry Veg Momo", "vmomo", 14],
  // Buff Momo
  ["Steam Buff Momo", "bmomo", 15], ["Jhol Buff Momo", "bmomo", 18], ["Fry Buff Momo", "bmomo", 18],
  // Chowmein
  ["Veg Chowmein", "chowmein", 12], ["Egg Chowmein", "chowmein", 13], ["Chicken Chowmein", "chowmein", 15],
  ["Buff Chowmein", "chowmein", 17], ["Mix Chowmein", "chowmein", 20], ["Egg Wai Wai", "chowmein", 7],
  ["Chicken Wai Wai", "chowmein", 9],
  // Fried Rice
  ["Veg Fried Rice", "rice", 13], ["Chicken Fried Rice", "rice", 15], ["Buff Fried Rice", "rice", 18],
  ["Egg Fried Rice", "rice", 15], ["White Rice", "rice", 6],
  // Chicken Special
  ["Chicken 65", "special", 14], ["Chicken Chilly", "special", 14],
  // Curry & Sides
  ["Chicken Curry (Small)", "curry", 8], ["Chicken Curry (Big)", "curry", 12],
  ["Beef Curry (Small)", "curry", 10], ["Beef Curry (Big)", "curry", 14],
  ["Paneer Masala", "curry", 10], ["Egg Masala", "curry", 7], ["Chicken Schezwan Noodles", "curry", 20],
  ["Chicken Thopa", "curry", 12], ["Veg Thop", "curry", 10],
  // Thakali Sets
  ["Veg Thakali Set", "thakali", 16], ["Chicken Thakali Set", "thakali", 20],
  ["Buff Thakali Set", "thakali", 22], ["Mutton Thakali Set", "thakali", 28],
  // Milkshakes
  ["Dairy Milkshake", "shake", 11], ["Kitket Milkshake", "shake", 11], ["Oreo Milkshake", "shake", 11],
  // Fresh Juice (S/M/B)
  ["Avocado Juice (S)", "juice", 7], ["Avocado Juice (M)", "juice", 10], ["Avocado Juice (B)", "juice", 12],
  ["Banana Juice (S)", "juice", 6], ["Banana Juice (M)", "juice", 8], ["Banana Juice (B)", "juice", 10],
  ["Strawberry Juice (S)", "juice", 7], ["Strawberry Juice (M)", "juice", 10], ["Strawberry Juice (B)", "juice", 12],
  ["Orange Juice (S)", "juice", 7], ["Orange Juice (M)", "juice", 10], ["Orange Juice (B)", "juice", 12],
  ["Lemon Mint (S)", "juice", 7], ["Lemon Mint (M)", "juice", 10], ["Lemon Mint (B)", "juice", 12],
];

const INITIAL_ITEMS = RAW_MENU.map((m, i) => ({
  id: "I" + i,
  name: m[0],
  cat: m[1],
  price: m[2],
  cost: +(m[2] * 0.4).toFixed(2), // demo cost — editable in Menu management
  available: true,
}));

// Bestsellers — surfaced first so the items rung up most often are one tap away.
const POPULAR = new Set([
  "Steam Chicken Momo", "Steam Buff Momo", "Chicken Chowmein", "Mix Chowmein",
  "Chicken Fried Rice", "Chicken Burger", "Zinger Burger", "Chicken Thakali Set",
  "Chicken 65", "Dairy Milkshake", "Oreo Milkshake", "Lemon Mint (M)",
]);

/* --------------------------- INVENTORY DATA -------------------------------- */
const INITIAL_INVENTORY = [
  { id: "R1", name: "Rice", unit: "kg", stock: 40, min: 10, cost: 4.2 },
  { id: "R2", name: "Chicken", unit: "kg", stock: 25, min: 8, cost: 16 },
  { id: "R3", name: "Buff", unit: "kg", stock: 18, min: 6, cost: 22 },
  { id: "R4", name: "Mutton", unit: "kg", stock: 10, min: 4, cost: 34 },
  { id: "R5", name: "Vegetables", unit: "kg", stock: 22, min: 6, cost: 5 },
  { id: "R6", name: "Cooking Oil", unit: "L", stock: 30, min: 8, cost: 8 },
  { id: "R7", name: "Milk", unit: "L", stock: 24, min: 8, cost: 3.5 },
  { id: "R8", name: "Tea Powder", unit: "kg", stock: 8, min: 2, cost: 18 },
  { id: "R9", name: "Coffee Powder", unit: "kg", stock: 5, min: 1.5, cost: 26 },
  { id: "R10", name: "Sugar", unit: "kg", stock: 20, min: 5, cost: 2.6 },
  { id: "R11", name: "Flour", unit: "kg", stock: 35, min: 10, cost: 2.8 },
  { id: "R12", name: "Paneer", unit: "kg", stock: 6, min: 2, cost: 14 },
  { id: "R13", name: "Eggs", unit: "pcs", stock: 180, min: 40, cost: 0.6 },
  { id: "R14", name: "Burger Bun", unit: "pcs", stock: 60, min: 20, cost: 1.2 },
  { id: "R15", name: "Noodles", unit: "kg", stock: 15, min: 5, cost: 6 },
  { id: "R16", name: "Bread", unit: "pcs", stock: 40, min: 15, cost: 0.9 },
];

// Simplified recipe mapping for auto-deduction (demo).
function getRecipe(item) {
  const n = item.name;
  const out = [];
  const protein = () => {
    if (/Chicken/i.test(n)) out.push(["Chicken", 0.1]);
    if (/Buff|Beef/i.test(n)) out.push(["Buff", 0.1]);
    if (/Mutton/i.test(n)) out.push(["Mutton", 0.12]);
  };
  switch (item.cat) {
    case "cmomo": out.push(["Flour", 0.12], ["Chicken", 0.1]); break;
    case "vmomo": out.push(["Flour", 0.12], ["Vegetables", 0.08]); break;
    case "bmomo": out.push(["Flour", 0.12], ["Buff", 0.1]); break;
    case "rice": out.push(["Rice", 0.15], ["Cooking Oil", 0.03]); protein(); break;
    case "chowmein": out.push(["Noodles", 0.12], ["Vegetables", 0.05], ["Cooking Oil", 0.03]); protein(); break;
    case "special": out.push(["Chicken", 0.18], ["Cooking Oil", 0.04]); break;
    case "curry": out.push(["Cooking Oil", 0.03], ["Vegetables", 0.05]); protein();
      if (/Paneer/i.test(n)) out.push(["Paneer", 0.12]);
      if (/Egg/i.test(n)) out.push(["Eggs", 2]); break;
    case "thakali": out.push(["Rice", 0.2], ["Vegetables", 0.08]); protein(); break;
    case "shake": out.push(["Milk", 0.2], ["Sugar", 0.03]); break;
    case "soup": out.push(["Vegetables", 0.06]); protein(); break;
    case "burger": out.push(["Burger Bun", 1]); protein(); break;
    case "sandwich": out.push(["Bread", 2]); protein(); break;
    case "chaat": out.push(["Flour", 0.05]); break;
    case "sukuti": out.push(["Buff", 0.12]); break;
    case "juice": out.push(["Sugar", 0.02]); break;
    default: break;
  }
  // merge from helper pushes that used out via protein()
  const map = {};
  out.forEach(([k, v]) => { map[k] = (map[k] || 0) + v; });
  return Object.entries(map).map(([name, qty]) => ({ name, qty }));
}

/* ----------------------------- HELPERS ------------------------------------ */
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const aed = (n) => "AED " + round2(n).toFixed(2);
const money = (n) => round2(n).toFixed(2);

function computeTotals(lines, discountMode, discountValue, serviceOn, servicePct) {
  const grossSubtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  let discountAmt = discountMode === "percent"
    ? grossSubtotal * ((Number(discountValue) || 0) / 100)
    : Math.min(Number(discountValue) || 0, grossSubtotal);
  discountAmt = round2(discountAmt);
  const afterDiscount = Math.max(0, grossSubtotal - discountAmt);
  const serviceAmt = serviceOn ? round2(afterDiscount * (servicePct / 100)) : 0;
  const grandTotal = round2(afterDiscount + serviceAmt);
  const netAmount = round2(grandTotal / (1 + VAT_RATE));
  const vatAmount = round2(grandTotal - netAmount);
  const cogs = round2(lines.reduce((s, l) => s + (l.cost || 0) * l.qty, 0));
  const profit = round2(netAmount - cogs);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  return { grossSubtotal: round2(grossSubtotal), discountAmt, serviceAmt, grandTotal, netAmount, vatAmount, cogs, profit, itemCount };
}

function todayAt(h, m) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// Build sample "today" orders so the dashboard & reports are alive on first load.
function seedOrders() {
  const find = (name) => INITIAL_ITEMS.find((i) => i.name === name);
  const lineOf = (name, qty) => { const it = find(name); return { itemId: it.id, name: it.name, price: it.price, cost: it.cost, qty }; };
  const recipe = [
    { h: 8, m: 35, picks: [["Steam Chicken Momo", 2], ["Chicken Soup", 1]], pay: "Cash", type: "Dine In", table: "4", status: "Completed", cust: "Ramesh" },
    { h: 9, m: 15, picks: [["Chicken Fried Rice", 1], ["Avocado Juice (M)", 1]], pay: "Card", type: "Take Away", table: "", status: "Completed", cust: "Walk-in" },
    { h: 10, m: 40, picks: [["Buff Thakali Set", 1], ["Veg Thakali Set", 1]], pay: "UPI", type: "Dine In", table: "2", status: "Completed", cust: "Sita" },
    { h: 11, m: 20, picks: [["Chicken Chowmein", 2], ["Oreo Milkshake", 2]], pay: "Cash", type: "Delivery", table: "", status: "Completed", cust: "Bibek" },
    { h: 12, m: 5, picks: [["Zinger Burger", 1], ["Chicken Burger", 1], ["Banana Juice (S)", 2]], pay: "Card", type: "Dine In", table: "6", status: "Completed", cust: "Anita" },
    { h: 12, m: 50, picks: [["Mutton Thakali Set", 1], ["Sukuti Fry", 1]], pay: "Cash", type: "Dine In", table: "1", status: "Completed", cust: "Hari" },
    { h: 13, m: 30, picks: [["Jhol Buff Momo", 2], ["Lemon Mint (M)", 2]], pay: "UPI", type: "Take Away", table: "", status: "Preparing", cust: "Gita" },
    { h: 14, m: 10, picks: [["Chicken 65", 1], ["Veg Fried Rice", 1]], pay: "Cash", type: "Dine In", table: "3", status: "Pending", cust: "Kiran" },
  ];
  return recipe.map((r, i) => {
    const lines = r.picks.map(([n, q]) => lineOf(n, q));
    const totals = computeTotals(lines, "amount", 0, false, 0);
    return {
      id: "O" + (1000 + i),
      ref: i + 1,
      lines, totals,
      type: r.type, table: r.table,
      customer: { name: r.cust, phone: "" },
      discount: { mode: "amount", value: 0 },
      serviceOn: false,
      payment: { method: r.pay, tendered: totals.grandTotal },
      notes: "",
      status: r.status,
      cashier: "Administrator",
      createdAt: todayAt(r.h, r.m).toISOString(),
    };
  });
}

const EXPENSE_CATS = [
  { id: "ingredients", name: "Ingredients / Purchase", emoji: "🛒" },
  { id: "salaries", name: "Salaries / Wages", emoji: "👥" },
  { id: "rent", name: "Rent", emoji: "🏠" },
  { id: "utilities", name: "Utilities (DEWA)", emoji: "💡" },
  { id: "gas", name: "Gas / Fuel", emoji: "🔥" },
  { id: "maintenance", name: "Maintenance", emoji: "🔧" },
  { id: "supplies", name: "Packaging / Supplies", emoji: "📦" },
  { id: "marketing", name: "Marketing", emoji: "📣" },
  { id: "transport", name: "Transport / Delivery", emoji: "🛵" },
  { id: "other", name: "Other", emoji: "🧾" },
];

function seedExpenses() {
  const rows = [
    { h: 7, m: 30, cat: "ingredients", amt: 240, method: "Cash", vendor: "Veg & meat market" },
    { h: 8, m: 10, cat: "gas", amt: 95, method: "Cash", vendor: "LPG cylinder refill" },
    { h: 9, m: 0, cat: "supplies", amt: 60, method: "Card", vendor: "Packaging / boxes" },
    { h: 13, m: 15, cat: "transport", amt: 35, method: "Cash", vendor: "Delivery fuel" },
  ];
  return rows.map((r, i) => ({
    id: "E" + (2000 + i),
    cat: r.cat,
    amount: round2(r.amt),
    method: r.method,
    vendor: r.vendor,
    note: "",
    createdAt: todayAt(r.h, r.m).toISOString(),
  }));
}

const PALETTE = {
  light: {
    "--bg": "#F4F2FB", "--surface": "#FFFFFF", "--surface2": "#FBFAFF",
    "--ink": "#241B43", "--muted": "#736C90", "--line": "#ECE8F7",
    "--purple": "#6D28D9", "--purpleSoft": "#F1 E9FE".replace(" ", ""),
    "--gold": "#C19A2B", "--goldSoft": "#F6EFD8",
  },
  dark: {
    "--bg": "#140E2B", "--surface": "#1D1640", "--surface2": "#241B49",
    "--ink": "#F2EFFB", "--muted": "#A79FC6", "--line": "#2D2456",
    "--purple": "#9B7CF6", "--purpleSoft": "#241B49",
    "--gold": "#E6C15A", "--goldSoft": "#2A2150",
  },
};

const SIDEBAR_GRAD = "linear-gradient(180deg,#2E1065 0%,#3B0A6B 48%,#26104F 100%)";
const GOLD_GRAD = "linear-gradient(135deg,#E6C15A 0%,#C19A2B 50%,#9C7A1E 100%)";

const ROLES = {
  Owner: ["dashboard", "pos", "orders", "kitchen", "menu", "inventory", "expenses", "reports", "settings"],
  Manager: ["dashboard", "pos", "orders", "kitchen", "menu", "inventory", "expenses", "reports", "settings"],
  Cashier: ["pos", "orders", "dashboard", "expenses"],
  "Kitchen Staff": ["kitchen", "orders"],
};

// Staff accounts — sign in with an ID + PIN; the account decides the role.
// (In the deployed build these live in Supabase Auth and are managed in Settings.)
const STAFF = [
  { id: "owner", pin: "1234", name: "Administrator", role: "Owner" },
  { id: "manager", pin: "1234", name: "Manager", role: "Manager" },
  { id: "cashier", pin: "1234", name: "Cashier", role: "Cashier" },
  { id: "kitchen", pin: "1234", name: "Kitchen", role: "Kitchen Staff" },
];

/* --------------------------- COUNT-UP HOOK -------------------------------- */
function useCountUp(value, duration = 650) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (value - from) * eased;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

/* ============================================================================
   APP
============================================================================ */
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [dark, setDark] = useState(false);

  const [restaurant, setRestaurant] = useState(RESTAURANT_DEFAULT);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [orders, setOrders] = useState(() => seedOrders());
  const [held, setHeld] = useState([]);
  const [expenses, setExpenses] = useState(() => seedExpenses());

  // POS cart
  const [lines, setLines] = useState([]);
  const [orderType, setOrderType] = useState("Dine In");
  const [table, setTable] = useState("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [discMode, setDiscMode] = useState("percent");
  const [discValue, setDiscValue] = useState("");
  const [serviceOn, setServiceOn] = useState(false);
  const [notes, setNotes] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [tendered, setTendered] = useState("");
  const [posCat, setPosCat] = useState("all");
  const [posSearch, setPosSearch] = useState("");

  // UI
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const vars = dark ? PALETTE.dark : PALETTE.light;
  const allowed = user ? ROLES[user.role] : [];

  function flash(msg, kind = "ok") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2600);
  }

  /* ----------------------------- CART OPS -------------------------------- */
  function addToCart(item) {
    if (!item.available) { flash(`${item.name} is marked unavailable`, "warn"); return; }
    setLines((prev) => {
      const ex = prev.find((l) => l.itemId === item.id);
      if (ex) return prev.map((l) => l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l);
      return [...prev, { itemId: item.id, name: item.name, price: item.price, cost: item.cost, qty: 1 }];
    });
  }
  const setQty = (itemId, delta) =>
    setLines((prev) => prev.flatMap((l) => {
      if (l.itemId !== itemId) return [l];
      const q = l.qty + delta;
      return q <= 0 ? [] : [{ ...l, qty: q }];
    }));
  const removeLine = (itemId) => setLines((prev) => prev.filter((l) => l.itemId !== itemId));

  function clearCart() {
    setLines([]); setOrderType("Dine In"); setTable(""); setCustName(""); setCustPhone("");
    setDiscMode("percent"); setDiscValue(""); setServiceOn(false); setNotes("");
    setPayMethod("Cash"); setTendered("");
  }

  const totals = useMemo(
    () => computeTotals(lines, discMode, discValue, serviceOn, restaurant.servicePct),
    [lines, discMode, discValue, serviceOn, restaurant.servicePct]
  );

  function deductInventory(orderLines) {
    setInventory((prev) => {
      const need = {};
      orderLines.forEach((l) => {
        const it = items.find((i) => i.id === l.itemId);
        if (!it) return;
        getRecipe(it).forEach((r) => { need[r.name] = (need[r.name] || 0) + r.qty * l.qty; });
      });
      return prev.map((ing) => need[ing.name]
        ? { ...ing, stock: Math.max(0, round2(ing.stock - need[ing.name])) }
        : ing);
    });
  }

  function charge() {
    if (lines.length === 0) { flash("Add items before charging", "warn"); return; }
    const t = computeTotals(lines, discMode, discValue, serviceOn, restaurant.servicePct);
    const order = {
      id: "O" + Date.now(),
      ref: orders.length + 1,
      lines: lines.map((l) => ({ ...l })),
      totals: t,
      type: orderType,
      table: orderType === "Dine In" ? table : "",
      customer: { name: custName || "Walk-in", phone: custPhone },
      discount: { mode: discMode, value: Number(discValue) || 0 },
      serviceOn,
      payment: { method: payMethod, tendered: payMethod === "Cash" ? (Number(tendered) || t.grandTotal) : t.grandTotal },
      notes,
      status: orderType === "Take Away" ? "Completed" : "Preparing",
      cashier: user?.name || "Administrator",
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    deductInventory(order.lines);
    setReceiptOrder(order);
    clearCart();
    flash("Order charged successfully");
  }

  function holdBill() {
    if (lines.length === 0) { flash("Nothing to hold", "warn"); return; }
    setHeld((prev) => [...prev, {
      id: "H" + Date.now(),
      label: custName || (table ? `Table ${table}` : `Bill ${prev.length + 1}`),
      snapshot: { lines, orderType, table, custName, custPhone, discMode, discValue, serviceOn, notes },
      at: new Date().toISOString(),
    }]);
    clearCart();
    flash("Bill held — resume it anytime");
  }
  function resumeBill(h) {
    const s = h.snapshot;
    setLines(s.lines); setOrderType(s.orderType); setTable(s.table);
    setCustName(s.custName); setCustPhone(s.custPhone); setDiscMode(s.discMode);
    setDiscValue(s.discValue); setServiceOn(s.serviceOn); setNotes(s.notes);
    setHeld((prev) => prev.filter((x) => x.id !== h.id));
    flash("Bill resumed");
  }

  const setStatus = (id, status) =>
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));

  /* ----------------------------- DERIVED --------------------------------- */
  const todays = useMemo(() => {
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    return orders.filter((o) => new Date(o.createdAt) >= d0);
  }, [orders]);

  const stats = useMemo(() => {
    const done = todays.filter((o) => o.status !== "Cancelled");
    const sales = done.reduce((s, o) => s + o.totals.grandTotal, 0);
    const net = done.reduce((s, o) => s + o.totals.netAmount, 0);
    const vat = done.reduce((s, o) => s + o.totals.vatAmount, 0);
    const profit = done.reduce((s, o) => s + o.totals.profit, 0);
    const customers = new Set(done.map((o) => o.customer.name)).size;
    return {
      sales: round2(sales), net: round2(net), vat: round2(vat), profit: round2(profit),
      orders: todays.length, completed: todays.filter((o) => o.status === "Completed").length,
      pending: todays.filter((o) => o.status === "Pending").length,
      preparing: todays.filter((o) => o.status === "Preparing").length,
      cancelled: todays.filter((o) => o.status === "Cancelled").length,
      avg: done.length ? round2(sales / done.length) : 0,
      customers,
    };
  }, [todays]);

  const lowStock = inventory.filter((i) => i.stock <= i.min);

  const expToday = useMemo(() => {
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const list = expenses.filter((e) => new Date(e.createdAt) >= d0);
    return { list, total: round2(list.reduce((s, e) => s + e.amount, 0)) };
  }, [expenses]);

  function resetDemo() {
    setOrders(seedOrders()); setItems(INITIAL_ITEMS); setInventory(INITIAL_INVENTORY);
    setHeld([]); setExpenses(seedExpenses()); clearCart(); flash("Demo data reset");
  }

  /* ----------------------------- RENDER ---------------------------------- */
  if (!user) return <Login onLogin={(u) => { setUser(u); setView(ROLES[u.role][0]); }} />;

  const navItems = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "pos", label: "POS Billing", Icon: ShoppingBag },
    { id: "orders", label: "Orders", Icon: ClipboardList },
    { id: "kitchen", label: "Kitchen", Icon: ChefHat },
    { id: "menu", label: "Menu", Icon: Utensils },
    { id: "inventory", label: "Inventory", Icon: Package },
    { id: "expenses", label: "Expenses", Icon: ReceiptIcon },
    { id: "reports", label: "Reports", Icon: BarChart3 },
    { id: "settings", label: "Settings", Icon: SettingsIcon },
  ].filter((n) => allowed.includes(n.id));

  return (
    <div style={{ ...vars, background: "var(--bg)", color: "var(--ink)" }} className="w-full h-screen flex overflow-hidden">
      <StyleBlock />

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 text-white relative" style={{ background: SIDEBAR_GRAD }}>
        <div className="absolute top-0 right-0 h-full w-[3px]" style={{ background: GOLD_GRAD }} />
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <CafeLogo size={44} />
          <div>
            <Wordmark />
            <div className="mt-1 text-[10px] tracking-[0.25em] uppercase" style={{ color: "#E6C15A" }}>Dadnah • Fujairah</div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto thin-scroll">
          {navItems.map(({ id, label, Icon }) => {
            const active = view === id;
            return (
              <button key={id} onClick={() => setView(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  boxShadow: active ? "inset 3px 0 0 #E6C15A" : "none",
                  color: active ? "#fff" : "rgba(255,255,255,0.72)",
                }}>
                <Icon size={18} style={{ color: active ? "#E6C15A" : "rgba(255,255,255,0.72)" }} />
                <span className={active ? "font-semibold" : ""}>{label}</span>
                {id === "inventory" && lowStock.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#E6553A", color: "#fff" }}>{lowStock.length}</span>
                )}
                {id === "orders" && stats.pending > 0 && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#E6C15A", color: "#2E1065" }}>{stats.pending}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold" style={{ background: GOLD_GRAD, color: "#2E1065" }}>
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>{user.role}</div>
            </div>
            <button onClick={() => { setUser(null); clearCart(); }} className="ml-auto opacity-70 hover:opacity-100" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center gap-3 px-4 md:px-6 border-b no-print"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <div className="md:hidden">
            <Wordmark small />
          </div>
          <h1 className="text-lg font-bold capitalize hidden md:block" style={{ fontFamily: "Fraunces, serif" }}>
            {navItems.find((n) => n.id === view)?.label}
          </h1>
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-full" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
              <Calendar size={14} />
              {now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
              <span className="opacity-40">•</span>
              <Clock size={14} />
              {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            {lowStock.length > 0 && (
              <button onClick={() => setView("inventory")} className="relative p-2 rounded-full" style={{ background: "var(--surface2)" }} title={`${lowStock.length} low-stock items`}>
                <Bell size={18} style={{ color: "var(--ink)" }} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center" style={{ background: "#E6553A", color: "#fff" }}>{lowStock.length}</span>
              </button>
            )}
            <button onClick={() => setDark((d) => !d)} className="p-2 rounded-full" style={{ background: "var(--surface2)" }} title="Toggle theme">
              {dark ? <Sun size={18} style={{ color: "#E6C15A" }} /> : <Moon size={18} style={{ color: "var(--ink)" }} />}
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 px-3 py-2 overflow-x-auto no-print border-b" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setView(id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap"
              style={{ background: view === id ? "var(--purple)" : "var(--surface2)", color: view === id ? "#fff" : "var(--muted)" }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll">
          {view === "dashboard" && <Dashboard stats={stats} todays={todays} items={items} restaurant={restaurant} dark={dark} expensesToday={expToday.total} expenseCount={expToday.list.length} />}
          {view === "pos" && (
            <POS
              items={items} posCat={posCat} setPosCat={setPosCat} posSearch={posSearch} setPosSearch={setPosSearch}
              lines={lines} addToCart={addToCart} setQty={setQty} removeLine={removeLine}
              orderType={orderType} setOrderType={setOrderType} table={table} setTable={setTable}
              custName={custName} setCustName={setCustName} custPhone={custPhone} setCustPhone={setCustPhone}
              discMode={discMode} setDiscMode={setDiscMode} discValue={discValue} setDiscValue={setDiscValue}
              serviceOn={serviceOn} setServiceOn={setServiceOn} servicePct={restaurant.servicePct}
              notes={notes} setNotes={setNotes} payMethod={payMethod} setPayMethod={setPayMethod}
              tendered={tendered} setTendered={setTendered} totals={totals}
              charge={charge} holdBill={holdBill} clearCart={clearCart} held={held} resumeBill={resumeBill}
            />
          )}
          {view === "orders" && <Orders orders={orders} setStatus={setStatus} reprint={setReceiptOrder} />}
          {view === "kitchen" && <Kitchen orders={orders} setStatus={setStatus} />}
          {view === "menu" && <Menu items={items} setItems={setItems} setEditItem={setEditItem} flash={flash} />}
          {view === "inventory" && <Inventory inventory={inventory} setInventory={setInventory} flash={flash} />}
          {view === "expenses" && <Expenses expenses={expenses} setExpenses={setExpenses} flash={flash} user={user} />}
          {view === "reports" && <Reports orders={orders} todays={todays} items={items} restaurant={restaurant} expenses={expenses} />}
          {view === "settings" && <SettingsView restaurant={restaurant} setRestaurant={setRestaurant} dark={dark} setDark={setDark} resetDemo={resetDemo} flash={flash} user={user} />}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium toast-in"
          style={{ background: toast.kind === "warn" ? "#7A1F1F" : "#2E1065", color: "#fff", border: "1px solid rgba(230,193,90,0.4)" }}>
          {toast.kind === "warn" ? <AlertTriangle size={16} style={{ color: "#E6C15A" }} /> : <CheckCircle2 size={16} style={{ color: "#E6C15A" }} />}
          {toast.msg}
        </div>
      )}

      {/* Receipt modal */}
      {receiptOrder && (
        <Receipt order={receiptOrder} restaurant={restaurant} onClose={() => setReceiptOrder(null)} flash={flash} />
      )}

      {/* Edit item modal */}
      {editItem && (
        <ItemEditor item={editItem} onClose={() => setEditItem(null)}
          onSave={(it) => {
            setItems((prev) => it.id ? prev.map((p) => p.id === it.id ? it : p) : [...prev, { ...it, id: "I" + Date.now() }]);
            setEditItem(null); flash(it.id ? "Item updated" : "Item added");
          }} />
      )}
    </div>
  );
}

/* ============================== LOGIN ===================================== */
function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const submit = () => {
    const acct = STAFF.find((s) => s.id.toLowerCase() === id.trim().toLowerCase() && s.pin === pin.trim());
    if (!acct) { setErr("Invalid staff ID or PIN."); return; }
    onLogin({ role: acct.role, name: acct.name, id: acct.id });
  };
  const quick = (s) => { setId(s.id); setPin(s.pin); setErr(""); };
  const ready = id.trim() && pin.trim();

  return (
    <div className="w-full h-screen flex items-center justify-center p-4" style={{ background: SIDEBAR_GRAD }}>
      <StyleBlock />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #E6C15A 0, transparent 40%), radial-gradient(circle at 80% 70%, #9B7CF6 0, transparent 40%)" }} />
      <div className="relative w-full max-w-sm rounded-3xl p-8 shadow-2xl login-card" style={{ background: "rgba(255,255,255,0.97)" }}>
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3"><CafeLogo size={78} /></div>
          <Wordmark center />
          <div className="mt-1 text-[11px] tracking-[0.28em] uppercase" style={{ color: "#C19A2B" }}>Smart Billing System</div>
          <p className="mt-3 text-sm" style={{ color: "#736C90" }}>Sign in to continue</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#736C90" }}>Staff ID</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A79FC6" }} />
              <input value={id} autoFocus onChange={(e) => { setId(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Enter your staff ID"
                className="w-full pl-9 pr-3 py-3 rounded-xl text-sm outline-none" style={{ border: "2px solid #ECE8F7", color: "#241B43" }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#736C90" }}>PIN</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A79FC6" }} />
              <input type="password" inputMode="numeric" value={pin} onChange={(e) => { setPin(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••"
                className="w-full pl-9 pr-3 py-3 rounded-xl text-sm outline-none tracking-widest" style={{ border: "2px solid #ECE8F7", color: "#241B43" }} />
            </div>
          </div>
          {err && <div className="text-xs font-medium px-1 flex items-center gap-1" style={{ color: "#E6553A" }}><AlertTriangle size={13} /> {err}</div>}
          <button onClick={submit} disabled={!ready}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
            style={{ background: ready ? SIDEBAR_GRAD : "#ccc", color: "#fff" }}>
            Sign in
          </button>
        </div>

        {/* Demo logins — hidden until requested, so the main screen stays a single sign-in */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "#ECE8F7" }}>
          <button onClick={() => setShowDemo((v) => !v)} className="text-[11px] font-semibold flex items-center justify-center gap-1 mx-auto" style={{ color: "#6D28D9" }}>
            {showDemo ? "Hide demo logins" : "Use a demo login"}
            <span style={{ display: "inline-block", transform: showDemo ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
          </button>
          {showDemo && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] text-center mb-2" style={{ color: "#A79FC6" }}>PIN for every demo account is 1234 — tap one to fill</p>
              {STAFF.map((s) => (
                <button key={s.id} onClick={() => quick(s)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all" style={{ background: "#F7F5FD", border: "1px solid #ECE8F7" }}>
                  <span className="text-xs"><b style={{ color: "#241B43" }}>{s.id}</b> <span style={{ color: "#A79FC6" }}>/ {s.pin}</span></span>
                  <span className="text-[11px] font-medium" style={{ color: "#6D28D9" }}>{s.role}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[11px]" style={{ color: "#A79FC6" }}>VAT 105182070000001 • Dibba Municipality 09883</p>
      </div>
    </div>
  );
}

/* ============================ DASHBOARD ================================== */
function Dashboard({ stats, todays, items, restaurant, dark, expensesToday = 0, expenseCount = 0 }) {
  const salesAnim = useCountUp(stats.sales);
  const netProfit = round2(stats.profit - expensesToday);
  const profitAnim = useCountUp(netProfit);
  const cogs = round2(stats.net - stats.profit);
  const isProfit = netProfit >= 0;
  const margin = stats.net ? (netProfit / stats.net) * 100 : 0;

  const hourly = useMemo(() => {
    const buckets = {};
    for (let h = 8; h <= 23; h++) buckets[h] = 0;
    todays.filter((o) => o.status !== "Cancelled").forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      buckets[h] = (buckets[h] || 0) + o.totals.grandTotal;
    });
    return Object.entries(buckets).map(([h, v]) => ({ hour: `${h}:00`, sales: round2(v) }));
  }, [todays]);

  const payData = useMemo(() => {
    const m = {};
    todays.filter((o) => o.status !== "Cancelled").forEach((o) => { m[o.payment.method] = (m[o.payment.method] || 0) + o.totals.grandTotal; });
    return Object.entries(m).map(([name, value]) => ({ name, value: round2(value) }));
  }, [todays]);

  const topItems = useMemo(() => {
    const m = {};
    todays.filter((o) => o.status !== "Cancelled").forEach((o) =>
      o.lines.forEach((l) => { m[l.name] = (m[l.name] || 0) + l.qty; }));
    return Object.entries(m).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [todays]);

  const recent = todays.slice(0, 6);
  const PAY_COLORS = { Cash: "#6D28D9", Card: "#C19A2B", UPI: "#9B7CF6" };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Hero metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <HeroCard title="Today's Sales" value={`AED ${salesAnim.toFixed(2)}`} sub={`${stats.orders} orders`} Icon={TrendingUp} accent />
        <HeroCard title="Today's Expenses" value={aed(expensesToday)} sub="logged today" Icon={ReceiptIcon} />
        <HeroCard title="Net Profit" value={`AED ${profitAnim.toFixed(2)}`} sub="after food cost & expenses" Icon={Coins} />
        <HeroCard title="VAT Collected" value={aed(stats.vat)} sub="5% output VAT" Icon={FileText} />
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Completed" value={stats.completed} color="#1F9D6B" Icon={CheckCircle2} />
        <Stat label="Preparing" value={stats.preparing} color="#C19A2B" Icon={Flame} />
        <Stat label="Pending" value={stats.pending} color="#6D28D9" Icon={Clock} />
        <Stat label="Cancelled" value={stats.cancelled} color="#E6553A" Icon={XCircle} />
      </div>

      {/* Daily Profit & Loss */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardHead title="Daily Profit & Loss" sub={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: isProfit ? "rgba(31,157,107,0.12)" : "rgba(230,85,58,0.12)", color: isProfit ? "#1F9D6B" : "#E6553A" }}>
            {stats.orders === 0 ? "NO SALES YET" : isProfit ? "● IN PROFIT" : "● IN LOSS"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {/* Statement */}
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Gross Sales (incl. VAT)</span><span className="tnum font-semibold" style={{ color: "var(--ink)" }}>{aed(stats.sales)}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>− VAT (5%) collected</span><span className="tnum" style={{ color: "var(--muted)" }}>− {money(stats.vat)}</span></div>
            <div className="flex justify-between border-t pt-2" style={{ borderColor: "var(--line)" }}><span style={{ color: "var(--ink)" }}>Net Sales (revenue)</span><span className="tnum font-semibold" style={{ color: "var(--ink)" }}>{aed(stats.net)}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>− Food Cost (COGS)</span><span className="tnum" style={{ color: "#E6553A" }}>− {money(cogs)}</span></div>
            <div className="flex justify-between border-t pt-2" style={{ borderColor: "var(--line)" }}><span className="font-semibold" style={{ color: "var(--ink)" }}>= Gross Profit</span><span className="tnum font-bold" style={{ color: "var(--ink)" }}>{aed(stats.profit)}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>− Expenses ({expenseCount})</span><span className="tnum" style={{ color: "#E6553A" }}>− {money(expensesToday)}</span></div>
          </div>
          {/* Result */}
          <div className="rounded-2xl p-5 flex flex-col justify-center items-center text-center"
            style={{ background: isProfit ? "linear-gradient(135deg,rgba(31,157,107,0.10),rgba(31,157,107,0.03))" : "linear-gradient(135deg,rgba(230,85,58,0.12),rgba(230,85,58,0.03))", border: `1px solid ${isProfit ? "rgba(31,157,107,0.25)" : "rgba(230,85,58,0.25)"}` }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{isProfit ? "Net Profit Today" : "Net Loss Today"}</span>
            <span className="text-3xl font-extrabold tnum mt-1" style={{ color: isProfit ? "#1F9D6B" : "#E6553A" }}>{isProfit ? "" : "− "}AED {money(Math.abs(netProfit))}</span>
            <span className="text-xs mt-1" style={{ color: "var(--muted)" }}>{stats.net ? `${Math.abs(margin).toFixed(1)}% net margin` : "No revenue recorded yet"}</span>
            <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold" style={{ color: isProfit ? "#1F9D6B" : "#E6553A" }}>
              {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {stats.orders} orders today
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales graph */}
        <Card className="lg:col-span-2">
          <CardHead title="Sales Today" sub="Revenue by hour (AED)" />
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ left: -18, right: 8, top: 6 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6D28D9" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#2D2456" : "#ECE8F7"} vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--muted)" }} interval={1} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle(dark)} formatter={(v) => [aed(v), "Sales"]} />
                <Area type="monotone" dataKey="sales" stroke="#6D28D9" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment pie */}
        <Card>
          <CardHead title="Payment Mix" sub="By method" />
          <div className="h-60 mt-2 flex items-center justify-center">
            {payData.length === 0 ? <Empty msg="No sales yet" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                    {payData.map((e, i) => <Cell key={i} fill={PAY_COLORS[e.name] || "#9B7CF6"} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle(dark)} formatter={(v) => aed(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-1">
            {payData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PAY_COLORS[p.name] || "#9B7CF6" }} />{p.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top items */}
        <Card>
          <CardHead title="Top Selling Items" sub="Today, by quantity" />
          <div className="h-56 mt-2">
            {topItems.length === 0 ? <Empty msg="No sales yet" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "var(--ink)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle(dark)} cursor={{ fill: dark ? "#241B49" : "#F3EDFE" }} />
                  <Bar dataKey="qty" radius={[0, 6, 6, 0]} barSize={16}>
                    {topItems.map((e, i) => <Cell key={i} fill={i === 0 ? "#C19A2B" : "#6D28D9"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHead title="Recent Orders" sub="Latest activity" />
          <div className="mt-2 divide-y" style={{ borderColor: "var(--line)" }}>
            {recent.length === 0 ? <Empty msg="No orders yet" /> : recent.map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "var(--surface2)", color: "var(--purple)" }}>#{o.ref}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{o.customer.name} <span className="font-normal" style={{ color: "var(--muted)" }}>• {o.type}{o.table ? ` · T${o.table}` : ""}</span></div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>{o.lines.length} items • {new Date(o.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <StatusPill status={o.status} />
                <div className="text-sm font-bold tnum" style={{ color: "var(--ink)" }}>{aed(o.totals.grandTotal)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================== POS ===================================== */
function POS(props) {
  const {
    items, posCat, setPosCat, posSearch, setPosSearch, lines, addToCart, setQty, removeLine,
    orderType, setOrderType, table, setTable, custName, setCustName, custPhone, setCustPhone,
    discMode, setDiscMode, discValue, setDiscValue, serviceOn, setServiceOn, servicePct,
    notes, setNotes, payMethod, setPayMethod, tendered, setTendered, totals, charge, holdBill,
    clearCart, held, resumeBill,
  } = props;

  const q = posSearch.trim().toLowerCase();
  const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || "";
  const itemMatches = (it) => it.name.toLowerCase().includes(q) || catName(it.cat).toLowerCase().includes(q);
  const searchResults = q ? items.filter(itemMatches) : [];
  const popularItems = items.filter((i) => POPULAR.has(i.name));
  const catCount = (id) => items.filter((i) => i.cat === id).length;

  const ItemCard = ({ it }) => (
    <button onClick={() => addToCart(it)} disabled={!it.available}
      className="group relative text-left rounded-2xl p-3.5 transition-all item-card disabled:opacity-50 flex flex-col"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", minHeight: 108 }}>
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-lg leading-none">{CATEGORIES.find((c) => c.id === it.cat)?.emoji}</span>
        {!it.available && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#E6553A", color: "#fff" }}>SOLD OUT</span>}
      </div>
      <div className="text-[15px] font-semibold leading-snug line-clamp-2 flex-1" style={{ color: "var(--ink)" }}>{it.name}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-base font-bold tnum" style={{ color: "var(--purple)" }}>{money(it.price)}<span className="text-[10px] font-medium ml-0.5" style={{ color: "var(--muted)" }}>AED</span></span>
        <span className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110" style={{ background: GOLD_GRAD, color: "#2E1065" }}><Plus size={16} strokeWidth={2.5} /></span>
      </div>
    </button>
  );

  const Grid = ({ list }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
      {list.map((it) => <ItemCard key={it.id} it={it} />)}
    </div>
  );

  const GroupHeader = ({ emoji, name, count }) => (
    <div className="flex items-center gap-2 mt-4 mb-2.5 first:mt-0">
      <span className="text-base">{emoji}</span>
      <span className="text-[13px] font-bold uppercase tracking-wide" style={{ color: "var(--ink)" }}>{name}</span>
      <span className="text-[11px] px-1.5 py-0.5 rounded-full tnum" style={{ background: "var(--surface2)", color: "var(--muted)" }}>{count}</span>
      <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
    </div>
  );

  const CatChip = ({ id, emoji, name }) => {
    const active = posCat === id;
    return (
      <button onClick={() => setPosCat(id)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm whitespace-nowrap transition-all shrink-0"
        style={{ background: active ? GOLD_GRAD : "var(--surface)", color: active ? "#2E1065" : "var(--muted)", border: active ? "1px solid transparent" : "1px solid var(--line)", fontWeight: active ? 700 : 500 }}>
        <span>{emoji}</span>{name}
      </button>
    );
  };
  const change = payMethod === "Cash" && tendered ? round2((Number(tendered) || 0) - totals.grandTotal) : 0;

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* LEFT: catalog */}
      <div className="flex-1 flex flex-col min-w-0 p-4 md:p-5">
        {/* Search */}
        <div className="relative mb-3">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={posSearch} onChange={(e) => setPosSearch(e.target.value)} placeholder="Search food — try “momo”, “juice”, “chicken”…"
            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" }} />
          {q && (
            <button onClick={() => setPosSearch("")} aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
              <X size={14} />
            </button>
          )}
        </div>
        {/* Category chips (hidden while searching) */}
        {!q && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-1 thin-scroll">
            <CatChip id="all" emoji="🍽️" name="All" />
            <CatChip id="popular" emoji="⭐" name="Popular" />
            {CATEGORIES.map((c) => <CatChip key={c.id} id={c.id} emoji={c.emoji} name={c.name} />)}
          </div>
        )}
        {/* Catalog body */}
        <div className="flex-1 overflow-y-auto thin-scroll -mx-1 px-1 pb-4">
          {q ? (
            searchResults.length ? (
              <>
                <div className="text-xs mb-2.5 mt-1" style={{ color: "var(--muted)" }}>{searchResults.length} {searchResults.length === 1 ? "item" : "items"} found</div>
                <Grid list={searchResults} />
              </>
            ) : <Empty msg={`No food matches “${posSearch.trim()}”`} />
          ) : posCat === "all" ? (
            <>
              <GroupHeader emoji="⭐" name="Popular" count={popularItems.length} />
              <Grid list={popularItems} />
              {CATEGORIES.map((c) => (
                <div key={c.id}>
                  <GroupHeader emoji={c.emoji} name={c.name} count={catCount(c.id)} />
                  <Grid list={items.filter((i) => i.cat === c.id)} />
                </div>
              ))}
            </>
          ) : posCat === "popular" ? (
            <Grid list={popularItems} />
          ) : (
            <Grid list={items.filter((i) => i.cat === posCat)} />
          )}
        </div>
      </div>

      {/* RIGHT: order ticket */}
      <div className="w-full lg:w-[400px] xl:w-[420px] shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        {/* Order type */}
        <div className="p-4 pb-3 border-b" style={{ borderColor: "var(--line)" }}>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl" style={{ background: "var(--surface2)" }}>
            {["Dine In", "Take Away", "Delivery"].map((t) => (
              <button key={t} onClick={() => setOrderType(t)} className="py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: orderType === t ? "var(--surface)" : "transparent", color: orderType === t ? "var(--purple)" : "var(--muted)", boxShadow: orderType === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <LabeledInput Icon={User} value={custName} onChange={setCustName} placeholder="Customer name" />
            {orderType === "Dine In"
              ? <LabeledInput Icon={Hash} value={table} onChange={setTable} placeholder="Table no." />
              : <LabeledInput Icon={Phone} value={custPhone} onChange={setCustPhone} placeholder="Phone" />}
          </div>
        </div>

        {/* Held bills */}
        {held.length > 0 && (
          <div className="px-4 py-2 border-b flex gap-2 overflow-x-auto thin-scroll" style={{ borderColor: "var(--line)" }}>
            {held.map((h) => (
              <button key={h.id} onClick={() => resumeBill(h)} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0" style={{ background: "var(--goldSoft)", color: "var(--gold)" }}>
                <Play size={12} /> {h.label}
              </button>
            ))}
          </div>
        )}

        {/* Lines */}
        <div className="flex-1 overflow-y-auto thin-scroll px-4 py-2 min-h-[120px]">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10" style={{ color: "var(--muted)" }}>
              <ShoppingBag size={40} className="opacity-30 mb-2" />
              <p className="text-sm">Tap items to start an order</p>
            </div>
          ) : lines.map((l) => (
            <div key={l.itemId} className="flex items-center gap-2 py-2.5 border-b line-in" style={{ borderColor: "var(--line)" }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{l.name}</div>
                <div className="text-[11px] tnum" style={{ color: "var(--muted)" }}>{money(l.price)} × {l.qty} = {money(l.price * l.qty)} AED</div>
              </div>
              <div className="flex items-center gap-1.5">
                <QtyBtn onClick={() => setQty(l.itemId, -1)}><Minus size={13} /></QtyBtn>
                <span className="w-6 text-center text-sm font-bold tnum">{l.qty}</span>
                <QtyBtn onClick={() => setQty(l.itemId, 1)}><Plus size={13} /></QtyBtn>
                <button onClick={() => removeLine(l.itemId)} className="ml-1 p-1 rounded-lg" style={{ color: "#E6553A" }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals + actions */}
        <div className="border-t p-4 space-y-2.5" style={{ borderColor: "var(--line)", background: "var(--surface2)" }}>
          {/* Discount + service */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--line)" }}>
              <button onClick={() => setDiscMode("percent")} className="px-2.5 py-1.5 text-xs font-semibold" style={{ background: discMode === "percent" ? "var(--purple)" : "var(--surface)", color: discMode === "percent" ? "#fff" : "var(--muted)" }}><Percent size={12} /></button>
              <button onClick={() => setDiscMode("amount")} className="px-2.5 py-1.5 text-xs font-semibold" style={{ background: discMode === "amount" ? "var(--purple)" : "var(--surface)", color: discMode === "amount" ? "#fff" : "var(--muted)" }}>AED</button>
            </div>
            <input value={discValue} onChange={(e) => setDiscValue(e.target.value)} type="number" placeholder={`Discount ${discMode === "percent" ? "%" : "amount"}`}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none tnum" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" }} />
            {servicePct > 0 && (
              <button onClick={() => setServiceOn((s) => !s)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ background: serviceOn ? "var(--goldSoft)" : "var(--surface)", color: serviceOn ? "var(--gold)" : "var(--muted)", border: "1px solid var(--line)" }}>
                +Svc {servicePct}%
              </button>
            )}
          </div>

          <Row label="Subtotal" value={money(totals.grossSubtotal)} />
          {totals.discountAmt > 0 && <Row label="Discount" value={`− ${money(totals.discountAmt)}`} negative />}
          {totals.serviceAmt > 0 && <Row label={`Service (${servicePct}%)`} value={money(totals.serviceAmt)} />}
          <Row label="Net amount" value={money(totals.netAmount)} muted />
          <Row label="VAT (5%)" value={money(totals.vatAmount)} muted />
          <div className="flex justify-between items-center pt-2 mt-1 border-t" style={{ borderColor: "var(--line)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>Grand Total</span>
            <span className="text-xl font-bold tnum" style={{ color: "var(--purple)", fontFamily: "Fraunces, serif" }}>AED {money(totals.grandTotal)}</span>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[["Cash", Banknote], ["Card", CreditCard], ["UPI", Smartphone]].map(([m, Ic]) => (
              <button key={m} onClick={() => setPayMethod(m)} className="flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: payMethod === m ? "var(--purple)" : "var(--surface)", color: payMethod === m ? "#fff" : "var(--muted)", border: "1px solid var(--line)" }}>
                <Ic size={16} />{m}
              </button>
            ))}
          </div>
          {payMethod === "Cash" && lines.length > 0 && (
            <div className="flex items-center gap-2">
              <input value={tendered} onChange={(e) => setTendered(e.target.value)} type="number" placeholder="Cash received"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none tnum" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" }} />
              <div className="text-sm whitespace-nowrap" style={{ color: change >= 0 ? "#1F9D6B" : "#E6553A" }}>
                Change <b className="tnum">{money(Math.max(0, change))}</b>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={holdBill} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line)" }}>
              <Pause size={15} /> Hold
            </button>
            <button onClick={clearCart} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--surface)", color: "#E6553A", border: "1px solid var(--line)" }}>
              <Trash2 size={15} /> Clear
            </button>
          </div>
          <button onClick={charge} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all charge-btn" style={{ background: SIDEBAR_GRAD }}>
            <Printer size={18} /> Charge & Print — AED {money(totals.grandTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= ORDERS =================================== */
function Orders({ orders, setStatus, reprint }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Pending", "Preparing", "Ready", "Completed", "Cancelled"];
  const list = filter === "All" ? orders : orders.filter((o) => o.status === filter);
  return (
    <div className="p-4 md:p-6">
      <div className="flex gap-2 overflow-x-auto pb-3 thin-scroll">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap"
            style={{ background: filter === f ? "var(--purple)" : "var(--surface)", color: filter === f ? "#fff" : "var(--muted)", border: "1px solid var(--line)" }}>
            {f} {f !== "All" && `(${orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.length === 0 ? <div className="col-span-full"><Empty msg="No orders here" /></div> : list.map((o) => (
          <Card key={o.id} pad="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: "var(--purple)" }}>Order #{o.ref}</span>
                  <StatusPill status={o.status} />
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{o.customer.name} • {o.type}{o.table ? ` · Table ${o.table}` : ""}</div>
              </div>
              <div className="text-right">
                <div className="font-bold tnum" style={{ color: "var(--ink)" }}>{aed(o.totals.grandTotal)}</div>
                <div className="text-[11px]" style={{ color: "var(--muted)" }}>{new Date(o.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
            <div className="text-xs space-y-0.5 mb-3 max-h-24 overflow-y-auto thin-scroll" style={{ color: "var(--muted)" }}>
              {o.lines.map((l, i) => <div key={i} className="flex justify-between"><span>{l.qty}× {l.name}</span><span className="tnum">{money(l.price * l.qty)}</span></div>)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {o.status !== "Completed" && o.status !== "Cancelled" && (
                <>
                  {o.status === "Pending" && <MiniBtn onClick={() => setStatus(o.id, "Preparing")} color="#C19A2B">Start</MiniBtn>}
                  {o.status === "Preparing" && <MiniBtn onClick={() => setStatus(o.id, "Ready")} color="#6D28D9">Ready</MiniBtn>}
                  {(o.status === "Ready" || o.status === "Preparing") && <MiniBtn onClick={() => setStatus(o.id, "Completed")} color="#1F9D6B">Complete</MiniBtn>}
                  <MiniBtn onClick={() => setStatus(o.id, "Cancelled")} color="#E6553A">Cancel</MiniBtn>
                </>
              )}
              <MiniBtn onClick={() => reprint(o)} color="var(--muted)" outline><Printer size={12} /> Reprint</MiniBtn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================= KITCHEN ================================== */
function Kitchen({ orders, setStatus }) {
  const active = orders.filter((o) => o.status === "Pending" || o.status === "Preparing" || o.status === "Ready");
  const [, force] = useState(0);
  useEffect(() => { const t = setInterval(() => force((x) => x + 1), 30000); return () => clearInterval(t); }, []);
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <ChefHat size={20} style={{ color: "var(--purple)" }} />
        <h2 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>Kitchen Display</h2>
        <span className="text-sm" style={{ color: "var(--muted)" }}>• {active.length} active tickets</span>
      </div>
      {active.length === 0 ? <Empty msg="All caught up — no active tickets 🎉" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {active.map((o) => {
            const mins = Math.floor((Date.now() - new Date(o.createdAt)) / 60000);
            const urgent = mins >= 15;
            return (
              <div key={o.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: `2px solid ${urgent ? "#E6553A" : o.status === "Ready" ? "#1F9D6B" : "var(--line)"}` }}>
                <div className="flex items-center justify-between px-3 py-2" style={{ background: urgent ? "#E6553A" : o.status === "Ready" ? "#1F9D6B" : "var(--purple)", color: "#fff" }}>
                  <span className="font-bold text-sm">#{o.ref} • {o.type}{o.table ? ` T${o.table}` : ""}</span>
                  <span className="text-xs flex items-center gap-1"><Clock size={12} />{mins}m</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {o.lines.map((l, i) => (
                    <div key={i} className="flex items-baseline gap-2">
                      <span className="font-bold tnum" style={{ color: "var(--purple)" }}>{l.qty}×</span>
                      <span className="text-sm" style={{ color: "var(--ink)" }}>{l.name}</span>
                    </div>
                  ))}
                  {o.notes && <div className="text-xs italic mt-1 px-2 py-1 rounded" style={{ background: "var(--goldSoft)", color: "var(--gold)" }}>Note: {o.notes}</div>}
                </div>
                <div className="px-3 pb-3 flex gap-1.5">
                  {o.status !== "Ready"
                    ? <button onClick={() => setStatus(o.id, "Ready")} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: "#1F9D6B" }}>Mark Ready</button>
                    : <button onClick={() => setStatus(o.id, "Completed")} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: "var(--purple)" }}>Served</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== MENU =================================== */
function Menu({ items, setItems, setEditItem, flash }) {
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? items : items.filter((i) => i.cat === cat);
  const toggle = (id) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, available: !i.available } : i));
  const del = (id) => { setItems((prev) => prev.filter((i) => i.id !== id)); flash("Item deleted", "warn"); };
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>Menu Management <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>• {items.length} items</span></h2>
        <button onClick={() => setEditItem({ name: "", cat: "cmomo", price: "", cost: "", available: true })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: SIDEBAR_GRAD }}>
          <Plus size={16} /> Add Item
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3 thin-scroll">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
        {CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.emoji} {c.name}</Chip>)}
      </div>
      <Card pad="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                <th className="text-left font-semibold px-4 py-3">Item</th>
                <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Category</th>
                <th className="text-right font-semibold px-4 py-3">Cost</th>
                <th className="text-right font-semibold px-4 py-3">Price</th>
                <th className="text-right font-semibold px-4 py-3 hidden md:table-cell">Margin</th>
                <th className="text-center font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((it) => {
                const net = it.price / (1 + VAT_RATE);
                const margin = net > 0 ? Math.round(((net - it.cost) / net) * 100) : 0;
                return (
                  <tr key={it.id} style={{ borderBottom: "1px solid var(--line)" }} className="menu-row">
                    <td className="px-4 py-2.5 font-medium" style={{ color: "var(--ink)" }}>
                      <span className="mr-2">{CATEGORIES.find((c) => c.id === it.cat)?.emoji}</span>{it.name}
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell" style={{ color: "var(--muted)" }}>{CATEGORIES.find((c) => c.id === it.cat)?.name}</td>
                    <td className="px-4 py-2.5 text-right tnum" style={{ color: "var(--muted)" }}>{money(it.cost)}</td>
                    <td className="px-4 py-2.5 text-right font-bold tnum" style={{ color: "var(--purple)" }}>{money(it.price)}</td>
                    <td className="px-4 py-2.5 text-right hidden md:table-cell tnum" style={{ color: margin > 50 ? "#1F9D6B" : margin > 30 ? "#C19A2B" : "#E6553A" }}>{margin}%</td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => toggle(it.id)} className="text-[11px] font-bold px-2 py-1 rounded-full"
                        style={{ background: it.available ? "#E7F7F0" : "#FDE9E5", color: it.available ? "#1F9D6B" : "#E6553A" }}>
                        {it.available ? "Available" : "Off"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button onClick={() => setEditItem(it)} className="p-1.5 rounded-lg" style={{ color: "var(--purple)" }}><Pencil size={15} /></button>
                      <button onClick={() => del(it.id)} className="p-1.5 rounded-lg" style={{ color: "#E6553A" }}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ItemEditor({ item, onClose, onSave }) {
  const [f, setF] = useState({ ...item, price: item.price ?? "", cost: item.cost ?? "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && Number(f.price) > 0;
  return (
    <Modal onClose={onClose} title={item.id ? "Edit Item" : "Add Item"}>
      <div className="space-y-3">
        <Field label="Item name"><input value={f.name} onChange={(e) => set("name", e.target.value)} className="modal-input" placeholder="e.g. Steam Chicken Momo" /></Field>
        <Field label="Category">
          <select value={f.cat} onChange={(e) => set("cat", e.target.value)} className="modal-input">
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Selling price (AED, incl. VAT)"><input type="number" value={f.price} onChange={(e) => set("price", e.target.value)} className="modal-input tnum" placeholder="0.00" /></Field>
          <Field label="Cost price (AED)"><input type="number" value={f.cost} onChange={(e) => set("cost", e.target.value)} className="modal-input tnum" placeholder="0.00" /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--ink)" }}>
          <input type="checkbox" checked={f.available} onChange={(e) => set("available", e.target.checked)} className="w-4 h-4" />
          Available for sale
        </label>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)" }}>Cancel</button>
        <button disabled={!valid} onClick={() => onSave({ ...f, price: Number(f.price), cost: Number(f.cost) || 0 })}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-1.5" style={{ background: SIDEBAR_GRAD }}>
          <Save size={15} /> Save
        </button>
      </div>
    </Modal>
  );
}

/* ============================ INVENTORY ================================ */
function Inventory({ inventory, setInventory, flash }) {
  const adjust = (id, delta) => setInventory((prev) => prev.map((i) => i.id === id ? { ...i, stock: Math.max(0, round2(i.stock + delta)) } : i));
  const totalValue = inventory.reduce((s, i) => s + i.stock * i.cost, 0);
  const low = inventory.filter((i) => i.stock <= i.min);
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="Stock Value" value={aed(totalValue)} color="#6D28D9" Icon={Package} big />
        <Stat label="Items Tracked" value={inventory.length} color="#C19A2B" Icon={Layers} big />
        <Stat label="Low Stock" value={low.length} color={low.length ? "#E6553A" : "#1F9D6B"} Icon={AlertTriangle} big />
      </div>
      {low.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: "#FDE9E5", color: "#B23A22" }}>
          <AlertTriangle size={16} /> <b>{low.length} ingredients</b> at or below minimum: {low.map((i) => i.name).join(", ")}
        </div>
      )}
      <Card pad="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                <th className="text-left font-semibold px-4 py-3">Raw Material</th>
                <th className="text-right font-semibold px-4 py-3">Current</th>
                <th className="text-right font-semibold px-4 py-3 hidden sm:table-cell">Minimum</th>
                <th className="text-right font-semibold px-4 py-3 hidden md:table-cell">Value</th>
                <th className="text-center font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-4 py-3">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((i) => {
                const isLow = i.stock <= i.min;
                return (
                  <tr key={i.id} style={{ borderBottom: "1px solid var(--line)" }} className="menu-row">
                    <td className="px-4 py-2.5 font-medium" style={{ color: "var(--ink)" }}>{i.name}</td>
                    <td className="px-4 py-2.5 text-right font-bold tnum" style={{ color: isLow ? "#E6553A" : "var(--ink)" }}>{i.stock} <span className="text-[11px] font-normal" style={{ color: "var(--muted)" }}>{i.unit}</span></td>
                    <td className="px-4 py-2.5 text-right tnum hidden sm:table-cell" style={{ color: "var(--muted)" }}>{i.min} {i.unit}</td>
                    <td className="px-4 py-2.5 text-right tnum hidden md:table-cell" style={{ color: "var(--muted)" }}>{money(i.stock * i.cost)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: isLow ? "#FDE9E5" : "#E7F7F0", color: isLow ? "#E6553A" : "#1F9D6B" }}>{isLow ? "Reorder" : "OK"}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <QtyBtn onClick={() => adjust(i.id, -1)}><Minus size={13} /></QtyBtn>
                      <span className="inline-block w-8" />
                      <QtyBtn onClick={() => adjust(i.id, 5)}><Plus size={13} /></QtyBtn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs" style={{ color: "var(--muted)" }}>Stock auto-deducts after every sale based on a simplified recipe map. Adjust buttons add +5 or remove −1 unit (e.g. when receiving a purchase).</p>
    </div>
  );
}

/* ============================= REPORTS ================================= */
function Expenses({ expenses, setExpenses, flash, user }) {
  const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const [cat, setCat] = useState("ingredients");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(todayStr());
  const [range, setRange] = useState("today");

  const inRange = (e) => {
    const d = new Date(e.createdAt), now = new Date();
    if (range === "all") return true;
    if (range === "today") { const d0 = new Date(); d0.setHours(0, 0, 0, 0); return d >= d0; }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const filtered = expenses.filter(inRange).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = round2(filtered.reduce((s, e) => s + e.amount, 0));
  const byCat = (() => {
    const m = {};
    filtered.forEach((e) => { m[e.cat] = (m[e.cat] || 0) + e.amount; });
    return Object.entries(m)
      .map(([id, value]) => ({ id, value: round2(value), ...(EXPENSE_CATS.find((c) => c.id === id) || { name: "Other", emoji: "🧾" }) }))
      .sort((a, b) => b.value - a.value);
  })();

  const add = () => {
    const amt = round2(amount);
    if (!amt || amt <= 0) { flash("Enter a valid amount", "err"); return; }
    const createdAt = (date === todayStr() ? new Date() : new Date(`${date}T12:00:00`)).toISOString();
    const exp = { id: "E" + Date.now(), cat, amount: amt, method, vendor: vendor.trim(), note: "", createdAt };
    setExpenses((xs) => [exp, ...xs]);
    setAmount(""); setVendor("");
    flash("Expense added");
  };
  const remove = (id) => { setExpenses((xs) => xs.filter((e) => e.id !== id)); flash("Expense removed"); };

  const exportCSV = () => {
    const rows = [["Date", "Time", "Category", "Vendor/For", "Method", "Amount (AED)"]];
    filtered.forEach((e) => { const d = new Date(e.createdAt); rows.push([d.toLocaleDateString("en-GB"), d.toLocaleTimeString("en-GB"), EXPENSE_CATS.find((c) => c.id === e.cat)?.name || "Other", e.vendor, e.method, money(e.amount)]); });
    rows.push(["", "", "", "", "TOTAL", money(total)]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    download(new Blob([csv], { type: "text/csv" }), `chai-expenses-${range}.csv`);
  };

  const fmtDate = (iso) => { const d = new Date(iso); return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };
  const PayIcon = ({ m }) => m === "Cash" ? <Banknote size={14} /> : m === "Card" ? <CreditCard size={14} /> : <Coins size={14} />;
  const cashTotal = round2(filtered.filter((e) => e.method === "Cash").reduce((s, e) => s + e.amount, 0));

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Add expense */}
      <Card>
        <CardHead title="Add Expense" sub="Log a daily cost — cash, card or bank" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <Field label="Amount (AED)">
            <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="0.00" className="modal-input tnum" />
          </Field>
          <Field label="Category">
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="modal-input">
              {EXPENSE_CATS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </Field>
          <Field label="Paid via">
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="modal-input">
              {["Cash", "Card", "Bank"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Vendor / For (optional)" full>
            <input value={vendor} onChange={(e) => setVendor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="e.g. Veg market, electricity bill, staff salary" className="modal-input" />
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="modal-input" />
          </Field>
        </div>
        <button onClick={add} className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: SIDEBAR_GRAD }}>
          <Plus size={16} /> Add Expense
        </button>
      </Card>

      {/* Range + export */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "var(--surface2)" }}>
          {[["today", "Today"], ["month", "This Month"], ["all", "All"]].map(([k, l]) => (
            <button key={k} onClick={() => setRange(k)} className="px-4 py-1.5 rounded-lg text-sm font-semibold"
              style={{ background: range === k ? "var(--surface)" : "transparent", color: range === k ? "var(--purple)" : "var(--muted)", boxShadow: range === k ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{l}</button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line)" }}><Download size={15} /> Export CSV</button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={range === "today" ? "Spent Today" : range === "month" ? "Spent This Month" : "Total Spent"} value={aed(total)} color="#E6553A" Icon={ReceiptIcon} big />
        <Stat label="Entries" value={filtered.length} color="#6D28D9" Icon={FileText} />
        <Stat label="Cash" value={aed(cashTotal)} color="#C19A2B" Icon={Banknote} />
        <Stat label="Card / Bank" value={aed(round2(total - cashTotal))} color="#1F9D6B" Icon={CreditCard} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By category */}
        <Card>
          <CardHead title="By Category" sub="Where the money went" />
          <div className="mt-3 space-y-2.5">
            {byCat.length === 0 ? <Empty msg="No expenses in range" /> : byCat.map((c) => {
              const pct = byCat[0].value ? Math.round((c.value / byCat[0].value) * 100) : 0;
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1"><span style={{ color: "var(--ink)" }}>{c.emoji} {c.name}</span><span className="font-bold tnum" style={{ color: "var(--purple)" }}>{money(c.value)}</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: GOLD_GRAD }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Entries list */}
        <Card className="lg:col-span-2" pad="p-0">
          <CardHead title="Expense Entries" sub={`${filtered.length} in range`} className="px-4 pt-4" />
          <div className="mt-2 divide-y thin-scroll overflow-y-auto" style={{ borderColor: "var(--line)", maxHeight: 460 }}>
            {filtered.length === 0 ? <div className="p-4"><Empty msg="Nothing logged yet — add your first expense above" /></div> : filtered.map((e) => {
              const c = EXPENSE_CATS.find((x) => x.id === e.cat) || { name: "Other", emoji: "🧾" };
              return (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: "var(--surface2)" }}>{c.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{c.name}{e.vendor ? <span className="font-normal" style={{ color: "var(--muted)" }}> · {e.vendor}</span> : null}</div>
                    <div className="text-[11px] flex items-center gap-1.5 mt-0.5" style={{ color: "var(--muted)" }}><PayIcon m={e.method} /> {e.method} · {fmtDate(e.createdAt)}</div>
                  </div>
                  <div className="text-sm font-bold tnum shrink-0" style={{ color: "var(--ink)" }}>AED {money(e.amount)}</div>
                  <button onClick={() => remove(e.id)} className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#E6553A", background: "var(--surface2)" }} aria-label="Delete expense"><Trash2 size={15} /></button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Reports({ orders, todays, items, restaurant, expenses = [] }) {
  const [range, setRange] = useState("today");
  const data = range === "today" ? todays : orders;
  const done = data.filter((o) => o.status !== "Cancelled");

  const summary = useMemo(() => {
    const sales = done.reduce((s, o) => s + o.totals.grandTotal, 0);
    const net = done.reduce((s, o) => s + o.totals.netAmount, 0);
    const vat = done.reduce((s, o) => s + o.totals.vatAmount, 0);
    const profit = done.reduce((s, o) => s + o.totals.profit, 0);
    const disc = done.reduce((s, o) => s + o.totals.discountAmt, 0);
    return { sales, net, vat, profit, disc, count: done.length, cancelled: data.length - done.length };
  }, [data, done]);

  const expFiltered = useMemo(() => {
    if (range === "all") return expenses;
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    return expenses.filter((e) => new Date(e.createdAt) >= d0);
  }, [expenses, range]);
  const expTotal = round2(expFiltered.reduce((s, e) => s + e.amount, 0));
  const expByCat = useMemo(() => {
    const m = {};
    expFiltered.forEach((e) => { const n = EXPENSE_CATS.find((c) => c.id === e.cat)?.name || "Other"; m[n] = (m[n] || 0) + e.amount; });
    return Object.entries(m).map(([k, v]) => ({ category: k, value: round2(v) })).sort((a, b) => b.value - a.value);
  }, [expFiltered]);
  const netAfterExp = round2(summary.profit - expTotal);
  const KV = ({ k, v, bold, big, danger }) => (
    <div className="flex justify-between items-baseline">
      <span style={{ color: "var(--muted)" }}>{k}</span>
      <span className={`tnum ${bold ? "font-bold" : "font-semibold"} ${big ? "text-base" : ""}`} style={{ color: danger ? "#E6553A" : "var(--ink)" }}>{v}</span>
    </div>
  );

  const byPay = useMemo(() => {
    const m = {}; done.forEach((o) => { m[o.payment.method] = (m[o.payment.method] || 0) + o.totals.grandTotal; });
    return Object.entries(m).map(([k, v]) => ({ method: k, value: round2(v) }));
  }, [done]);

  const byCat = useMemo(() => {
    const m = {};
    done.forEach((o) => o.lines.forEach((l) => {
      const it = items.find((i) => i.id === l.itemId);
      const cn = CATEGORIES.find((c) => c.id === it?.cat)?.name || "Other";
      m[cn] = (m[cn] || 0) + l.price * l.qty;
    }));
    return Object.entries(m).map(([k, v]) => ({ category: k, value: round2(v) })).sort((a, b) => b.value - a.value);
  }, [done, items]);

  const itemSales = useMemo(() => {
    const m = {};
    done.forEach((o) => o.lines.forEach((l) => {
      if (!m[l.name]) m[l.name] = { name: l.name, qty: 0, revenue: 0 };
      m[l.name].qty += l.qty; m[l.name].revenue += l.price * l.qty;
    }));
    return Object.values(m).sort((a, b) => b.revenue - a.revenue);
  }, [done]);

  function exportCSV() {
    const rows = [["Order Ref", "Date/Time", "Customer", "Type", "Items", "Subtotal", "Discount", "Net", "VAT", "Grand Total", "Payment", "Status"]];
    data.forEach((o) => rows.push([
      o.ref, new Date(o.createdAt).toLocaleString("en-GB"), o.customer.name, o.type,
      o.lines.map((l) => `${l.qty}x ${l.name}`).join("; "),
      money(o.totals.grossSubtotal), money(o.totals.discountAmt), money(o.totals.netAmount),
      money(o.totals.vatAmount), money(o.totals.grandTotal), o.payment.method, o.status,
    ]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    download(new Blob([csv], { type: "text/csv" }), `chai-sales-${range}.csv`);
  }
  function exportExcel() {
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(data.map((o) => ({
      Ref: o.ref, DateTime: new Date(o.createdAt).toLocaleString("en-GB"), Customer: o.customer.name,
      Type: o.type, Table: o.table, Items: o.lines.map((l) => `${l.qty}x ${l.name}`).join("; "),
      Subtotal: round2(o.totals.grossSubtotal), Discount: round2(o.totals.discountAmt),
      Net: round2(o.totals.netAmount), VAT: round2(o.totals.vatAmount), Total: round2(o.totals.grandTotal),
      Payment: o.payment.method, Status: o.status,
    })));
    XLSX.utils.book_append_sheet(wb, ws1, "Orders");
    const ws2 = XLSX.utils.json_to_sheet(itemSales.map((i) => ({ Item: i.name, Qty: i.qty, Revenue: round2(i.revenue) })));
    XLSX.utils.book_append_sheet(wb, ws2, "Item Sales");
    const ws3 = XLSX.utils.json_to_sheet(expFiltered.map((e) => ({
      Date: new Date(e.createdAt).toLocaleDateString("en-GB"),
      Time: new Date(e.createdAt).toLocaleTimeString("en-GB"),
      Category: EXPENSE_CATS.find((c) => c.id === e.cat)?.name || "Other",
      Vendor: e.vendor, Method: e.method, Amount: round2(e.amount),
    })));
    XLSX.utils.book_append_sheet(wb, ws3, "Expenses");
    const ws4 = XLSX.utils.json_to_sheet([
      { Metric: "Gross Sales", AED: round2(summary.sales) },
      { Metric: "Net Sales (excl VAT)", AED: round2(summary.net) },
      { Metric: "VAT 5%", AED: round2(summary.vat) },
      { Metric: "Food Cost (COGS)", AED: round2(summary.net - summary.profit) },
      { Metric: "Gross Profit", AED: round2(summary.profit) },
      { Metric: "Expenses", AED: round2(expTotal) },
      { Metric: "Net Profit", AED: round2(netAfterExp) },
    ]);
    XLSX.utils.book_append_sheet(wb, ws4, "Summary");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    download(new Blob([out], { type: "application/octet-stream" }), `chai-sales-${range}.xlsx`);
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "var(--surface2)" }}>
          {[["today", "Today"], ["all", "All Time"]].map(([k, l]) => (
            <button key={k} onClick={() => setRange(k)} className="px-4 py-1.5 rounded-lg text-sm font-semibold"
              style={{ background: range === k ? "var(--surface)" : "transparent", color: range === k ? "var(--purple)" : "var(--muted)", boxShadow: range === k ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{l}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line)" }}><Download size={15} /> CSV</button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: SIDEBAR_GRAD }}><FileSpreadsheet size={15} /> Excel</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Gross Sales" value={aed(summary.sales)} color="#6D28D9" Icon={TrendingUp} />
        <Stat label="Net Sales" value={aed(summary.net)} color="#9B7CF6" Icon={Wallet} />
        <Stat label="VAT (5%)" value={aed(summary.vat)} color="#C19A2B" Icon={FileText} />
        <Stat label="Gross Profit" value={aed(summary.profit)} color="#1F9D6B" Icon={Coins} />
        <Stat label="Expenses" value={aed(expTotal)} color="#E6553A" Icon={ReceiptIcon} />
        <Stat label="Net Profit" value={aed(netAfterExp)} color="#1F9D6B" Icon={TrendingUp} />
        <Stat label="Discounts" value={aed(summary.disc)} color="#C19A2B" Icon={Percent} />
        <Stat label="Orders" value={summary.count} color="#6D28D9" Icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHead title="Sales by Category" sub="Revenue (AED)" />
          <div className="mt-3 space-y-2.5">
            {byCat.length === 0 ? <Empty msg="No data" /> : byCat.map((c) => {
              const pct = Math.round((c.value / byCat[0].value) * 100);
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1"><span style={{ color: "var(--ink)" }}>{c.category}</span><span className="font-bold tnum" style={{ color: "var(--purple)" }}>{money(c.value)}</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: GOLD_GRAD }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardHead title="Payment Method Report" sub="Collections (AED)" />
          <div className="mt-3 space-y-3">
            {byPay.length === 0 ? <Empty msg="No data" /> : byPay.map((p) => (
              <div key={p.method} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--surface2)" }}>
                <div className="flex items-center gap-2">
                  {p.method === "Cash" ? <Banknote size={18} style={{ color: "var(--purple)" }} /> : p.method === "Card" ? <CreditCard size={18} style={{ color: "var(--purple)" }} /> : <Smartphone size={18} style={{ color: "var(--purple)" }} />}
                  <span className="font-medium" style={{ color: "var(--ink)" }}>{p.method}</span>
                </div>
                <span className="font-bold tnum" style={{ color: "var(--ink)" }}>{aed(p.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHead title="Expenses by Category" sub={`Total ${aed(expTotal)}`} />
          <div className="mt-3 space-y-2.5">
            {expByCat.length === 0 ? <Empty msg="No expenses in range" /> : expByCat.map((c) => {
              const pct = expByCat[0].value ? Math.round((c.value / expByCat[0].value) * 100) : 0;
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1"><span style={{ color: "var(--ink)" }}>{c.category}</span><span className="font-bold tnum" style={{ color: "#E6553A" }}>{money(c.value)}</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#E6553A,#C1402B)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardHead title="Profit Summary" sub="After food cost & expenses" />
          <div className="mt-3 space-y-2.5 text-sm">
            <KV k="Net Sales (excl. VAT)" v={aed(summary.net)} />
            <KV k="− Food cost (COGS)" v={aed(round2(summary.net - summary.profit))} danger />
            <KV k="= Gross Profit" v={aed(summary.profit)} bold />
            <KV k="− Expenses" v={aed(expTotal)} danger />
            <div className="h-px my-1.5" style={{ background: "var(--line)" }} />
            <KV k="Net Profit" v={aed(netAfterExp)} bold big />
          </div>
        </Card>
      </div>

      <Card pad="p-0">
        <CardHead title="Item-wise Sales" sub="Quantity & revenue" className="px-4 pt-4" />
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                <th className="text-left font-semibold px-4 py-3">Item</th>
                <th className="text-right font-semibold px-4 py-3">Qty Sold</th>
                <th className="text-right font-semibold px-4 py-3">Revenue (AED)</th>
              </tr>
            </thead>
            <tbody>
              {itemSales.length === 0 ? <tr><td colSpan={3} className="px-4 py-6 text-center" style={{ color: "var(--muted)" }}>No sales in this range</td></tr>
                : itemSales.map((i) => (
                  <tr key={i.name} style={{ borderBottom: "1px solid var(--line)" }} className="menu-row">
                    <td className="px-4 py-2.5 font-medium" style={{ color: "var(--ink)" }}>{i.name}</td>
                    <td className="px-4 py-2.5 text-right tnum" style={{ color: "var(--muted)" }}>{i.qty}</td>
                    <td className="px-4 py-2.5 text-right font-bold tnum" style={{ color: "var(--purple)" }}>{money(i.revenue)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ============================ SETTINGS ================================= */
function SettingsView({ restaurant, setRestaurant, dark, setDark, resetDemo, flash }) {
  const [f, setF] = useState(restaurant);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { setRestaurant({ ...f, servicePct: Number(f.servicePct) || 0 }); flash("Settings saved"); };
  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-4">
      <Card>
        <CardHead title="Restaurant Profile" sub="Appears on every receipt" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <Field label="Restaurant name"><input value={f.name} onChange={(e) => set("name", e.target.value)} className="modal-input" /></Field>
          <Field label="Arabic name"><input value={f.arabicName} onChange={(e) => set("arabicName", e.target.value)} className="modal-input" dir="rtl" /></Field>
          <Field label="Address line 1"><input value={f.address1} onChange={(e) => set("address1", e.target.value)} className="modal-input" /></Field>
          <Field label="Address line 2"><input value={f.address2} onChange={(e) => set("address2", e.target.value)} className="modal-input" /></Field>
          <Field label="Phone 1"><input value={f.phone1} onChange={(e) => set("phone1", e.target.value)} className="modal-input" /></Field>
          <Field label="Phone 2"><input value={f.phone2} onChange={(e) => set("phone2", e.target.value)} className="modal-input" /></Field>
          <Field label="VAT / TRN number"><input value={f.vat} onChange={(e) => set("vat", e.target.value)} className="modal-input tnum" /></Field>
          <Field label="Trade licence"><input value={f.license} onChange={(e) => set("license", e.target.value)} className="modal-input" /></Field>
          <Field label="Service charge %"><input type="number" value={f.servicePct} onChange={(e) => set("servicePct", e.target.value)} className="modal-input tnum" /></Field>
          <Field label="Currency"><input value={f.currency} onChange={(e) => set("currency", e.target.value)} className="modal-input" /></Field>
          <Field label="Receipt footer" full><input value={f.receiptFooter} onChange={(e) => set("receiptFooter", e.target.value)} className="modal-input" /></Field>
        </div>
        <div className="flex items-center justify-between mt-4 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface2)" }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink)" }}>{dark ? <Moon size={16} /> : <Sun size={16} />} Dark mode</div>
          <button onClick={() => setDark((d) => !d)} className="relative w-11 h-6 rounded-full transition-all" style={{ background: dark ? "var(--purple)" : "var(--line)" }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: dark ? "22px" : "2px" }} />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: SIDEBAR_GRAD }}><Save size={15} /> Save settings</button>
          <button onClick={resetDemo} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--surface)", color: "#E6553A", border: "1px solid var(--line)" }}><RotateCcw size={15} /> Reset demo data</button>
        </div>
      </Card>

      <Card>
        <CardHead title="Security & Roles" sub="What each role can access" />
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.entries(ROLES).map(([role, perms]) => (
            <div key={role} className="p-3 rounded-xl" style={{ background: "var(--surface2)" }}>
              <div className="font-bold text-sm mb-1" style={{ color: "var(--purple)" }}>{role}</div>
              <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{perms.join(" · ")}</div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>In the deployed app, roles are enforced by Supabase Auth with hashed passwords, session timeout, and audit logs.</p>
      </Card>
    </div>
  );
}

/* ============================= RECEIPT ================================= */
function Receipt({ order, restaurant, onClose, flash }) {
  const t = order.totals;
  const dt = new Date(order.createdAt);
  const PAY_AR = { Cash: "نقداً", Card: "بطاقة", UPI: "دفع إلكتروني" };
  const TYPE_AR = { "Dine In": "في المطعم", "Take Away": "طلب خارجي", "Delivery": "توصيل" };
  const billText = useMemo(() => {
    let s = `${restaurant.name}\n${restaurant.arabicName}\n${restaurant.address1}\n${restaurant.address2}\nTel/هاتف: ${restaurant.phone1}\nVAT/الرقم الضريبي: ${restaurant.vat}\n\nTAX INVOICE / فاتورة ضريبية — #${order.ref}\n${dt.toLocaleString("en-GB")}\n${order.type} / ${TYPE_AR[order.type] || ""}${order.table ? ` · Table ${order.table}` : ""}\nCustomer/العميل: ${order.customer.name}\n\n`;
    order.lines.forEach((l) => { s += `${l.qty} x ${l.name}  ${money(l.price * l.qty)}\n`; });
    s += `\nSubtotal/المجموع الفرعي: ${money(t.grossSubtotal)} AED\n`;
    if (t.discountAmt > 0) s += `Discount/الخصم: -${money(t.discountAmt)} AED\n`;
    s += `Net/الصافي: ${money(t.netAmount)} AED\nVAT 5%/الضريبة: ${money(t.vatAmount)} AED\nGRAND TOTAL/الإجمالي: ${money(t.grandTotal)} AED\nPaid/الدفع: ${order.payment.method} (${PAY_AR[order.payment.method] || order.payment.method})\n\n${restaurant.receiptFooter}`;
    return s;
  }, [order, restaurant]);

  const wa = () => window.open(`https://wa.me/${(order.customer.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(billText)}`, "_blank");
  const email = () => { window.location.href = `mailto:?subject=${encodeURIComponent(`Tax Invoice — ${restaurant.name} #${order.ref}`)}&body=${encodeURIComponent(billText)}`; };
  const print = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay no-print" onClick={onClose} style={{ background: "rgba(20,10,40,0.55)" }}>
      <div className="w-full max-w-sm modal-in" onClick={(e) => e.stopPropagation()}>
        {/* Receipt paper */}
        <div id="print-receipt" className="bg-white rounded-t-2xl px-6 py-6 text-black overflow-y-auto thin-scroll" style={{ maxHeight: "70vh", fontFamily: "'Courier New', monospace" }}>
          <div className="text-center">
            <div className="flex justify-center mb-1.5"><CafeLogo size={68} /></div>
            <div style={{ fontFamily: "Fraunces, serif" }} className="text-lg font-bold tracking-wide leading-tight">{restaurant.name}</div>
            <div className="text-[12px] mt-0.5 font-semibold" dir="rtl">{restaurant.arabicName}</div>
            <div className="text-[11px] leading-tight mt-1">{restaurant.address1}<br />{restaurant.address2}</div>
            <div className="text-[11px]">Tel / هاتف: {restaurant.phone1}</div>
            <div className="text-[11px] font-bold">VAT No / الرقم الضريبي: {restaurant.vat}</div>
          </div>
          <div className="border-t border-b border-dashed border-gray-400 my-2.5 py-1 text-center font-bold text-sm">{restaurant.receiptHeader}</div>
          <div className="flex justify-between text-[11px]"><span>Order # / رقم الطلب: <b>{order.ref}</b></span><span className="text-right">{order.type}{order.table ? ` · T${order.table}` : ""}<br /><span dir="rtl" className="text-gray-500" style={{ fontSize: 9 }}>{TYPE_AR[order.type] || ""}{order.table ? ` · طاولة ${order.table}` : ""}</span></span></div>
          <div className="flex justify-between text-[11px]"><span>Items / الأصناف: {order.totals.itemCount}</span><span>{dt.toLocaleDateString("en-GB")} {dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span></div>
          <div className="text-[11px]">Customer / العميل: {order.customer.name || "—"}</div>
          <div className="border-t border-dashed border-gray-400 mt-2 pt-1.5">
            <div className="flex justify-between text-[10px] font-bold mb-1"><span>DESCRIPTION / الوصف</span><span>TOTAL / المبلغ</span></div>
            {order.lines.map((l, i) => (
              <div key={i} className="flex justify-between text-[11px] py-0.5">
                <span className="flex-1">{l.qty} × {l.name}</span>
                <span>{money(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-400 mt-2 pt-1.5 text-[11px] space-y-1">
            <BiRow en="Subtotal" ar="المجموع الفرعي" val={`AED ${money(t.grossSubtotal)}`} />
            {t.discountAmt > 0 && <BiRow en="Discount" ar="الخصم" val={`− ${money(t.discountAmt)}`} />}
            {t.serviceAmt > 0 && <BiRow en="Service" ar="رسوم الخدمة" val={`AED ${money(t.serviceAmt)}`} />}
            <BiRow en="Net Amount" ar="المبلغ الصافي" val={`AED ${money(t.netAmount)}`} />
            <BiRow en="VAT (5%)" ar="ضريبة القيمة المضافة ٥٪" val={`AED ${money(t.vatAmount)}`} />
            <BiRow en="GRAND TOTAL" ar="الإجمالي العام" val={`AED ${money(t.grandTotal)}`} strong />
          </div>
          <div className="border-t border-dashed border-gray-400 mt-2 pt-1.5 text-[11px] space-y-1">
            <div className="font-bold">VAT Summary <span dir="rtl" className="text-gray-500" style={{ fontSize: 9 }}>ملخص الضريبة</span></div>
            <BiRow en={`5% on ${money(t.netAmount)}`} ar={`٥٪ على ${money(t.netAmount)}`} val={money(t.vatAmount)} />
            <BiRow en={`Paid · ${order.payment.method}`} ar={`الدفع · ${PAY_AR[order.payment.method] || order.payment.method}`} val={`AED ${money(order.payment.method === "Cash" ? order.payment.tendered : t.grandTotal)}`} />
            {order.payment.method === "Cash" && <BiRow en="Change" ar="المبلغ المتبقي" val={`AED ${money(Math.max(0, order.payment.tendered - t.grandTotal))}`} />}
          </div>
          <div className="text-center text-[11px] mt-3">
            <div>Served by / قدمها: {order.cashier}</div>
            <div className="mt-1.5 font-bold leading-snug">{restaurant.receiptFooter}</div>
            <div className="mt-2 inline-block px-3 py-2 border border-gray-300 rounded text-[9px]" style={{ letterSpacing: 1 }}>▓▒░ QR ░▒▓<br />Scan to pay / امسح للدفع</div>
          </div>
        </div>
        {/* Actions */}
        <div className="bg-white rounded-b-2xl px-4 py-3 border-t border-gray-200 no-print">
          <div className="grid grid-cols-4 gap-2 mb-2">
            <ActionBtn onClick={print} Icon={Printer} label="Print" />
            <ActionBtn onClick={print} Icon={FileText} label="PDF" />
            <ActionBtn onClick={wa} Icon={MessageCircle} label="WhatsApp" green />
            <ActionBtn onClick={email} Icon={Mail} label="Email" />
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: SIDEBAR_GRAD }}>Done — New Order</button>
        </div>
      </div>
    </div>
  );
}

/* =========================== SMALL PARTS =============================== */
// Real brand logo (chai-wala pouring tea) embedded as a transparent PNG
// data URI so it needs no hosted asset and works inside the artifact.
const LOGO_SRC = "data:image/png;base64,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";

function CafeLogo({ size = 64 }) {
  return (
    <img src={LOGO_SRC} alt="Chai Al Saadah Cafeteria logo"
      style={{ width: size, height: size, objectFit: "contain", display: "block" }} />
  );
}

// Bilingual receipt row: English label stacked over Arabic, value on the right.
function BiRow({ en, ar, val, strong }) {
  return (
    <div className={"flex justify-between items-center gap-2 " + (strong ? "font-bold text-sm border-t border-gray-400 mt-1 pt-1" : "")}>
      <span className="flex flex-col leading-tight">
        <span>{en}</span>
        {ar && <span dir="rtl" className="text-gray-500" style={{ fontSize: 8.5, lineHeight: 1.1 }}>{ar}</span>}
      </span>
      <span className="whitespace-nowrap text-right">{val}</span>
    </div>
  );
}

function Wordmark({ small, center, light }) {
  return (
    <div className={center ? "text-center" : ""}>
      <div style={{ fontFamily: "Fraunces, serif", lineHeight: 1 }}>
        <span style={{ fontStyle: "italic", fontWeight: 500, fontSize: small ? 16 : 20, color: "#E6C15A" }}>Chai </span>
        <span style={{ fontWeight: 800, fontSize: small ? 18 : 24, letterSpacing: 0.5, color: light ? "#2E1065" : "#E6C15A" }}>AL SAADAH</span>
      </div>
      {!small && <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, color: center ? "#6D28D9" : "rgba(255,255,255,0.85)" }}>CAFETERIA</div>}
    </div>
  );
}

function HeroCard({ title, value, sub, Icon, accent }) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: accent ? SIDEBAR_GRAD : "var(--surface)", border: accent ? "none" : "1px solid var(--line)" }}>
      {accent && <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full" style={{ background: "rgba(230,193,90,0.18)" }} />}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: accent ? "rgba(255,255,255,0.8)" : "var(--muted)" }}>{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent ? "rgba(255,255,255,0.15)" : "var(--surface2)" }}>
          <Icon size={16} style={{ color: accent ? "#E6C15A" : "var(--purple)" }} />
        </div>
      </div>
      <div className="text-xl md:text-2xl font-bold tnum" style={{ color: accent ? "#fff" : "var(--ink)", fontFamily: "Fraunces, serif" }}>{value}</div>
      <div className="text-[11px] mt-0.5" style={{ color: accent ? "rgba(255,255,255,0.7)" : "var(--muted)" }}>{sub}</div>
    </div>
  );
}

function Stat({ label, value, color, Icon, big }) {
  return (
    <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "1A" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className={`font-bold tnum ${big ? "text-lg" : "text-base"}`} style={{ color: "var(--ink)" }}>{value}</div>
        <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{label}</div>
      </div>
    </div>
  );
}

function Card({ children, className = "", pad = "p-4 md:p-5" }) {
  return <div className={`rounded-2xl ${pad} ${className}`} style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>{children}</div>;
}
function CardHead({ title, sub, className = "" }) {
  return (
    <div className={className}>
      <h3 className="font-bold" style={{ color: "var(--ink)", fontFamily: "Fraunces, serif" }}>{title}</h3>
      {sub && <p className="text-xs" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}
function Row({ label, value, muted, negative }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span className="tnum" style={{ color: negative ? "#E6553A" : muted ? "var(--muted)" : "var(--ink)", fontWeight: muted ? 400 : 500 }}>{value}</span>
    </div>
  );
}
function QtyBtn({ children, onClick }) {
  return <button onClick={onClick} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: "var(--surface2)", color: "var(--purple)", border: "1px solid var(--line)" }}>{children}</button>;
}
function MiniBtn({ children, onClick, color, outline }) {
  return <button onClick={onClick} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
    style={outline ? { color, border: "1px solid var(--line)", background: "var(--surface)" } : { color: "#fff", background: color }}>{children}</button>;
}
function Chip({ children, active, onClick }) {
  return <button onClick={onClick} className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap shrink-0"
    style={{ background: active ? "var(--purple)" : "var(--surface)", color: active ? "#fff" : "var(--muted)", border: "1px solid var(--line)", fontWeight: active ? 600 : 400 }}>{children}</button>;
}
function StatusPill({ status }) {
  const c = { Completed: ["#E7F7F0", "#1F9D6B"], Preparing: ["#FBF1DC", "#B5891F"], Pending: ["#F1E9FE", "#6D28D9"], Ready: ["#E6F0FF", "#2563EB"], Cancelled: ["#FDE9E5", "#E6553A"] }[status] || ["#eee", "#666"];
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: c[0], color: c[1] }}>{status}</span>;
}
function LabeledInput({ Icon, value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-8 pr-2 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface2)", border: "1px solid var(--line)", color: "var(--ink)" }} />
    </div>
  );
}
function Field({ label, children, full }) {
  return <label className={`block ${full ? "sm:col-span-2" : ""}`}><span className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>{label}</span>{children}</label>;
}
function ActionBtn({ onClick, Icon, label, green }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-semibold" style={{ background: green ? "#E7F7EE" : "#F3EDFE", color: green ? "#1F9D6B" : "#6D28D9" }}>
      <Icon size={16} />{label}
    </button>
  );
}
function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose} style={{ background: "rgba(20,10,40,0.55)" }}>
      <div className="w-full max-w-md rounded-2xl p-5 modal-in" onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: "var(--ink)", fontFamily: "Fraunces, serif" }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--muted)" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Empty({ msg }) {
  return <div className="h-full min-h-[100px] flex flex-col items-center justify-center text-center py-8" style={{ color: "var(--muted)" }}><Coffee size={28} className="opacity-30 mb-2" /><p className="text-sm">{msg}</p></div>;
}
function tooltipStyle(dark) {
  return { background: dark ? "#1D1640" : "#fff", border: "1px solid " + (dark ? "#2D2456" : "#ECE8F7"), borderRadius: 10, fontSize: 12, color: dark ? "#F2EFFB" : "#241B43" };
}
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function StyleBlock() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..600&family=Inter:wght@400;500;600;700&display=swap');
      * { font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; }
      .tnum { font-variant-numeric: tabular-nums; }
      .thin-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      .thin-scroll::-webkit-scrollbar-thumb { background: rgba(109,40,217,0.25); border-radius: 99px; }
      .thin-scroll::-webkit-scrollbar-track { background: transparent; }
      .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .item-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(46,16,101,0.12); border-color: rgba(193,154,43,0.5) !important; }
      .item-card:active { transform: translateY(-1px) scale(0.99); }
      .charge-btn:hover { filter: brightness(1.08); box-shadow: 0 8px 22px rgba(46,16,101,0.35); }
      .charge-btn:active { transform: scale(0.99); }
      .menu-row:hover { background: var(--surface2); }
      .modal-input { width:100%; padding:0.6rem 0.75rem; border-radius:0.6rem; font-size:0.875rem; outline:none; background:var(--surface2); border:1px solid var(--line); color:var(--ink); }
      .modal-input:focus { border-color: var(--purple); }
      .modal-overlay { animation: fade .18s ease; }
      .modal-in { animation: pop .22s cubic-bezier(.2,.8,.2,1); }
      .login-card { animation: pop .35s cubic-bezier(.2,.8,.2,1); }
      .line-in { animation: slidein .2s ease; }
      .toast-in { animation: toastup .3s cubic-bezier(.2,.8,.2,1); }
      @keyframes fade { from{opacity:0} to{opacity:1} }
      @keyframes pop { from{opacity:0; transform:translateY(8px) scale(.97)} to{opacity:1; transform:translateY(0) scale(1)} }
      @keyframes slidein { from{opacity:0; transform:translateX(6px)} to{opacity:1; transform:translateX(0)} }
      @keyframes toastup { from{opacity:0; transform:translate(-50%,12px)} to{opacity:1; transform:translate(-50%,0)} }
      input::placeholder { color: var(--muted); opacity:0.7; }
      select { -webkit-appearance:none; appearance:none; }
      @media print {
        body * { visibility: hidden !important; }
        #print-receipt, #print-receipt * { visibility: visible !important; }
        #print-receipt { position: fixed; left: 0; top: 0; width: 80mm; max-height:none !important; box-shadow:none; border-radius:0; }
        .no-print { display: none !important; }
      }
    `}</style>
  );
}
