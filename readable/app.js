const Np = (r) =>
    new Promise((i, a) => {
      const s = new FileReader();
      (s.readAsDataURL(r),
        (s.onload = () => {
          const c = s.result;
          i(c.split(",")[1]);
        }),
        (s.onerror = (c) => a(c)));
    }),
  Cf = 2048,
  $y = 0.92,
  Lp = "invoiceExtractionCacheV5",
  y1 = 6,
  tb = [0, 2e3, 5500, 11e3, 18e3, 26e3];
async function Ep(r) {
  const i = await new Promise((a) => r.toBlob((s) => a(s), "image/jpeg", $y));
  return i ? Np(i) : null;
}
async function eb(r) {
  return new Promise((i) => {
    const a = URL.createObjectURL(r),
      s = new Image();
    let c = !1;
    const u = (y) => {
      c || ((c = !0), URL.revokeObjectURL(a), i(y));
    };
    ((s.onload = () => u(s)),
      (s.onerror = () => u(null)),
      (s.src = a),
      setTimeout(() => u(null), 25e3));
  });
}
async function nb(r) {
  const i = r.width,
    a = r.height,
    s = Math.max(i, a),
    c = s > Cf ? Cf / s : 1,
    u = Math.max(1, Math.round(i * c)),
    y = Math.max(1, Math.round(a * c)),
    p = document.createElement("canvas");
  ((p.width = u), (p.height = y));
  const m = p.getContext("2d");
  return m ? (m.drawImage(r, 0, 0, u, y), Ep(p)) : null;
}
async function ab(r) {
  const i = r.naturalWidth,
    a = r.naturalHeight;
  if (i <= 0 || a <= 0) return null;
  const s = Math.max(i, a),
    c = s > Cf ? Cf / s : 1,
    u = Math.max(1, Math.round(i * c)),
    y = Math.max(1, Math.round(a * c)),
    p = document.createElement("canvas");
  ((p.width = u), (p.height = y));
  const m = p.getContext("2d");
  return m ? (m.drawImage(r, 0, 0, u, y), Ep(p)) : null;
}
async function ib(r) {
  try {
    const a = await createImageBitmap(r);
    try {
      const s = await nb(a);
      if (s) return { mimeType: "image/jpeg", base64: s };
    } finally {
      a.close();
    }
  } catch {}
  const i = await eb(r);
  if (i) {
    const a = await ab(i);
    if (a) return { mimeType: "image/jpeg", base64: a };
  }
  return {
    mimeType:
      r.type && r.type.startsWith("image/")
        ? r.type === "image/heic" || r.type === "image/heif"
          ? "image/jpeg"
          : r.type
        : "image/jpeg",
    base64: await Np(r),
  };
}
async function rb(r) {
  const i = atob(r),
    a = new Uint8Array(i.length);
  for (let c = 0; c < i.length; c += 1) a[c] = i.charCodeAt(c);
  const s = await crypto.subtle.digest("SHA-256", a);
  return Array.from(new Uint8Array(s))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("");
}
function Cp() {
  try {
    const r = localStorage.getItem(Lp);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}
function lb(r) {
  try {
    localStorage.setItem(Lp, JSON.stringify(r));
  } catch {}
}
function sb(r, i) {
  const a = Cp();
  a[r] = { savedAt: Date.now(), result: i };
  const s = Object.entries(a)
    .sort((c, u) => u[1].savedAt - c[1].savedAt)
    .slice(0, 20);
  lb(Object.fromEntries(s));
}
const yu = {
  month: "",
  images: {},
  spc: {
    posts: 0,
    adLines: [
      {
        id: "default-spc",
        name: "鎖鮮袋",
        convSpend: 0,
        adOpPercent: 15,
        nonConvSpend: 0,
      },
    ],
    kols: [],
  },
  stc: { posts: 0, adLines: [], kols: [] },
};
function ob(r) {
  if (!r || typeof r != "object") return yu;
  const i = r,
    a = (E, B) =>
      Array.isArray(E)
        ? {
            present: !0,
            lines: E.map((S, Z) => {
              const Y = Number(S.adOpPercent);
              return {
                id: typeof S.id == "string" ? S.id : `${B}-${Z}-${Date.now()}`,
                name: String(S.name ?? S.productName ?? ""),
                convSpend: Number(S.convSpend) || 0,
                adOpPercent: Y > 0 ? Y : 15,
                nonConvSpend: Number(S.nonConvSpend) || 0,
              };
            }),
          }
        : { lines: [], present: !1 },
    s = i.spc;
  let c,
    u = 0,
    y = [];
  if (s && typeof s == "object") {
    ((u = Number(s.posts) || 0), (y = Array.isArray(s.kols) ? s.kols : []));
    const { lines: E, present: B } = a(s.adLines, "spc");
    B
      ? (c = E)
      : (c = [
          {
            id: "migrated-spc",
            name: "鎖鮮袋",
            convSpend: Number(s.convSpend) || 0,
            adOpPercent: 15,
            nonConvSpend: Number(s.nonConvSpend) || 0,
          },
        ]);
  } else c = [...yu.spc.adLines];
  const p = i.stc;
  let m,
    v = 0,
    w = [];
  if (p && typeof p == "object") {
    ((v = Number(p.posts) || 0), (w = Array.isArray(p.kols) ? p.kols : []));
    const { lines: E, present: B } = a(p.adLines, "stc");
    if (B) m = E;
    else {
      m = [];
      const S = Number(p.netConvSpend) || 0,
        Z = Number(p.netNonConvSpend) || 0,
        Y = Number(p.scaleConvSpend) || 0,
        W = Number(p.scaleNonConvSpend) || 0;
      ((S || Z) &&
        m.push({
          id: "migrated-net",
          name: "防霾紗網",
          convSpend: S,
          adOpPercent: 15,
          nonConvSpend: Z,
        }),
        (Y || W) &&
          m.push({
            id: "migrated-scale",
            name: "除垢",
            convSpend: Y,
            adOpPercent: 15,
            nonConvSpend: W,
          }));
    }
  } else m = [];
  return {
    month: typeof i.month == "string" ? i.month : "",
    images: {},
    spc: { posts: u, adLines: c, kols: y },
    stc: { posts: v, adLines: m, kols: w },
  };
}
function N5(r) {
  return [...r].sort(
    (i, a) => a.convSpend + a.nonConvSpend - (i.convSpend + i.nonConvSpend),
  );
}
function ub(r) {
  return r.adOpPercent > 0 ? r.adOpPercent : 15;
}
function L5(r) {
  const i = ub(r) / 100;
  return Math.round(r.convSpend * i * 1.05 + r.nonConvSpend * 0.15 * 1.05);
}
const cb = (r) => {
    const i = /(https?:\/\/[^\s]+)/g;
    return r
      .split(i)
      .map((a, s) =>
        a.match(i)
          ? Ct.jsx(
              "a",
              {
                href: a,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline",
                children: a,
              },
              s,
            )
          : a,
      );
  },
  gl = ({ label: r, value: i, onChange: a, type: s = "text", step: c }) =>
    Ct.jsxs("div", {
      className: "mb-4",
      children: [
        Ct.jsx("label", {
          className: "block text-sm font-medium text-gray-700 mb-1",
          children: r,
        }),
        Ct.jsx("input", {
          type: s,
          value: i,
          onChange: a,
          step: c,
          className:
            "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        }),
      ],
    }),
  E5 = ({ kols: r, onChange: i }) => {
    const [a, s] = ei.useState(!1),
      c = () =>
        i([...r, { id: Date.now().toString(), name: "", price: 0, note: "" }]),
      u = (m) => i(r.filter((v) => v.id !== m)),
      y = (m, v, w) => i(r.map((E) => (E.id === m ? { ...E, [v]: w } : E))),
      p = () => {
        (s(!0), setTimeout(() => s(!1), 2e3));
      };
    return Ct.jsxs("div", {
      className: "space-y-4",
      children: [
        r.map((m) =>
          Ct.jsxs(
            "div",
            {
              className:
                "p-4 bg-white border border-gray-200 rounded-md relative shadow-sm",
              children: [
                Ct.jsx("button", {
                  onClick: () => u(m.id),
                  className:
                    "absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors",
                  children: Ct.jsx(Of, { size: 16 }),
                }),
                Ct.jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 pr-6",
                  children: [
                    Ct.jsx(gl, {
                      label: "項目名稱",
                      value: m.name,
                      onChange: (v) => y(m.id, "name", v.target.value),
                    }),
                    Ct.jsx(gl, {
                      label: "金額",
                      type: "number",
                      value: m.price,
                      onChange: (v) => y(m.id, "price", Number(v.target.value)),
                    }),
                  ],
                }),
                Ct.jsxs("div", {
                  children: [
                    Ct.jsx("label", {
                      className: "block text-sm font-medium text-gray-700 mb-1",
                      children: "備註 (可填寫連結與走期)",
                    }),
                    Ct.jsx("textarea", {
                      value: m.note,
                      onChange: (v) => y(m.id, "note", v.target.value),
                      className:
                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                      rows: 3,
                    }),
                  ],
                }),
              ],
            },
            m.id,
          ),
        ),
        Ct.jsxs("div", {
          className: "flex items-center gap-3",
          children: [
            Ct.jsxs("button", {
              onClick: c,
              className:
                "flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors",
              children: [
                Ct.jsx(D5, { size: 16, className: "mr-1" }),
                " 新增項目",
              ],
            }),
            Ct.jsx("button", {
              onClick: p,
              className:
                "flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors",
              children: "更新",
            }),
            a &&
              Ct.jsx("span", {
                className: "text-sm text-green-600 font-medium",
                children: "資料已更新！",
              }),
          ],
        }),
      ],
    });
  },
  C5 = ({ lines: r, onChange: i, addLabel: a = "新增商品列" }) => {
    const s = () =>
        i([
          ...r,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: "",
            convSpend: 0,
            adOpPercent: 15,
            nonConvSpend: 0,
          },
        ]),
      c = (y) => i(r.filter((p) => p.id !== y)),
      u = (y, p, m) => i(r.map((v) => (v.id === y ? { ...v, [p]: m } : v)));
    return Ct.jsxs("div", {
      className: "space-y-4",
      children: [
        r.map((y) =>
          Ct.jsxs(
            "div",
            {
              className:
                "p-4 bg-white border border-gray-200 rounded-md relative shadow-sm",
              children: [
                Ct.jsx("button", {
                  type: "button",
                  onClick: () => c(y.id),
                  className:
                    "absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors",
                  children: Ct.jsx(Of, { size: 16 }),
                }),
                Ct.jsx("div", {
                  className: "pr-8 mb-2",
                  children: Ct.jsx(gl, {
                    label: "商品名稱",
                    value: y.name,
                    onChange: (p) => u(y.id, "name", p.target.value),
                  }),
                }),
                Ct.jsxs("div", {
                  className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
                  children: [
                    Ct.jsx(gl, {
                      label: "轉換花費",
                      type: "number",
                      value: y.convSpend,
                      onChange: (p) =>
                        u(y.id, "convSpend", Number(p.target.value)),
                    }),
                    Ct.jsx(gl, {
                      label: "廣告操作 %（僅轉換，截圖最右欄）",
                      type: "number",
                      step: "0.01",
                      value: y.adOpPercent,
                      onChange: (p) =>
                        u(y.id, "adOpPercent", Number(p.target.value)),
                    }),
                    Ct.jsx(gl, {
                      label: "非轉換花費",
                      type: "number",
                      value: y.nonConvSpend,
                      onChange: (p) =>
                        u(y.id, "nonConvSpend", Number(p.target.value)),
                    }),
                  ],
                }),
              ],
            },
            y.id,
          ),
        ),
        Ct.jsxs("button", {
          type: "button",
          onClick: s,
          className:
            "flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors",
          children: [Ct.jsx(D5, { size: 16, className: "mr-1" }), " ", a],
        }),
      ],
    });
  },
  O1 = ["【本月整體成效】", "【Meta花費】", "【Google花費】"],
  T5 = ({ images: r, onChange: i, onFileSelect: a, onFileRemove: s }) => {
    const c = async (y, p) => {
        if (p.target.files && p.target.files[0]) {
          const m = p.target.files[0],
            v = URL.createObjectURL(m);
          (i({ ...r, [y]: v }), a && a(y, m));
        }
      },
      u = (y) => {
        const p = { ...r };
        (delete p[y], i(p), s && s(y));
      };
    return Ct.jsx("div", {
      className: "space-y-4 mt-2",
      children: O1.map((y) =>
        Ct.jsxs(
          "div",
          {
            className: "border border-gray-200 p-4 rounded-md bg-white",
            children: [
              Ct.jsx("label", {
                className: "block text-sm font-medium text-gray-700 mb-2",
                children: y,
              }),
              r[y]
                ? Ct.jsxs("div", {
                    className: "relative group",
                    children: [
                      Ct.jsx("img", {
                        src: r[y],
                        alt: y,
                        className:
                          "w-full h-auto rounded-md border border-gray-200",
                      }),
                      Ct.jsx("button", {
                        onClick: () => u(y),
                        className:
                          "absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                        children: Ct.jsx(Of, { size: 16 }),
                      }),
                    ],
                  })
                : Ct.jsx("input", {
                    type: "file",
                    accept: "image/*",
                    onChange: (p) => c(y, p),
                    className:
                      "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer",
                  }),
            ],
          },
          y,
        ),
      ),
    });
  },
  O5 = ({
    title: r,
    company: i,
    items: a,
    total: s,
    id: c,
    hiddenOnPrint: u,
    images: y = {},
  }) =>
    Ct.jsxs("div", {
      id: c,
      className: `bg-white rounded-xl shadow-sm border border-gray-200 ${u ? "hide-on-print" : ""}`,
      children: [
        Ct.jsxs("div", {
          id: `${c}-main`,
          className: "px-10 py-8 bg-white",
          children: [
            Ct.jsxs("div", {
              className: "text-center mb-5",
              children: [
                Ct.jsx("h1", {
                  className:
                    "text-[26px] font-bold tracking-wide leading-tight mb-1",
                  children: r,
                }),
                Ct.jsx("h2", {
                  className:
                    "text-base text-gray-700 tracking-wide leading-tight",
                  children: i,
                }),
              ],
            }),
            Ct.jsx("hr", { className: "border-t border-gray-400 mb-5" }),
            Ct.jsxs("table", {
              className:
                "w-full text-left border-collapse border border-gray-300 text-[14px]",
              children: [
                Ct.jsx("thead", {
                  children: Ct.jsxs("tr", {
                    className: "bg-[#e5e7eb]",
                    children: [
                      Ct.jsx("th", {
                        className:
                          "p-2.5 border border-gray-300 w-[40%] font-semibold",
                        children: "項目",
                      }),
                      Ct.jsx("th", {
                        className:
                          "p-2.5 border border-gray-300 w-[10%] text-center font-semibold",
                        children: "數量",
                      }),
                      Ct.jsxs("th", {
                        className:
                          "p-2.5 border border-gray-300 w-[20%] text-right font-semibold",
                        children: ["含稅價", Ct.jsx("br", {}), "(NT$/元)"],
                      }),
                      Ct.jsx("th", {
                        className:
                          "p-2.5 border border-gray-300 w-[30%] font-semibold",
                        children: "備註",
                      }),
                    ],
                  }),
                }),
                Ct.jsxs("tbody", {
                  children: [
                    a.map((p, m) =>
                      Ct.jsxs(
                        "tr",
                        {
                          className: "border-b border-gray-300",
                          children: [
                            Ct.jsx("td", {
                              className:
                                "p-2.5 border-x border-gray-300 font-medium whitespace-pre-wrap leading-snug",
                              children: p.name,
                            }),
                            Ct.jsx("td", {
                              className:
                                "p-2.5 border-x border-gray-300 text-center",
                              children: p.qty,
                            }),
                            Ct.jsx("td", {
                              className:
                                "p-2.5 border-x border-gray-300 text-right font-medium",
                              children: p.price.toLocaleString("en-US"),
                            }),
                            Ct.jsx("td", {
                              className:
                                "p-2.5 border-x border-gray-300 whitespace-pre-wrap text-sm leading-snug break-all",
                              children: cb(p.note),
                            }),
                          ],
                        },
                        m,
                      ),
                    ),
                    Ct.jsxs("tr", {
                      className: "border-b border-gray-300 bg-gray-50",
                      children: [
                        Ct.jsx("td", {
                          className: "p-2.5 border-x border-gray-300 font-bold",
                          children: "小計",
                        }),
                        Ct.jsx("td", {
                          className: "p-2.5 border-x border-gray-300",
                        }),
                        Ct.jsx("td", {
                          className:
                            "p-2.5 border-x border-gray-300 text-right font-bold",
                          children: s.toLocaleString("en-US"),
                        }),
                        Ct.jsx("td", {
                          className: "p-2.5 border-x border-gray-300",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            Ct.jsxs("div", {
              className: "mt-10 border border-gray-300 break-inside-avoid",
              children: [
                Ct.jsx("div", {
                  className:
                    "bg-[#e5e7eb] p-2 text-center text-sm tracking-wide font-semibold border-b border-gray-300",
                  children: "客戶確認",
                }),
                Ct.jsxs("div", {
                  className: "p-4 grid grid-cols-2 gap-4 h-32",
                  children: [
                    Ct.jsxs("div", {
                      className: "text-sm space-y-1",
                      children: [
                        Ct.jsx("p", { children: "聯絡人：周依潔" }),
                        Ct.jsx("p", { children: "聯絡手機：0915-271832" }),
                        Ct.jsx("p", {
                          children: "聯絡信箱：natalia@x3advisory.com",
                        }),
                        Ct.jsxs("p", {
                          children: [
                            "彙整日期：",
                            new Date().toLocaleDateString("zh-TW"),
                          ],
                        }),
                      ],
                    }),
                    Ct.jsx("div", {
                      className: "border-l border-gray-300 pl-4",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        O1.some((p) => y[p]) &&
          Ct.jsx("div", {
            id: `${c}-attachments`,
            className: "px-10 py-8 bg-white space-y-6 break-before-auto",
            children: O1.map((p) =>
              y[p]
                ? Ct.jsxs(
                    "div",
                    {
                      className: "break-inside-avoid",
                      children: [
                        Ct.jsx("h3", {
                          className:
                            "text-base font-semibold tracking-wide mb-2 text-gray-800",
                          children: p,
                        }),
                        Ct.jsx("img", {
                          src: y[p],
                          alt: p,
                          className:
                            "w-full h-auto border border-gray-200 rounded-md",
                        }),
                      ],
                    },
                    p,
                  )
                : null,
            ),
          }),
      ],
    });
function fb() {
  const [r, i] = ei.useState(() => {
      const X = localStorage.getItem("invoiceData");
      if (X)
        try {
          return ob(JSON.parse(X));
        } catch {
          return yu;
        }
      return yu;
    }),
    [a, s] = ei.useState("SPC"),
    [c, u] = ei.useState(null),
    [y, p] = ei.useState(!1),
    [m, v] = ei.useState(null),
    [w, E] = ei.useState({}),
    [B, S] = ei.useState(!1),
    [Z, Y] = ei.useState(null);
  n0.useEffect(() => {
    const X = { ...r, images: {} };
    localStorage.setItem("invoiceData", JSON.stringify(X));
  }, [r]);
  const W = n0.useCallback((X) => {
      let R = !1;
      const I = (M) => {
          if (!M || M === "-1" || M === "") return -1;
          const O = Number(String(M).replace(/,/g, ""));
          return isNaN(O) ? -1 : O;
        },
        rt = (M) => {
          if (!M || M === "-1" || M === "") return -1;
          const O = Number(
            String(M).replace(/,/g, "").replace(/%/g, "").trim(),
          );
          return isNaN(O) ? -1 : O;
        },
        T = (M, O, P) => {
          const et = I(M.convSpend),
            q = I(M.nonConvSpend),
            tt = rt(M.adOpPercent);
          return {
            id: `${P}-${Date.now()}-${O}`,
            name: (M.productName || "").trim(),
            convSpend: et === -1 ? 0 : et,
            adOpPercent: tt === -1 ? 15 : tt,
            nonConvSpend: q === -1 ? 0 : q,
          };
        };
      (i((M) => {
        const O = { ...M };
        if (
          ((O.spc = { ...O.spc, kols: [], posts: 0 }),
          (O.stc = { ...O.stc, kols: [], posts: 0 }),
          X.month && X.month !== "" && ((O.month = X.month), (R = !0)),
          Array.isArray(X.spcLines))
        ) {
          let P = X.spcLines
            .map((et, q) => T(et, q, "ex-spc"))
            .filter(
              (et) =>
                et.name.length > 0 || et.convSpend > 0 || et.nonConvSpend > 0,
            );
          (P.length === 0 && (P = [...yu.spc.adLines]),
            (O.spc.adLines = P),
            (R = !0));
        }
        return (
          Array.isArray(X.stcLines) &&
            ((O.stc.adLines = X.stcLines
              .map((P, et) => T(P, et, "ex-stc"))
              .filter(
                (P) =>
                  P.name.length > 0 || P.convSpend > 0 || P.nonConvSpend > 0,
              )),
            (R = !0)),
          O
        );
      }),
        Y(
          R
            ? "數據已成功更新！請款月份、各商品廣告數據已帶入（依品名分開），社群貼文與項目已清空。"
            : "未能從圖片中辨識出相關數據，請確認截圖含花費與最右欄「廣告操作%」。",
        ));
    }, []),
    H = async (X) => {
      (p(!0), v(null));
      try {
        const R = "【本月整體成效】",
          I = X[R];
        if (!I) {
          Y(`請先上傳「${R}」圖片再點擊更新`);
          return;
        }
        const { mimeType: rt, base64: T } = await ib(I),
          M = await rb(T),
          O = Cp()[M];
        if (
          O != null &&
          O.result &&
          (Array.isArray(O.result.spcLines) || Array.isArray(O.result.stcLines))
        ) {
          W(O.result);
          return;
        }
        const P = y1 - 1;
        for (let et = 0; et < y1; et += 1) {
          if (et > 0) {
            const yt = tb[et] ?? 8e3;
            (v(
              `辨識服務忙碌或逾時，系統自動重試中（第 ${et + 1} / ${y1} 次），請稍候…`,
            ),
              await new Promise((St) => setTimeout(St, yt)));
          }
          let q,
            tt = {};
          try {
            ((q = await fetch("/api/extract", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mimeType: rt, data: T }),
            })),
              (tt = await q.json().catch(() => ({}))));
          } catch {
            if (et === P) {
              Y("無法連線至辨識服務，請檢查網路後再按「更新」，或稍候重試。");
              return;
            }
            continue;
          }
          if (q.ok && tt && typeof tt == "object" && !tt.error) {
            const yt = Array.isArray(tt.spcLines) ? tt.spcLines : [],
              St = Array.isArray(tt.stcLines) ? tt.stcLines : [],
              F = { month: tt.month ?? "", spcLines: yt, stcLines: St };
            (sb(M, F), v(null), W(F));
            return;
          }
          if (tt.retryable === !1 || et === P) {
            const yt =
              tt.error || (q.ok ? "無法完成辨識" : `服務回應 ${q.status}`);
            (v(null),
              Y(
                `擷取失敗：${yt}。已自動將圖片轉成 JPEG 以利辨識；請再按一次「更新」，或改用較清晰、含完整表格的截圖。`,
              ));
            return;
          }
        }
      } catch (R) {
        console.error("Failed to extract data from image:", R);
        const I =
          R instanceof Error && R.message
            ? `擷取數據時發生錯誤：${R.message}`
            : "擷取數據時發生錯誤，請稍後再試。";
        Y(I);
      } finally {
        (v(null), p(!1));
      }
    },
    ft = async (X) => {
      (u(X),
        Y("正在產生 PDF，請稍候..."),
        setTimeout(async () => {
          try {
            const R = document.getElementById(
                `invoice-${X.toLowerCase()}-main`,
              ),
              I = document.getElementById(
                `invoice-${X.toLowerCase()}-attachments`,
              );
            if (!R) {
              (Y("找不到請款單元素"), u(null));
              return;
            }
            (R.classList.add("pdf-export"), I && I.classList.add("pdf-export"));
            const rt = 2,
              T = 5,
              M = 8,
              O = 5,
              P = new oe({ orientation: "portrait", unit: "mm", format: "a4" }),
              et = P.internal.pageSize.getWidth(),
              q = P.internal.pageSize.getHeight(),
              tt = et - M * 2,
              it = q - T - O,
              yt = async (N) => {
                const z = N.clientWidth * rt,
                  $ = N.clientHeight * rt,
                  nt = await lg.toJpeg(N, {
                    quality: 0.98,
                    bgcolor: "#ffffff",
                    width: z,
                    height: $,
                    style: {
                      transform: `scale(${rt})`,
                      transformOrigin: "top left",
                      width: `${N.clientWidth}px`,
                      height: `${N.clientHeight}px`,
                    },
                  }),
                  ot = await new Promise((Lt, zt) => {
                    const Ht = new Image();
                    ((Ht.onload = () => Lt(Ht)),
                      (Ht.onerror = () =>
                        zt(new Error("無法載入 PDF 截圖影像"))),
                      (Ht.src = nt));
                  }),
                  pt = document.createElement("canvas");
                ((pt.width = z), (pt.height = $));
                const gt = pt.getContext("2d");
                if (!gt) throw new Error("無法建立 PDF 繪圖畫布");
                return (
                  (gt.fillStyle = "#ffffff"),
                  gt.fillRect(0, 0, pt.width, pt.height),
                  gt.drawImage(ot, 0, 0, z, $),
                  pt
                );
              },
              St = (N, z, $, nt) => {
                nt && P.addPage();
                const ot = Math.max(1, Math.floor($)),
                  pt = document.createElement("canvas");
                ((pt.width = N.width), (pt.height = ot));
                const gt = pt.getContext("2d");
                if (!gt) return;
                ((gt.fillStyle = "#ffffff"),
                  gt.fillRect(0, 0, pt.width, pt.height),
                  gt.drawImage(
                    N,
                    0,
                    Math.floor(z),
                    N.width,
                    ot,
                    0,
                    0,
                    N.width,
                    ot,
                  ));
                const Lt = (ot / N.width) * tt;
                P.addImage(
                  pt.toDataURL("image/jpeg", 0.98),
                  "JPEG",
                  M,
                  T,
                  tt,
                  Lt,
                );
              },
              F = async () => {
                const N = await yt(R),
                  z = R.querySelector("table"),
                  $ = new Set([0, N.height]);
                if (z) {
                  const Lt = Array.from(z.querySelectorAll("tr")),
                    zt = z.offsetTop * rt;
                  ($.add(Math.round(zt)),
                    Lt.forEach((Ht) => {
                      const Ft = Ht,
                        Xt = (Ft.offsetTop + Ft.offsetHeight) * rt;
                      $.add(Math.round(Xt));
                    }));
                }
                const nt = Array.from($)
                    .filter((Lt) => Lt >= 0 && Lt <= N.height)
                    .sort((Lt, zt) => Lt - zt),
                  ot = (it / tt) * N.width;
                let pt = 0,
                  gt = !0;
                for (; pt < N.height - 1;) {
                  const Lt = pt + ot;
                  let zt = nt.reduce(
                    (Ht, Ft) => (Ft > pt && Ft <= Lt ? Ft : Ht),
                    0,
                  );
                  (zt <= pt + 1 && (zt = Math.min(N.height, Math.round(Lt))),
                    St(N, pt, zt - pt, !gt),
                    (gt = !1),
                    (pt = zt));
                }
              },
              _ = async () => {
                if (!I) return;
                const N = Array.from(I.children).filter(
                  (nt) => nt instanceof HTMLElement,
                );
                if (N.length === 0) return;
                let z = 0,
                  $ = !1;
                for (const nt of N) {
                  const ot = await yt(nt),
                    pt = (ot.height / ot.width) * tt,
                    gt = ot.toDataURL("image/jpeg", 0.98);
                  ($ || (P.addPage(), ($ = !0), (z = it)),
                    pt > z && z < it && (P.addPage(), (z = it)));
                  const Lt = T + (it - z);
                  (P.addImage(gt, "JPEG", M, Lt, tt, pt),
                    (z -= pt),
                    z < 6 && (P.addPage(), (z = it)));
                }
              };
            (await F(),
              await _(),
              P.save(`${r.month}_${X}請款單.pdf`),
              Y(null));
          } catch (R) {
            (console.error("Print error:", R),
              Y("列印發生錯誤：" + (R.message || "未知錯誤")));
          } finally {
            const R = document.getElementById(
                `invoice-${X.toLowerCase()}-main`,
              ),
              I = document.getElementById(
                `invoice-${X.toLowerCase()}-attachments`,
              );
            (R && R.classList.remove("pdf-export"),
              I && I.classList.remove("pdf-export"),
              u(null));
          }
        }, 500));
    },
    ut = () => {
      const X = [];
      let R = 0;
      const I = r.spc.posts * 7560;
      (X.push({
        name: `${r.month} SPC社群貼文`,
        qty: r.spc.posts,
        price: I,
        note: `共 ${r.spc.posts}篇`,
      }),
        (R += I),
        X.push({
          name: `${r.month} SPC電商營運`,
          qty: 1,
          price: 25e3,
          note: "附件：月報",
        }),
        (R += 25e3));
      const rt = N5(r.spc.adLines);
      for (const T of rt) {
        const M = T.name.trim() || "未命名商品",
          O = T.convSpend + T.nonConvSpend;
        if (O <= 0) continue;
        const P = Math.round(O * 1.1);
        (X.push({
          name: `${r.month} SPC「${M}」廣告費用實報實銷`,
          qty: 1,
          price: P,
          note: "附件：下方截圖",
        }),
          (R += P));
        const et = L5(T);
        et > 0 &&
          (X.push({
            name: `${r.month}「${M}」廣告操作費`,
            qty: 1,
            price: et,
            note: "附件：下方截圖",
          }),
          (R += et));
      }
      return (
        r.spc.kols.forEach((T) => {
          (X.push({ name: T.name, qty: 1, price: T.price, note: T.note }),
            (R += T.price));
        }),
        { items: X, total: R }
      );
    },
    at = () => {
      const X = [];
      let R = 0;
      const I = r.stc.posts * 7560;
      (X.push({
        name: `${r.month} STC社群貼文`,
        qty: r.stc.posts,
        price: I,
        note: `共 ${r.stc.posts}篇`,
      }),
        (R += I),
        X.push({
          name: `${r.month} STC電商營運`,
          qty: 1,
          price: 25e3,
          note: "附件：月報",
        }),
        (R += 25e3));
      const rt = N5(r.stc.adLines);
      for (const T of rt) {
        const M = T.name.trim() || "未命名商品",
          O = T.convSpend + T.nonConvSpend;
        if (O <= 0) continue;
        const P = Math.round(O * 1.1);
        (X.push({
          name: `${r.month} STC「${M}」廣告費用實報實銷`,
          qty: 1,
          price: P,
          note: "附件：下方截圖",
        }),
          (R += P));
        const et = L5(T);
        et > 0 &&
          (X.push({
            name: `${r.month}「${M}」廣告操作費`,
            qty: 1,
            price: et,
            note: "附件：下方截圖",
          }),
          (R += et));
      }
      return (
        r.stc.kols.forEach((T) => {
          (X.push({ name: T.name, qty: 1, price: T.price, note: T.note }),
            (R += T.price));
        }),
        { items: X, total: R }
      );
    },
    Nt = ut(),
    Dt = at();
  return Ct.jsxs("div", {
    className: "min-h-screen bg-gray-100 p-4 font-sans relative",
    children: [
      Z &&
        Ct.jsx("div", {
          className:
            "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
          children: Ct.jsxs("div", {
            className:
              "bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center animate-in zoom-in duration-200",
            children: [
              Ct.jsx("p", {
                className: "text-gray-800 mb-6 font-medium",
                children: Z,
              }),
              Ct.jsx("button", {
                onClick: () => Y(null),
                className:
                  "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium",
                children: "確定",
              }),
            ],
          }),
        }),
      Ct.jsxs("div", {
        className: "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6",
        children: [
          Ct.jsxs("div", {
            className: "bg-white p-6 rounded-xl shadow-sm no-print relative",
            children: [
              Ct.jsxs("div", {
                className: "flex items-center justify-between mb-6",
                children: [
                  Ct.jsx("h2", {
                    className: "text-2xl font-bold text-gray-800",
                    children: "請款單資料輸入",
                  }),
                  Ct.jsxs("button", {
                    onClick: () => S(!0),
                    className:
                      "text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors font-medium flex items-center",
                    children: [
                      Ct.jsx(Of, { size: 16, className: "mr-1" }),
                      " 清空所有資料",
                    ],
                  }),
                ],
              }),
              B &&
                Ct.jsx("div", {
                  className:
                    "absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-xl p-4",
                  children: Ct.jsxs("div", {
                    className:
                      "bg-white p-6 rounded-lg shadow-xl border border-gray-200 max-w-sm w-full text-center animate-in zoom-in duration-200",
                    children: [
                      Ct.jsx("h3", {
                        className: "text-lg font-bold text-gray-800 mb-2",
                        children: "確定要清空所有資料嗎？",
                      }),
                      Ct.jsx("p", {
                        className: "text-gray-600 text-sm mb-6",
                        children:
                          "這將會清除您目前輸入的所有數據與項目，且無法復原。",
                      }),
                      Ct.jsxs("div", {
                        className: "flex justify-center space-x-3",
                        children: [
                          Ct.jsx("button", {
                            onClick: () => S(!1),
                            className:
                              "px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium",
                            children: "取消",
                          }),
                          Ct.jsx("button", {
                            onClick: () => {
                              (i(yu), E({}), S(!1));
                            },
                            className:
                              "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium",
                            children: "確定清空",
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              Ct.jsxs("div", {
                className: "flex border-b border-gray-200 mb-6",
                children: [
                  Ct.jsx("button", {
                    className: `py-2 px-6 font-medium text-sm transition-colors ${a === "SPC" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`,
                    onClick: () => s("SPC"),
                    children: "SPC 數據",
                  }),
                  Ct.jsx("button", {
                    className: `py-2 px-6 font-medium text-sm transition-colors ${a === "STC" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`,
                    onClick: () => s("STC"),
                    children: "STC 數據",
                  }),
                ],
              }),
              a === "SPC" &&
                Ct.jsxs("div", {
                  className: "space-y-6 animate-in fade-in duration-300",
                  children: [
                    Ct.jsxs("div", {
                      className: "grid grid-cols-2 gap-4",
                      children: [
                        Ct.jsx(gl, {
                          label: "請款月份",
                          value: r.month,
                          onChange: (X) =>
                            i((R) => ({ ...R, month: X.target.value })),
                        }),
                        Ct.jsx(gl, {
                          label: "社群貼文篇數",
                          type: "number",
                          value: r.spc.posts,
                          onChange: (X) =>
                            i((R) => ({
                              ...R,
                              spc: { ...R.spc, posts: Number(X.target.value) },
                            })),
                        }),
                      ],
                    }),
                    Ct.jsxs("div", {
                      className:
                        "bg-gray-50 p-5 rounded-lg border border-gray-200",
                      children: [
                        Ct.jsxs("h3", {
                          className:
                            "font-semibold mb-4 text-gray-800 flex items-center",
                          children: [
                            Ct.jsx(of, {
                              size: 18,
                              className: "mr-2 text-blue-600",
                            }),
                            "SPC 廣告（依商品分列）",
                          ],
                        }),
                        Ct.jsx("p", {
                          className: "text-xs text-gray-600 mb-3",
                          children:
                            "僅鎖鮮袋／鎖鮮；每列一個品名。實報實銷＝（轉換+影觀）投放×1.1。廣告操作費每商品一筆：轉換花費×截圖「廣告操作%」×1.05 + 影觀花費×15%×1.05。請款順序依該品「轉換+影觀」投放總額由大至小。",
                        }),
                        Ct.jsx(C5, {
                          lines: r.spc.adLines,
                          onChange: (X) =>
                            i((R) => ({ ...R, spc: { ...R.spc, adLines: X } })),
                          addLabel: "新增 SPC 商品列",
                        }),
                      ],
                    }),
                    Ct.jsxs("div", {
                      children: [
                        Ct.jsx("h3", {
                          className: "font-semibold mb-4 text-gray-800",
                          children: "項目",
                        }),
                        Ct.jsx(E5, {
                          kols: r.spc.kols,
                          onChange: (X) =>
                            i((R) => ({ ...R, spc: { ...R.spc, kols: X } })),
                        }),
                      ],
                    }),
                    Ct.jsxs("div", {
                      className:
                        "bg-gray-50 p-5 rounded-lg border border-gray-200",
                      children: [
                        Ct.jsxs("h3", {
                          className:
                            "font-semibold mb-4 text-gray-800 flex items-center",
                          children: [
                            Ct.jsx(of, {
                              size: 18,
                              className: "mr-2 text-blue-600",
                            }),
                            "附件截圖 (同步更新雙邊)",
                          ],
                        }),
                        Ct.jsx(T5, {
                          images: r.images,
                          onChange: (X) => i((R) => ({ ...R, images: X })),
                          onFileSelect: (X, R) => E((I) => ({ ...I, [X]: R })),
                          onFileRemove: (X) =>
                            E((R) => {
                              const I = { ...R };
                              return (delete I[X], I);
                            }),
                        }),
                        Ct.jsx("button", {
                          onClick: () => H(w),
                          disabled: y,
                          className:
                            "mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-400",
                          children: y ? "正在更新數據..." : "更新",
                        }),
                        m &&
                          Ct.jsx("p", {
                            className:
                              "mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2",
                            children: m,
                          }),
                      ],
                    }),
                  ],
                }),
              a === "STC" &&
                Ct.jsxs("div", {
                  className: "space-y-6 animate-in fade-in duration-300",
                  children: [
                    Ct.jsxs("div", {
                      className: "grid grid-cols-2 gap-4",
                      children: [
                        Ct.jsx(gl, {
                          label: "請款月份",
                          value: r.month,
                          onChange: (X) =>
                            i((R) => ({ ...R, month: X.target.value })),
                        }),
                        Ct.jsx(gl, {
                          label: "社群貼文篇數",
                          type: "number",
                          value: r.stc.posts,
                          onChange: (X) =>
                            i((R) => ({
                              ...R,
                              stc: { ...R.stc, posts: Number(X.target.value) },
                            })),
                        }),
                      ],
                    }),
                    Ct.jsxs("div", {
                      className:
                        "bg-gray-50 p-5 rounded-lg border border-gray-200",
                      children: [
                        Ct.jsxs("h3", {
                          className:
                            "font-semibold mb-4 text-gray-800 flex items-center",
                          children: [
                            Ct.jsx(of, {
                              size: 18,
                              className: "mr-2 text-blue-600",
                            }),
                            "STC 廣告（依商品分列）",
                          ],
                        }),
                        Ct.jsx("p", {
                          className: "text-xs text-gray-600 mb-3",
                          children:
                            "非鎖鮮袋皆屬 STC；各品名分列。影觀操作費率固定 15%；僅【轉換】花費套用截圖最右欄「廣告操作%」。每商品一筆合併操作費，請款順序依該品轉換+影觀投放總額由大至小。",
                        }),
                        Ct.jsx(C5, {
                          lines: r.stc.adLines,
                          onChange: (X) =>
                            i((R) => ({ ...R, stc: { ...R.stc, adLines: X } })),
                          addLabel: "新增 STC 商品列",
                        }),
                      ],
                    }),
                    Ct.jsxs("div", {
                      children: [
                        Ct.jsx("h3", {
                          className: "font-semibold mb-4 text-gray-800",
                          children: "項目",
                        }),
                        Ct.jsx(E5, {
                          kols: r.stc.kols,
                          onChange: (X) =>
                            i((R) => ({ ...R, stc: { ...R.stc, kols: X } })),
                        }),
                      ],
                    }),
                    Ct.jsxs("div", {
                      className:
                        "bg-gray-50 p-5 rounded-lg border border-gray-200",
                      children: [
                        Ct.jsxs("h3", {
                          className:
                            "font-semibold mb-4 text-gray-800 flex items-center",
                          children: [
                            Ct.jsx(of, {
                              size: 18,
                              className: "mr-2 text-blue-600",
                            }),
                            "附件截圖 (同步更新雙邊)",
                          ],
                        }),
                        Ct.jsx(T5, {
                          images: r.images,
                          onChange: (X) => i((R) => ({ ...R, images: X })),
                          onFileSelect: (X, R) => E((I) => ({ ...I, [X]: R })),
                          onFileRemove: (X) =>
                            E((R) => {
                              const I = { ...R };
                              return (delete I[X], I);
                            }),
                        }),
                        Ct.jsx("button", {
                          onClick: () => H(w),
                          disabled: y,
                          className:
                            "mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-400",
                          children: y ? "正在更新數據..." : "更新",
                        }),
                        m &&
                          Ct.jsx("p", {
                            className:
                              "mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2",
                            children: m,
                          }),
                      ],
                    }),
                  ],
                }),
            ],
          }),
          Ct.jsxs("div", {
            className: "space-y-6",
            children: [
              Ct.jsxs("div", {
                className:
                  "bg-white p-6 rounded-xl shadow-sm no-print flex justify-between items-center",
                children: [
                  Ct.jsx("h2", {
                    className: "text-xl font-bold text-gray-800",
                    children: "預覽與輸出",
                  }),
                  Ct.jsxs("div", {
                    className: "flex space-x-3",
                    children: [
                      Ct.jsxs("button", {
                        onClick: () => ft("SPC"),
                        className:
                          "flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm",
                        children: [
                          Ct.jsx(c0, { size: 18, className: "mr-2" }),
                          " 列印 SPC",
                        ],
                      }),
                      Ct.jsxs("button", {
                        onClick: () => ft("STC"),
                        className:
                          "flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm",
                        children: [
                          Ct.jsx(c0, { size: 18, className: "mr-2" }),
                          " 列印 STC",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              Ct.jsxs("div", {
                className: "space-y-8",
                children: [
                  Ct.jsx(O5, {
                    id: "invoice-spc",
                    title: "順昶塑膠SPC請款明細",
                    company: "獻策顧問有限公司",
                    items: Nt.items,
                    total: Nt.total,
                    hiddenOnPrint: c === "STC",
                    images: r.images,
                  }),
                  Ct.jsx(O5, {
                    id: "invoice-stc",
                    title: "順昶塑膠STC請款明細",
                    company: "獻策顧問有限公司",
                    items: Dt.items,
                    total: Dt.total,
                    hiddenOnPrint: c === "SPC",
                    images: r.images,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
Xm.createRoot(document.getElementById("root")).render(
  Ct.jsx(ei.StrictMode, { children: Ct.jsx(fb, {}) }),
);
export { wn as _, db as c, M5 as g };
