import { ilike, or, eq, and, desc } from "drizzle-orm";
import { db } from "../../config/database.js";
import {
  products,
  categories,
  sales,
  salesReturns,
  transfers,
  dailyClosings,
} from "../../database/schema/index.js";
import {
  SearchGroupedResults,
  SearchResponse,
  SearchResultItem,
} from "./schema.js";

interface SearchUser {
  id?: string;
  userId?: string;
  role: string;
  branchId?: string | null;
}

interface NavItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  badge: string;
  keywords: string[];
  ownerOnly: boolean;
}

const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: "nav-dashboard",
    title: "Dashboard",
    subtitle: "Overview of key business metrics & operations",
    url: "/",
    badge: "Home",
    keywords: ["home", "dashboard", "kpi", "overview", "analytics", "metrics"],
    ownerOnly: false,
  },
  {
    id: "nav-catalog",
    title: "Product Catalog",
    subtitle: "Browse and manage products, units, and categories",
    url: "/catalog",
    badge: "Catalog",
    keywords: ["catalog", "products", "categories", "sku", "units", "items"],
    ownerOnly: false,
  },
  {
    id: "nav-inventory",
    title: "Current Inventory",
    subtitle: "Stock levels, available quantities, and low-stock alerts",
    url: "/inventory",
    badge: "Inventory",
    keywords: ["inventory", "stock", "balances", "quantity", "available", "levels"],
    ownerOnly: false,
  },
  {
    id: "nav-movements",
    title: "Inventory Movements",
    subtitle: "Track inventory additions, deductions, sales, and transfers",
    url: "/inventory/movements",
    badge: "Inventory",
    keywords: ["movements", "audit", "history", "stock movements", "deductions"],
    ownerOnly: false,
  },
  {
    id: "nav-stocktake",
    title: "Stocktake & Physical Count",
    subtitle: "Perform stock reconciliation and discrepancy adjustments",
    url: "/inventory/stocktake",
    badge: "Inventory",
    keywords: ["stocktake", "count", "reconciliation", "adjustments", "audit"],
    ownerOnly: false,
  },
  {
    id: "nav-sales-new",
    title: "New Sale (Point of Sale)",
    subtitle: "Process transactions, checkout, and tender payments",
    url: "/sales/new",
    badge: "Sales",
    keywords: ["new sale", "pos", "sell", "checkout", "cashier", "order"],
    ownerOnly: false,
  },
  {
    id: "nav-sales-history",
    title: "Sales History",
    subtitle: "View completed sales, receipts, and order records",
    url: "/sales",
    badge: "Sales",
    keywords: ["sales", "orders", "receipts", "history", "transactions"],
    ownerOnly: false,
  },
  {
    id: "nav-returns-new",
    title: "New Return",
    subtitle: "Process customer returns and issue refunds",
    url: "/sales/returns/new",
    badge: "Returns",
    keywords: ["new return", "refund", "return item", "exchange"],
    ownerOnly: false,
  },
  {
    id: "nav-returns-history",
    title: "Returns History",
    subtitle: "Review processed customer returns and refund audit",
    url: "/sales/returns",
    badge: "Returns",
    keywords: ["returns", "refunds", "returns history", "damaged goods"],
    ownerOnly: false,
  },
  {
    id: "nav-transfers-new",
    title: "New Branch Transfer",
    subtitle: "Request or initiate stock transfer between branches",
    url: "/transfers/new",
    badge: "Transfers",
    keywords: ["new transfer", "send stock", "inter-branch", "dispatch"],
    ownerOnly: false,
  },
  {
    id: "nav-transfers-list",
    title: "Transfers List",
    subtitle: "Track transfer shipments, approvals, and receipts",
    url: "/transfers",
    badge: "Transfers",
    keywords: ["transfers", "shipments", "in-transit", "branch transfer"],
    ownerOnly: false,
  },
  {
    id: "nav-daily-closing",
    title: "Daily Closing",
    subtitle: "End-of-day register closing and cash reconciliation",
    url: "/daily-closing",
    badge: "Closing",
    keywords: ["closing", "daily closing", "register", "end of day", "eod", "cash count"],
    ownerOnly: false,
  },
  {
    id: "nav-closing-history",
    title: "Closing History",
    subtitle: "Review historical daily closings, approvals, and discrepancies",
    url: "/daily-closing/history",
    badge: "Closing",
    keywords: ["closing history", "eod history", "shift history", "cash reconciliation"],
    ownerOnly: false,
  },
  {
    id: "nav-notifications",
    title: "Notifications",
    subtitle: "Alerts, stock warnings, and pending approval notices",
    url: "/notifications",
    badge: "Alerts",
    keywords: ["notifications", "alerts", "inbox", "messages"],
    ownerOnly: false,
  },
  // Owner only destinations
  {
    id: "nav-receivings-new",
    title: "New Stock Receiving",
    subtitle: "Receive supplier shipments and update purchase costs",
    url: "/receivings/new",
    badge: "Receiving",
    keywords: ["receive", "purchase order", "supplier delivery", "grn", "restock"],
    ownerOnly: true,
  },
  {
    id: "nav-receivings-history",
    title: "Receiving History",
    subtitle: "Historical supplier purchases and intake records",
    url: "/receivings",
    badge: "Receiving",
    keywords: ["receivings", "purchase history", "supplier deliveries", "intake"],
    ownerOnly: true,
  },
  {
    id: "nav-reports",
    title: "Reports & Analytics",
    subtitle: "Sales performance, inventory valuation, and profit margins",
    url: "/reports",
    badge: "Reports",
    keywords: ["reports", "analytics", "financial", "profit", "margin", "valuation"],
    ownerOnly: true,
  },
  {
    id: "nav-reports-sales",
    title: "Sales Reports",
    subtitle: "Detailed breakdown of sales trends by branch and date",
    url: "/reports/sales",
    badge: "Reports",
    keywords: ["sales reports", "revenue", "trends", "performance"],
    ownerOnly: true,
  },
  {
    id: "nav-employees",
    title: "Employee Management",
    subtitle: "Manage staff accounts, credentials, and branch assignments",
    url: "/users/employees",
    badge: "Users",
    keywords: ["employees", "users", "staff", "cashiers", "permissions"],
    ownerOnly: true,
  },
  {
    id: "nav-branches",
    title: "Branch Management",
    subtitle: "Configure store branches, warehouses, and locations",
    url: "/users/branches",
    badge: "Branches",
    keywords: ["branches", "stores", "locations", "warehouse"],
    ownerOnly: true,
  },
  {
    id: "nav-suppliers",
    title: "Supplier Management",
    subtitle: "Maintain vendor directory, contacts, and payment terms",
    url: "/suppliers",
    badge: "Suppliers",
    keywords: ["suppliers", "vendors", "contacts", "distributors"],
    ownerOnly: true,
  },
  {
    id: "nav-payment-methods",
    title: "Payment Methods",
    subtitle: "Configure accepted tenders: Cash, Bank, Telebirr, Card",
    url: "/payment-methods",
    badge: "Settings",
    keywords: ["payment methods", "tenders", "cash", "telebirr", "bank", "pos"],
    ownerOnly: true,
  },
  {
    id: "nav-audit-logs",
    title: "System Audit Log",
    subtitle: "Security, administrative activity, and compliance tracking",
    url: "/audit-logs",
    badge: "Audit",
    keywords: ["audit", "audit log", "security", "activity", "compliance", "logs"],
    ownerOnly: true,
  },
  {
    id: "nav-settings",
    title: "Company Settings",
    subtitle: "System configuration, currency, and business preferences",
    url: "/settings",
    badge: "Settings",
    keywords: ["settings", "preferences", "config", "system", "business info"],
    ownerOnly: true,
  },
];

