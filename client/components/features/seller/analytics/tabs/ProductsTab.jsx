"use client"

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Eye,
  ShoppingCart,
  DollarSign,
  Star,
  TrendingUp,
  Search,
  Filter,
  X,
  Grid3X3,
  Rows,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Tag,
  Globe,
  Clock,
} from "lucide-react";
import { AnalyticsLoadingScreen } from "../AnalyticsLoadingScreen";

/**
 * ProductsTab — Redesigned (JSX version)
 * ----------------------------------------------
 * • Keeps your existing dark theme + neon #00FF89 accents
 * • Uses the SAME incoming data shape (analyticsData: { products, summary, pagination })
 * • No TypeScript — pure JSX
 * • Adds: sticky toolbar, chip filters, view toggle (Cards/Table), improved charts, A11y, empty/skeleton states
 */

// ---------- Small UI primitives ---------- //
const Chip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-600 bg-gray-800 px-2.5 py-1 text-xs text-gray-200">
    {label}
    {onRemove && (
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 text-gray-400 hover:bg-gray-700 hover:text-white"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </span>
);

const Section = ({ title, icon, right, children }) => (
  <section className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5">
    <header className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {title}
      </h3>
      {right}
    </header>
    {children}
  </section>
);

// ---------- Charts (lightweight SVG + motion) ---------- //
function ProductPerformanceChart({ products }) {
  const hasData = Array.isArray(products) && products.length > 0;
  const base = useMemo(() => (hasData ? products.slice(0, 8) : []), [hasData, products]);

  if (!hasData)
    return (
      <Section
        title="Product Performance"
        icon={<BarChart3 className="h-5 w-5 text-[#00FF89]" />}
      >
        <div className="grid place-items-center py-14 text-center text-gray-400">
          <Package className="mb-3 h-10 w-10 opacity-60" />
          <p className="text-sm">Create your first product to see performance analytics.</p>
        </div>
      </Section>
    );

  const rows = base.map((p) => {
    const views = Number(p.views ?? p.viewCount ?? 0);
    const sales = Number(p.sales ?? p.totalSales ?? p.salesCount ?? 0);
    const price = Number(p.price ?? 0);
    const revenue = Number(p.revenue ?? price * sales);
    const conversion = views > 0 ? (sales / views) * 100 : 0;
    return { id: p._id ?? p.id, title: p.title ?? "Untitled", views, sales, revenue, conversion };
  });

  const maxViews = Math.max(...rows.map((r) => r.views), 1);
  const maxSales = Math.max(...rows.map((r) => r.sales), 1);

  return (
    <Section
      title="Product Performance"
      icon={<BarChart3 className="h-5 w-5 text-[#00FF89]" />}
      right={
        <div className="text-xs text-gray-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-4 rounded bg-gradient-to-r from-[#00FF89] to-[#00E67A]" />Views
          </span>
          <span className="ml-4 inline-flex items-center gap-2">
            <span className="h-2 w-4 rounded bg-gradient-to-r from-blue-500 to-blue-400" />Sales
          </span>
        </div>
      }
    >
      <div className="relative h-64">
        {/* grid */}
        <div className="absolute inset-0">
          {[0, 25, 50, 75, 100].map((p) => (
            <div key={p} className="absolute inset-x-0 border-t border-gray-700/50" style={{ top: `${p}%` }} />
          ))}
        </div>
        {/* bars */}
        <div className="relative flex h-full items-end gap-3">
          {rows.map((r, i) => {
            const viewH = (r.views / maxViews) * 85 + 5; // keep visible
            const saleH = (r.sales / maxSales) * 40 + 4;
            return (
              <div key={r.id} className="group flex min-w-0 flex-1 flex-col items-center">
                <div className="relative h-[85%] w-full max-w-8 rounded-t-lg bg-gray-800">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${viewH}%` }}
                    transition={{ delay: i * 0.06, duration: 0.6, ease: "easeOut" }}
                    className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-[#00FF89] to-[#00E67A]"
                  />
                  <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-gray-900 px-2 py-0.5 text-[10px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                    {r.views.toLocaleString()} views
                  </div>
                </div>
                <div className="relative mt-1 h-[40%] w-full max-w-6 rounded-t-lg bg-gray-800">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${saleH}%` }}
                    transition={{ delay: i * 0.06 + 0.2, duration: 0.6, ease: "easeOut" }}
                    className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400"
                  />
                  <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-gray-900 px-2 py-0.5 text-[10px] text-blue-200 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                    {r.sales} sales
                  </div>
                </div>
                <div className="mt-2 min-w-0 text-center">
                  <div className="truncate text-[11px] text-gray-300" title={r.title}>
                    {r.title}
                  </div>
                  <div className="text-[10px] font-medium text-purple-300">{r.conversion.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-700 pt-4 text-center">
        <div>
          <div className="text-lg font-bold text-[#00FF89]">{rows.reduce((s, r) => s + r.views, 0).toLocaleString()}</div>
          <div className="text-[11px] text-gray-400">Total Views</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400">{rows.reduce((s, r) => s + r.sales, 0)}</div>
          <div className="text-[11px] text-gray-400">Total Sales</div>
        </div>
        <div>
          <div className="text-lg font-bold text-purple-400">
            {(rows.reduce((s, r) => s + r.conversion, 0) / rows.length).toFixed(1)}%
          </div>
          <div className="text-[11px] text-gray-400">Avg Conversion</div>
        </div>
      </div>
    </Section>
  );
}

function CategoryDistributionChart({ products }) {
  const cats = useMemo(() => {
    const m = new Map();
    (products ?? []).forEach((p) => {
      const c = p.category ?? "uncategorized";
      const prev = m.get(c)?.count ?? 0;
      m.set(c, { count: prev + 1 });
    });
    return Array.from(m.entries());
  }, [products]);

  if (!cats.length)
    return (
      <Section title="Category Distribution" icon={<PieChart className="h-5 w-5 text-[#00FF89]" />}>
        <div className="grid place-items-center py-14 text-center text-gray-400">
          <PieChart className="mb-3 h-10 w-10 opacity-60" />
          <p className="text-sm">No category data available.</p>
        </div>
      </Section>
    );

  const total = cats.reduce((s, [, v]) => s + v.count, 0);
  const palette = ["#00FF89", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"];

  let start = 0; // in degrees
  const arcs = cats.map(([name, v], i) => {
    const angle = (v.count / total) * 360;
    const a0 = start;
    const a1 = start + angle;
    start += angle;
    const r = 80;
    const cx = 100,
      cy = 100;
    const sx = cx + r * Math.cos((a0 * Math.PI) / 180);
    const sy = cy + r * Math.sin((a0 * Math.PI) / 180);
    const ex = cx + r * Math.cos((a1 * Math.PI) / 180);
    const ey = cy + r * Math.sin((a1 * Math.PI) / 180);
    const large = angle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
    return { d, color: palette[i % palette.length], name, count: v.count };
  });

  return (
    <Section title="Category Distribution" icon={<PieChart className="h-5 w-5 text-[#00FF89]" />}>
      <div className="flex flex-col items-center gap-6 lg:flex-row">
        <div className="relative mx-auto h-48 w-48">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            {arcs.map((a, i) => (
              <path key={i} d={a.d} fill={a.color} className="transition-opacity hover:opacity-80" />
            ))}
            <circle cx="100" cy="100" r="55" fill="#111827" />
            <text x="100" y="96" textAnchor="middle" className="fill-white text-sm font-bold">
              {total}
            </text>
            <text x="100" y="112" textAnchor="middle" className="fill-gray-400 text-[11px]">
              Products
            </text>
          </svg>
        </div>
        <ul className="grid flex-1 gap-3">
          {cats.map(([name, v], i) => (
            <li key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[i % palette.length] }} />
                <span className="capitalize text-gray-300">{String(name).replace("_", " ")}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">{v.count}</div>
                <div className="text-[11px] text-gray-400">{((v.count / total) * 100).toFixed(1)}%</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function ProductStatusOverview({ products }) {
  const statusColors = {
    published: "#10B981",
    draft: "#F59E0B",
    pending: "#3B82F6",
    rejected: "#EF4444",
  };
  const map = new Map();
  (products ?? []).forEach((p) => {
    const k = String(p.status ?? "unknown");
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  const entries = Array.from(map.entries());
  const total = (products ?? []).length || 1;

  return (
    <Section title="Product Status Overview" icon={<Activity className="h-5 w-5 text-[#00FF89]" />}>
      <div className="space-y-4">
        {entries.map(([status, count]) => (
          <div key={status} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="capitalize text-gray-300">{status}</span>
              <span className="font-semibold text-white">{count}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-800">
              <div
                className="h-2 rounded-full"
                style={{ width: `${(count / total) * 100}%`, backgroundColor: statusColors[status] ?? "#6B7280" }}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PriceAnalysisChart({ products }) {
  const ranges = [
    { label: "Free", min: 0, max: 0 },
    { label: "$1-25", min: 0.01, max: 25 },
    { label: "$26-50", min: 26, max: 50 },
    { label: "$51-100", min: 51, max: 100 },
    { label: "$100+", min: 101, max: Infinity },
  ];
  const data = ranges.map((r) => ({
    ...r,
    count: (products ?? []).filter((p) => {
      const price = Number(p.price ?? 0);
      if (r.label === "Free") return price === 0;
      if (r.label === "$100+") return price > 100;
      return price >= r.min && price <= r.max;
    }).length,
  }));
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Section title="Price Range Distribution" icon={<DollarSign className="h-5 w-5 text-[#00FF89]" />}>
      <div className="relative h-64">
        <div className="absolute inset-0">
          {[0, 25, 50, 75, 100].map((p) => (
            <div key={p} className="absolute inset-x-0 border-t border-gray-700/50" style={{ top: `${p}%` }} />
          ))}
        </div>
        <svg viewBox="0 0 400 256" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FF89" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00FF89" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Area */}
          <motion.path
            d={`M 0 256 ${data
              .map((d, i) => {
                const x = (i / (data.length - 1)) * 400;
                const y = 256 - (d.count / max) * 256;
                return `L ${x} ${y}`;
              })
              .join(" ")} L 400 256 Z`}
            fill="url(#g1)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          {/* Line */}
          <motion.path
            d={`${data
              .map((d, i) => {
                const x = (i / (data.length - 1)) * 400;
                const y = 256 - (d.count / max) * 256;
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}`}
            stroke="#00FF89"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 400;
            const y = 256 - (d.count / max) * 256;
            return (
              <g key={i}>
                <motion.circle cx={x} cy={y} r={6} fill="#00FF89" stroke="#1F2937" strokeWidth={2} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} />
                <motion.text x={x} y={y - 12} textAnchor="middle" className="fill-white text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 + 0.4 }}>
                  {d.count}
                </motion.text>
              </g>
            );
          })}
        </svg>
        {/* X axis */}
        <div className="absolute -bottom-7 left-0 right-0 flex justify-between text-[11px] text-gray-400">
          {data.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-700 pt-4 text-center">
        <div>
          <div className="text-lg font-bold text-[#00FF89]">{data.reduce((s, d) => s + d.count, 0)}</div>
          <div className="text-[11px] text-gray-400">Total Products</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400">{data.reduce((m, d) => (d.count > m.count ? d : m)).label}</div>
          <div className="text-[11px] text-gray-400">Most Popular</div>
        </div>
        <div>
          <div className="text-lg font-bold text-purple-400">
            {(products?.length ? (products.reduce((s, p) => s + Number(p.price ?? 0), 0) / products.length) : 0).toFixed(0)}
          </div>
          <div className="text-[11px] text-gray-400">Avg Price</div>
        </div>
      </div>
    </Section>
  );
}

function DetailedProductCard({ product, index }) {
  const badge = (product.status ?? "unknown").toUpperCase();
  const badgeClass =
    product.status === "published"
      ? "bg-green-900 text-green-300"
      : product.status === "draft"
      ? "bg-yellow-900 text-yellow-300"
      : product.status === "pending"
      ? "bg-blue-900 text-blue-300"
      : "bg-red-900 text-red-300";

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5 hover:border-gray-600">
      <div className="mb-5 flex items-start gap-4">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-gray-800">
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.thumbnail} alt={product.title} className="h-20 w-20 object-cover" />
          ) : (
            <Package className="h-10 w-10 text-[#00FF89]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h4 className="truncate text-lg font-semibold text-white" title={product.title}>
              {product.title}
            </h4>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>{badge}</span>
          </div>
          <p className="line-clamp-2 text-sm text-gray-400">{product.shortDescription}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-300">
            {product.category && (
              <span className="inline-flex items-center gap-1"><Tag className="h-3.5 w-3.5 text-gray-400" />{String(product.category).replace("_", " ")}</span>
            )}
            {product.industry && (
              <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-gray-400" />{product.industry}</span>
            )}
            {product.setupTime && (
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-gray-400" />{product.setupTime}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div className="text-2xl font-bold text-[#00FF89]">${Number(product.price ?? 0)}</div>
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <div className="text-gray-400 line-through">${product.originalPrice}</div>
            <div className="rounded bg-red-900 px-2 py-1 text-xs text-red-300">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          </>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={<Eye className="h-4 w-4" />} color="text-blue-400" label="Views" value={Number(product.views ?? 0).toLocaleString()} />
        <Stat icon={<ShoppingCart className="h-4 w-4" />} color="text-green-400" label="Sales" value={Number(product.sales ?? 0).toLocaleString()} />
        <Stat icon={<DollarSign className="h-4 w-4" />} color="text-purple-400" label="Revenue" value={`$${Number(product.revenue ?? (Number(product.price ?? 0) * Number(product.sales ?? 0))).toLocaleString()}`} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} color="text-orange-400" label="Conversion" value={`${(Number(product.conversionRate ?? 0)).toFixed(2)}%`} />
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <MiniStat icon={<Star className="h-4 w-4" />} color="text-yellow-400" label={`Rating (${Number(product.totalReviews ?? 0)})`} value={(Number(product.averageRating ?? 0)).toFixed(1)} />
        <MiniStat icon={<TrendingUp className="h-4 w-4" />} color="text-blue-400" label="Upvotes" value={Number(product.upvotes ?? 0)} />
        <MiniStat icon={<Package className="h-4 w-4" />} color="text-red-400" label="Favorites" value={Number(product.favorites ?? 0)} />
      </div>

      <div className="mb-5 space-y-2">
        <Flag label="Verified Product" on={Boolean(product.isVerified)} />
        <Flag label="Tested" on={Boolean(product.isTested)} />
        <Flag label="Refund Policy" on={Boolean(product.hasRefundPolicy)} onText="Available" offText="Not Available" />
      </div>

      {Array.isArray(product.tags) && product.tags.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-sm text-gray-400">Tags</div>
          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 6).map((t, i) => (
              <span key={i} className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-200">{t}</span>
            ))}
            {product.tags.length > 6 && (
              <span className="text-xs text-gray-400">+{product.tags.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-700 pt-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Created: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}
        </div>
        <div>Version {product.currentVersion ?? "1.0.0"}</div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, color, label, value }) {
  return (
    <div className="rounded-lg bg-gray-800/60 p-3 text-center">
      <div className={`mx-auto mb-1 flex items-center justify-center gap-1 ${color}`}>{icon}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-[11px] text-gray-400">{label}</div>
    </div>
  );
}

function MiniStat({ icon, color, label, value }) {
  return (
    <div className="rounded-lg bg-gray-800/40 p-3 text-center">
      <div className={`mx-auto mb-1 flex items-center justify-center gap-1 ${color}`}>{icon}</div>
      <div className="font-semibold text-white">{value}</div>
      <div className="text-[11px] text-gray-400">{label}</div>
    </div>
  );
}

function Flag({ label, on, onText = "On", offText = "Off" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-300">{label}</span>
      <span className={`rounded px-2 py-0.5 text-xs ${on ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"}`}>
        {on ? onText : offText}
      </span>
    </div>
  );
}

function ProductsTable({ items }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-700">
      <div className="max-h-[560px] overflow-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/80">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-300">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900/40">
            {items.map((p, i) => (
              <tr key={p._id ?? i} className="text-sm text-gray-200">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-gray-800">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnail} alt="" className="h-10 w-10 object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-[#00FF89]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-white" title={p.title}>{p.title}</div>
                      <div className="text-[11px] text-gray-400">{String(p.category ?? "-").replace("_", " ")}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    p.status === "published"
                      ? "bg-green-900 text-green-300"
                      : p.status === "draft"
                      ? "bg-yellow-900 text-yellow-300"
                      : p.status === "pending"
                      ? "bg-blue-900 text-blue-300"
                      : "bg-red-900 text-red-300"
                  }`}>{(p.status ?? "unknown").toUpperCase()}</span>
                </td>
                <td className="px-4 py-3">{Number(p.views ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3">{Number(p.sales ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3">${Number(p.revenue ?? (Number(p.price ?? 0) * Number(p.sales ?? 0))).toLocaleString()}</td>
                <td className="px-4 py-3">{Number(p.averageRating ?? 0).toFixed(1)}</td>
                <td className="px-4 py-3">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProductsTab({ analyticsData, timeRange, loading }) {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("views");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState("cards"); // "cards" | "table"

  if (loading && !analyticsData) return <AnalyticsLoadingScreen variant="products" />;

  const { products = [], summary = {} } = analyticsData || {};
  if (!products.length)
    return (
      <div className="grid place-items-center py-16 text-center">
        <Package className="mb-3 h-14 w-14 text-gray-600" />
        <h3 className="mb-2 text-xl font-semibold text-gray-300">No Products Found</h3>
        <p className="max-w-md text-sm text-gray-500">Create your first product to see analytics.</p>
      </div>
    );

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const statuses = Array.from(new Set(products.map((p) => p.status).filter(Boolean)));

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return products
      .filter((p) => {
        const okText = text ? String(p.title ?? "").toLowerCase().includes(text) : true;
        const okCat = cat ? p.category === cat : true;
        const okStatus = status ? p.status === status : true;
        return okText && okCat && okStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "views":
            return (b.views ?? 0) - (a.views ?? 0);
          case "sales":
            return (b.sales ?? 0) - (a.sales ?? 0);
          case "revenue":
            return (b.revenue ?? 0) - (a.revenue ?? 0);
          case "rating":
            return (b.averageRating ?? 0) - (a.averageRating ?? 0);
          case "created":
            return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
          default:
            return 0;
        }
      });
  }, [products, q, cat, status, sortBy]);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <KPI icon={<Package className="h-5 w-5 text-[#00FF89]" />} label="Total Products" value={summary.totalProducts ?? products.length} sub="Products created" />
        <KPI icon={<Eye className="h-5 w-5 text-blue-400" />} label="Total Views" value={(summary.totalViews ?? products.reduce((s, p) => s + Number(p.views ?? 0), 0)).toLocaleString()} sub="Across all products" />
        <KPI icon={<Star className="h-5 w-5 text-yellow-400" />} label="Avg Rating" value={(summary.avgRating ?? (products.length ? products.reduce((s, p) => s + Number(p.averageRating ?? 0), 0) / products.length : 0)).toFixed(1)} sub="Overall rating" />
        <KPI icon={<TrendingUp className="h-5 w-5 text-green-400" />} label="Total Upvotes" value={summary.totalUpvotes ?? products.reduce((s, p) => s + Number(p.upvotes ?? 0), 0)} sub="Community engagement" />
      </div>

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 -mx-1 rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search products"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 outline-none ring-0 focus:border-transparent focus:ring-2 focus:ring-[#00FF89]"
              />
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Filter className="h-4 w-4 text-gray-400" />
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {String(c).replace("_", " ")}
                  </option>
                ))}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                <option value="">All Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                <option value="views">Sort by Views</option>
                <option value="sales">Sort by Sales</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="rating">Sort by Rating</option>
                <option value="created">Sort by Date</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setView("cards")}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${
                view === "cards" ? "border-[#00FF89] text-white" : "border-gray-700 text-gray-300"
              }`}
              aria-pressed={view === "cards"}
            >
              <Grid3X3 className="h-4 w-4" /> Cards
            </button>
            <button
              onClick={() => setView("table")}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${
                view === "table" ? "border-[#00FF89] text-white" : "border-gray-700 text-gray-300"
              }`}
              aria-pressed={view === "table"}
            >
              <Rows className="h-4 w-4" /> Table
            </button>
          </div>
        </div>
        {/* Active filter chips */}
        <div className="mt-2 flex flex-wrap gap-2">
          {q && <Chip label={`Search: "${q}"`} onRemove={() => setQ("")} />}
          {cat && <Chip label={`Category: ${String(cat).replace("_", " ")}`} onRemove={() => setCat("")} />}
          {status && <Chip label={`Status: ${status}`} onRemove={() => setStatus("")} />}
          {!q && !cat && !status && <span className="text-xs text-gray-500">No filters applied</span>}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProductPerformanceChart products={products} />
        <CategoryDistributionChart products={products} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProductStatusOverview products={products} />
        <PriceAnalysisChart products={products} />
      </div>

      {/* Content */}
      {view === "cards" ? (
        <Section title="Product Details" icon={<Rows className="h-5 w-5 text-[#00FF89]" />} right={<span className="text-xs text-gray-400">Showing {filtered.length} of {products.length}</span>}>
          <div className="grid grid-cols-1 gap-6">
            {filtered.map((p, i) => (
              <DetailedProductCard key={p._id ?? i} product={p} index={i} />
            ))}
          </div>
        </Section>
      ) : (
        <Section title="Product Details (Table)" icon={<Rows className="h-5 w-5 text-[#00FF89]" />} right={<span className="text-xs text-gray-400">Showing {filtered.length} of {products.length}</span>}>
          <ProductsTable items={filtered} />
        </Section>
      )}
    </div>
  );
}

function KPI({ icon, label, value, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5">
      <div className="mb-3 flex items-center gap-3">
        {icon}
        <h4 className="text-sm font-semibold text-white">{label}</h4>
      </div>
      <div className="mb-1 text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </motion.div>
  );
}