export class SearchService {
  async search(query: string, user: SearchUser, limit = 10): Promise<SearchResponse> {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        query: "",
        results: {
          navigation: [],
          products: [],
          categories: [],
          sales: [],
          returns: [],
          transfers: [],
          closings: [],
        },
        totalCount: 0,
      };
    }

    const isOwner = user.role === "OWNER";
    const userId = user.id || user.userId || "";
    const lowerQuery = trimmed.toLowerCase();
    const likePattern = `%${trimmed}%`;

    // 1. Navigation items search
    const matchingNav: SearchResultItem[] = NAVIGATION_ITEMS.filter((item) => {
      if (item.ownerOnly && !isOwner) return false;
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const subtitleMatch = item.subtitle.toLowerCase().includes(lowerQuery);
      const keywordMatch = item.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery));
      return titleMatch || subtitleMatch || keywordMatch;
    })
      .sort((a, b) => {
        // Prioritize exact or prefix matches in title
        const aExact = a.title.toLowerCase() === lowerQuery;
        const bExact = b.title.toLowerCase() === lowerQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStart = a.title.toLowerCase().startsWith(lowerQuery);
        const bStart = b.title.toLowerCase().startsWith(lowerQuery);
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;

        return 0;
      })
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        type: "navigation" as const,
        url: item.url,
        badge: item.badge,
      }));

    // 2. Products search
    const productRows = await db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        brand: products.brand,
        isActive: products.isActive,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        or(
          ilike(products.name, likePattern),
          ilike(products.sku, likePattern),
          ilike(products.brand, likePattern)
        )
      )
      .limit(limit * 2);

    const matchingProducts: SearchResultItem[] = productRows
      .sort((a, b) => {
        const aSkuExact = a.sku.toLowerCase() === lowerQuery;
        const bSkuExact = b.sku.toLowerCase() === lowerQuery;
        if (aSkuExact && !bSkuExact) return -1;
        if (!aSkuExact && bSkuExact) return 1;

        const aNameExact = a.name.toLowerCase() === lowerQuery;
        const bNameExact = b.name.toLowerCase() === lowerQuery;
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;

        const aSkuStart = a.sku.toLowerCase().startsWith(lowerQuery);
        const bSkuStart = b.sku.toLowerCase().startsWith(lowerQuery);
        if (aSkuStart && !bSkuStart) return -1;
        if (!aSkuStart && bSkuStart) return 1;

        const aNameStart = a.name.toLowerCase().startsWith(lowerQuery);
        const bNameStart = b.name.toLowerCase().startsWith(lowerQuery);
        if (aNameStart && !bNameStart) return -1;
        if (!aNameStart && bNameStart) return 1;

        return 0;
      })
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `SKU: ${p.sku}${p.categoryName ? ` • ${p.categoryName}` : ""}${p.brand ? ` • ${p.brand}` : ""}`,
        type: "product" as const,
        url: "/catalog",
        badge: p.isActive ? "Active" : "Inactive",
        metadata: {
          sku: p.sku,
          brand: p.brand,
          category: p.categoryName,
        },
      }));

    // 3. Categories search
    const categoryRows = await db
      .select({
        id: categories.id,
        name: categories.name,
        isActive: categories.isActive,
      })
      .from(categories)
      .where(ilike(categories.name, likePattern))
      .limit(limit);

    const matchingCategories: SearchResultItem[] = categoryRows.map((c) => ({
      id: c.id,
      title: c.name,
      subtitle: `Product Category • ${c.isActive ? "Active" : "Inactive"}`,
      type: "category" as const,
      url: "/catalog",
      badge: c.isActive ? "Active" : "Inactive",
    }));

    // 4. Sales search (Strict authorization & branch scoping)
    const salesConditions = [ilike(sales.saleNumber, likePattern)];
    if (!isOwner) {
      if (user.branchId) {
        salesConditions.push(
          or(eq(sales.branchId, user.branchId), eq(sales.createdById, userId))!
        );
      } else {
        salesConditions.push(eq(sales.createdById, userId));
      }
    }

    const saleRows = await db
      .select({
        id: sales.id,
        saleNumber: sales.saleNumber,
        soldAt: sales.soldAt,
        grandTotal: sales.grandTotal,
        status: sales.status,
      })
      .from(sales)
      .where(and(...salesConditions))
      .orderBy(desc(sales.soldAt))
      .limit(limit);

    const matchingSales: SearchResultItem[] = saleRows.map((s) => ({
      id: s.id,
      title: s.saleNumber,
      subtitle: `Sold on ${s.soldAt?.slice(0, 10) || "N/A"} • Total: $${Number(s.grandTotal).toFixed(2)}`,
      type: "sale" as const,
      url: `/sales/${s.id}`,
      badge: s.status,
      metadata: {
        total: s.grandTotal,
        status: s.status,
      },
    }));

    // 5. Returns search (Strict authorization & branch scoping)
    const returnConditions = [
      or(ilike(salesReturns.returnNumber, likePattern), ilike(salesReturns.reason, likePattern))!,
    ];
    if (!isOwner) {
      if (user.branchId) {
        returnConditions.push(
          or(eq(salesReturns.branchId, user.branchId), eq(salesReturns.createdById, userId))!
        );
      } else {
        returnConditions.push(eq(salesReturns.createdById, userId));
      }
    }

    const returnRows = await db
      .select({
        id: salesReturns.id,
        returnNumber: salesReturns.returnNumber,
        returnedAt: salesReturns.returnedAt,
        refundAmount: salesReturns.refundAmount,
        reason: salesReturns.reason,
        status: salesReturns.status,
      })
      .from(salesReturns)
      .where(and(...returnConditions))
      .orderBy(desc(salesReturns.returnedAt))
      .limit(limit);

    const matchingReturns: SearchResultItem[] = returnRows.map((r) => ({
      id: r.id,
      title: r.returnNumber,
      subtitle: `Refund $${Number(r.refundAmount).toFixed(2)} • ${r.reason}`,
      type: "return" as const,
      url: `/sales/returns/${r.id}`,
      badge: r.status,
      metadata: {
        refundAmount: r.refundAmount,
        status: r.status,
      },
    }));

    // 6. Transfers search (Strict authorization & branch scoping)
    const transferConditions = [ilike(transfers.transferNumber, likePattern)];
    if (!isOwner) {
      if (user.branchId) {
        transferConditions.push(
          or(
            eq(transfers.sourceBranchId, user.branchId),
            eq(transfers.destinationBranchId, user.branchId),
            eq(transfers.createdById, userId)
          )!
        );
      } else {
        transferConditions.push(eq(transfers.createdById, userId));
      }
    }

    const transferRows = await db
      .select({
        id: transfers.id,
        transferNumber: transfers.transferNumber,
        status: transfers.status,
        createdAt: transfers.createdAt,
      })
      .from(transfers)
      .where(and(...transferConditions))
      .orderBy(desc(transfers.createdAt))
      .limit(limit);

    const matchingTransfers: SearchResultItem[] = transferRows.map((t) => ({
      id: t.id,
      title: t.transferNumber,
      subtitle: `Status: ${t.status} • Initiated ${t.createdAt?.slice(0, 10) || "N/A"}`,
      type: "transfer" as const,
      url: `/transfers/${t.id}`,
      badge: t.status,
      metadata: {
        status: t.status,
      },
    }));

    // 7. Daily closings search (Strict authorization & branch scoping)
    const closingConditions = [
      or(ilike(dailyClosings.closingNumber, likePattern), ilike(dailyClosings.closingDate, likePattern))!,
    ];
    if (!isOwner) {
      if (user.branchId) {
        closingConditions.push(eq(dailyClosings.branchId, user.branchId));
      } else {
        closingConditions.push(eq(dailyClosings.submittedById, userId));
      }
    }

    const closingRows = await db
      .select({
        id: dailyClosings.id,
        closingNumber: dailyClosings.closingNumber,
        closingDate: dailyClosings.closingDate,
        status: dailyClosings.status,
        salesCount: dailyClosings.salesCount,
      })
      .from(dailyClosings)
      .where(and(...closingConditions))
      .orderBy(desc(dailyClosings.closingDate))
      .limit(limit);

    const matchingClosings: SearchResultItem[] = closingRows.map((c) => ({
      id: c.id,
      title: `${c.closingNumber} (${c.closingDate})`,
      subtitle: `${c.salesCount} sales completed • Status: ${c.status}`,
      type: "closing" as const,
      url: `/daily-closing/history`,
      badge: c.status,
      metadata: {
        date: c.closingDate,
        salesCount: c.salesCount,
        status: c.status,
      },
    }));

    const results: SearchGroupedResults = {
      navigation: matchingNav,
      products: matchingProducts,
      categories: matchingCategories,
      sales: matchingSales,
      returns: matchingReturns,
      transfers: matchingTransfers,
      closings: matchingClosings,
    };

    const totalCount =
      matchingNav.length +
      matchingProducts.length +
      matchingCategories.length +
      matchingSales.length +
      matchingReturns.length +
      matchingTransfers.length +
      matchingClosings.length;

    return {
      query: trimmed,
      results,
      totalCount,
    };
  }
}
