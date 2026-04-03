"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiInverterBrandsList, type TicketCreateInput } from "../api";
import DatePicker from "./DatePicker";
import { LuSearch } from "react-icons/lu";

const INVERTER_BRANDS = [
  "ABB",
  "ADVANCED ENERGY",
  "Astronergy",
  "CHINT",
  "DELTA",
  "EAPRO",
  "EUROLEX",
  "FRONIUS",
  "GOODWE",
  "GROWATT",
  "HAVELLS",
  "HUAWEI",
  "INGETEAM",
  "JAKSON",
  "JFY-TECH",
  "K SOLARE",
  "KACO",
  "KSATAR",
  "KSOLARE",
  "LUMINOUS",
  "microlyte",
  "MUSCLE",
  "OFFGRID",
  "Oorja on Move(ZTT)",
  "POWER ONE",
  "REFUsol",
  "REPLUS",
  "SAJ",
  "SCHNEIDER ELECTRIC",
  "SMA",
  "SOFAR",
  "SOLA X POWER",
  "SOLAR EDGE",
  "SOLEPLANET",
  "SOLEX",
  "SOLIS",
  "Statcon",
  "SUCAM",
  "SUNGROW",
  "TBEA",
  "THEA",
  "VIKRAM SOLAR",
  "WAAREE",
  "Zeversolar",
] as const;

const OTHER_BRAND_VALUE = "OTHER";

const INVERTER_MODELS_RAW = `PVS50KWTL
PVS100KWTL
PVS175KWTL
PVS250KWTL
TRIO20KW
TRIO50KW
UNODMPLUS
CORE1000
AE3KWTL
AE5KWTL
AE10KWTL
AE20KWTL
AE50KWTX
AE100TX
AE250TX
PCS 50K
PCS100KW
PCS250KW
PCS500KW
PCS1MW
CPSSCA5KWTL
CPSSCA10KWTL
CPSSCA20KWTL
CPSSCA60KWTL
CPSSCH100KWTL
CPS250KWTL
CPS500KWTL
M10A
M20A
M50A
M70A
M100A
M125HV
M250HV
EAPRO3KW
EAPRO5KW
EAPRO10KW
EAPRO25KW
EAPRO50KW
EAPRO100KW
EU3KW
EU5KW
EU10KW
EU20KW
EUW50KW
EU100KW
Primo3KW
Primo5KW
Symo10KW
Symo20KW
Eco25KW
Tauro50KW
Tauro100KW
GW3KWD
GW5KWD
GW10KWDT
GW20KWDT
GW50KWMT
GW80KWMT
GW100KWHT
MIC750TLX
MIN5KWTLX
MOD10KWTL3X
MID50KWTL3X
MAX80KWTL3X
MAX125KWTL3X
MAX250KWTL3X
EnviroGTI3KW
EnviroGTI5KW
EnviroGTI10KW
EnviroGTI20KW
EnviroGTI50KW
EnviroGTI100KW
SUN20003KW
SUN20005KW
SUN200010KW
SUN200020KW
SUN200050KW
SUN2000100KWTLM2
SUN2000110KWTL
SUN2000185KWTL
SUN2000215KWTL
INGECON5KWTL
INGECON10KWTL
INGECON50KWTL
INGECON100KWTL
INGECON500KW
INGECON1MW
Jakson3KW
Jakson5KW
Jakson10KW
Jakson25KW
Jakson50KW
Jakson100KW
JFY3KW
JFY5KW
JFY10KW
JFY20KW
JFY50KW
KS3KW
KS5KW
KS20KW
KS50KW
blueplanet3KW
blueplanet5KW
blueplanet10KW
blueplanet20KW
blueplanet50KW
blueplanet100KW
KSATAR3KW
KSATAR5KW
KSATAR10KW
KSATAR20KW
KSATAR50KW
KS3KW
KS5KW
KS10KW
KS20KW
KS50KW
NXG 750
NXG 1100
NXG 1450
Solarverter3KW
Solarverter5KW
Cruze5KW
Cruze10KW
Microlyte3KW
Microlyte5KW
Microlyte10KW
Microlyte20KW
Microlyte50KW
Muscle3KW
Muscle5KW
Muscle10KW
Muscle25KW
Muscle50KW
Offgrid3KW
Offgrid5KW
Offgrid7.5KW
Hybrid5KW
Hybrid10KW
ZTT50KW
ZTT100KW
ZTT250KW
ZTT 500KW
AuroraPVI3KW
AuroraPVI10KW
AuroraTRIO20KW
AuroraTRIO50KW
PVS100
PVS500
REFUsol008KW
REFUsol020KW
REFUsol033KW
REFUsol050KW
REFUsol100KW
REFUsol250KW
PCS50KW
PCS100KW
PCS250KW
PCS500K
PCS1MW
PCS2MW
R3
R5
Suntrio
SuntrioPlus
Sununo
ConextCL25
ConextCL36
ConextCL60
ConextCL72
Conext100K
Conext250KW
SunnyBoy3KW
SunnyBoy5KW
SunnyTripower10KW
SunnyTripower25KW
SunnyTripowerCORE1
SunnyCentral 2200
SunnyCentral 4600
SOFAR3KWTL
SOFAR5KWTL
SOFAR10KWTL
SOFAR50KWTL
SOFAR80KWTL
SOFAR 110KWTL
SOFAR255KWTL
X13KW
X15KW
X310KW
X320KW
X350KW
SE3KW
SE5KW
SE10KW
SE27.6KW
SE100KW
SE250KW
ASW3KWS
ASW5KWS
ASW10KWLT
ASW20KWLT
ASW50KWLT
ASW100KWLT
SOLEX3KW
SOLEX5KW
SOLEX10KW
SOLEX25KW
SOLEX50KW
SOLEX100KW
1P3KW4G
1P5KW4G
3P10KW4G
25KW5G
50KW5G
80KW5G
100KW5G
Energiaa3KW
Energiaa5KW
Energiaa10KW
Energiaa25KW
Energiaa50KW
Energiaa100KW
SUCAM3KW
SUCAM5KW
SUCAM10KW
SUCAM25KW
SUCAM50KW
SG5KWD
SG10KWTL
SG33CX
SG50CX
SG110CX
SG125HX
SG250HX
TBEA250KW
TBEA500KW
TBEA1MW
TBEA2.5MW
THEA3KW
THEA5KW
THEA10KW
THEA25KW
THEAW50KW
THEA100KW
VSL25KW
VSL50KW
VSL100KW
VSL250KW
VSL500KW
W3KW
W5KW
W10KW
W25KW
W50KW
W100KW
Zeverlution1KW
Zeverlution3KW
Zeverlution5KW
Zeverlution10KW
Zeverlution20KW`;

const INVERTER_MODELS = INVERTER_MODELS_RAW.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

export default function NewTicketModal({
  onClose,
  onSubmit,
  onSubmitBulk,
  userRole,
}: {
  onClose: () => void;
  onSubmit: (t: TicketCreateInput) => Promise<void>;
  onSubmitBulk: (tickets: TicketCreateInput[]) => Promise<void>;
  userRole?: string;
}) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [form, setForm] = useState({
    customerName: "",
    customerCompany: "",
    inverterMake: "",
    inverterModel: "",
    capacity: "",
    serialNumber: "",
    inverterLocation: "",
    faultDescription: "",
    errorCode: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    warrantyStatus: false,
    warrantyEndDate: "",
  });
  const [brandOption, setBrandOption] = useState<string>("");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>(() => [...INVERTER_BRANDS]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const capacityRef = useRef<HTMLInputElement | null>(null);
  const faultRef = useRef<HTMLTextAreaElement | null>(null);
  const brandSearchRef = useRef<HTMLInputElement | null>(null);
  const brandWrapRef = useRef<HTMLDivElement | null>(null);
  const [bulkBrandOpen, setBulkBrandOpen] = useState(false);
  const [bulkBrandSearch, setBulkBrandSearch] = useState("");
  const bulkBrandSearchRef = useRef<HTMLInputElement | null>(null);
  const bulkBrandWrapRef = useRef<HTMLDivElement | null>(null);

  type BulkItem = {
    brandOption: string;
    inverterMake: string;
    inverterModel: string;
    capacity: string;
    serialNumber: string;
    faultDescription: string;
    errorCode: string;
  };

  const emptyBulkItem = (): BulkItem => ({
    brandOption: "",
    inverterMake: "",
    inverterModel: "",
    capacity: "",
    serialNumber: "",
    faultDescription: "",
    errorCode: "",
  });

  const [bulkCustomer, setBulkCustomer] = useState({
    customerName: "",
    customerCompany: "",
    inverterLocation: "",
  });

  const [bulkSettings, setBulkSettings] = useState({
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    warrantyStatus: false,
    warrantyEndDate: "",
  });

  const [bulkItems, setBulkItems] = useState<BulkItem[]>(() => [emptyBulkItem()]);
  const [bulkActiveIndex, setBulkActiveIndex] = useState(0);

  const canSetPriorityAndWarranty =
    String(userRole || "").toUpperCase() === "ADMIN" ||
    String(userRole || "").toUpperCase() === "SALES";

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const filteredBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    const src = (brands || []).map((b) => String(b || "")).filter(Boolean);
    if (!q) return src;
    return src.filter((b) => String(b).toLowerCase().includes(q));
  }, [brandSearch, brands]);

  const bulkFilteredBrands = useMemo(() => {
    const q = bulkBrandSearch.trim().toLowerCase();
    const src = (brands || []).map((b) => String(b || "")).filter(Boolean);
    if (!q) return src;
    return src.filter((b) => String(b).toLowerCase().includes(q));
  }, [bulkBrandSearch, brands]);

  useEffect(() => {
    // Switching tabs should not leave dropdowns/errors hanging.
    setError("");
    setBrandOpen(false);
    setBulkBrandOpen(false);
    setBulkBrandSearch("");
  }, [mode]);

  useEffect(() => {
    setBulkBrandOpen(false);
    setBulkBrandSearch("");
  }, [bulkActiveIndex]);

  useEffect(() => {
    setBulkActiveIndex((i) => Math.max(0, Math.min(i, (bulkItems?.length || 1) - 1)));
  }, [bulkItems?.length]);

  useEffect(() => {
    let cancelled = false;
    apiInverterBrandsList()
      .then((rows) => {
        if (cancelled) return;
        if (Array.isArray(rows) && rows.length) setBrands(rows);
      })
      .catch(() => {
        // Keep static fallback list if API fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!brandOpen) return;
    // Focus search when dropdown opens.
    queueMicrotask(() => brandSearchRef.current?.focus());

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setBrandOpen(false);
    };

    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      const el = brandWrapRef.current;
      if (!el) return;
      const target = ev.target as Node | null;
      if (target && !el.contains(target)) setBrandOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [brandOpen]);

  useEffect(() => {
    if (!bulkBrandOpen) return;
    // Focus search when dropdown opens.
    queueMicrotask(() => bulkBrandSearchRef.current?.focus());

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setBulkBrandOpen(false);
    };

    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      const el = bulkBrandWrapRef.current;
      if (!el) return;
      const target = ev.target as Node | null;
      if (target && !el.contains(target)) setBulkBrandOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [bulkBrandOpen]);

  const brandLabel = useMemo(() => {
    if (!brandOption) return "";
    if (brandOption === OTHER_BRAND_VALUE) return "Others";
    return brandOption;
  }, [brandOption]);

  const bulkBrandOption = bulkItems[bulkActiveIndex]?.brandOption || "";
  const bulkBrandLabel = useMemo(() => {
    if (!bulkBrandOption) return "";
    if (bulkBrandOption === OTHER_BRAND_VALUE) return "Others";
    return bulkBrandOption;
  }, [bulkBrandOption]);

  const modelPlaceholder = useMemo(() => {
    // Suggest an example model (no dropdown; user types freely)
    const example = String(INVERTER_MODELS[0] || "").trim();
    return example ? `e.g. ${example}` : "Enter model number";
  }, []);

  const handleSubmit = () => {
    const capacity = form.capacity.trim();
    const faultDescription = form.faultDescription.trim();
    const missing: string[] = [];
    if (!capacity) missing.push("Capacity");
    if (!faultDescription) missing.push("Fault Description");
    if (canSetPriorityAndWarranty && form.warrantyStatus && !form.warrantyEndDate.trim()) {
      missing.push("Warranty end date");
    }
    if (missing.length) {
      setError(`Please fill required field(s): ${missing.join(", ")}.`);
      if (!capacity) capacityRef.current?.focus();
      else faultRef.current?.focus();
      return;
    }
    setLoading(true);
    setError("");
    onSubmit({
      capacity,
      faultDescription,
      customerName: form.customerName.trim() || undefined,
      customerCompany: form.customerCompany.trim() || undefined,
      inverterMake: form.inverterMake.trim() || undefined,
      inverterModel: form.inverterModel.trim() || undefined,
      serialNumber: form.serialNumber.trim() || undefined,
      inverterLocation: form.inverterLocation.trim() || undefined,
      errorCode: form.errorCode.trim() || undefined,
      ...(canSetPriorityAndWarranty ? { priority: form.priority || undefined } : {}),
      ...(canSetPriorityAndWarranty
        ? {
            warrantyStatus: form.warrantyStatus,
            warrantyEndDate: form.warrantyStatus ? form.warrantyEndDate.trim() || undefined : undefined,
          }
        : {}),
    })
      .then(() => onClose())
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to create ticket"))
      .finally(() => setLoading(false));
  };

  const setBulkItem = (idx: number, patch: Partial<BulkItem>) => {
    setBulkItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addBulkItem = () => {
    setBulkItems((prev) => {
      const next = [...prev, emptyBulkItem()];
      setBulkActiveIndex(next.length - 1);
      return next;
    });
  };

  const removeBulkItem = (idx: number) => {
    setBulkItems((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      setBulkActiveIndex((current) => {
        if (current > idx) return current - 1;
        if (current === idx) return Math.max(0, idx - 1);
        return current;
      });
      return next.length ? next : [emptyBulkItem()];
    });
  };

  const handleSubmitBulk = () => {
    const missingShared: string[] = [];
    if (canSetPriorityAndWarranty && bulkSettings.warrantyStatus && !bulkSettings.warrantyEndDate.trim()) {
      missingShared.push("Warranty end date");
    }
    if (missingShared.length) {
      setError(`Please fill required field(s): ${missingShared.join(", ")}.`);
      return;
    }

    const inputs: TicketCreateInput[] = [];
    for (let i = 0; i < bulkItems.length; i++) {
      const it = bulkItems[i]!;
      const capacity = String(it.capacity || "").trim();
      const faultDescription = String(it.faultDescription || "").trim();
      if (!capacity || !faultDescription) {
        const missing: string[] = [];
        if (!capacity) missing.push("Capacity");
        if (!faultDescription) missing.push("Fault Description");
        setError(`Ticket #${i + 1}: Please fill required field(s): ${missing.join(", ")}.`);
        return;
      }

      inputs.push({
        capacity,
        faultDescription,
        customerName: bulkCustomer.customerName.trim() || undefined,
        customerCompany: bulkCustomer.customerCompany.trim() || undefined,
        inverterLocation: bulkCustomer.inverterLocation.trim() || undefined,
        inverterMake: it.inverterMake.trim() || undefined,
        inverterModel: it.inverterModel.trim() || undefined,
        serialNumber: it.serialNumber.trim() || undefined,
        errorCode: it.errorCode.trim() || undefined,
        ...(canSetPriorityAndWarranty ? { priority: bulkSettings.priority || undefined } : {}),
        ...(canSetPriorityAndWarranty
          ? {
              warrantyStatus: bulkSettings.warrantyStatus,
              warrantyEndDate: bulkSettings.warrantyStatus
                ? bulkSettings.warrantyEndDate.trim() || undefined
                : undefined,
            }
          : {}),
      });
    }

    setLoading(true);
    setError("");
    onSubmitBulk(inputs)
      .then(() => onClose())
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to create tickets"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Create New Service Ticket</div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="form-error" style={{ marginBottom: 12, marginTop: -6 }}>
              {error}
            </div>
          )}
          <div className="tabs" style={{ marginTop: -6, marginBottom: 14 }}>
            <div
              className={`tab ${mode === "single" ? "active" : ""}`}
              onClick={() => setMode("single")}
              role="button"
              tabIndex={0}
            >
              Single Ticket
            </div>
            <div
              className={`tab ${mode === "bulk" ? "active" : ""}`}
              onClick={() => setMode("bulk")}
              role="button"
              tabIndex={0}
            >
              Bulk Ticket Raiser
            </div>
          </div>

          {mode === "single" ? (
            <>
              <div className="form-section">Customer Information</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    className="form-input"
                    placeholder="Company name"
                    value={form.customerCompany}
                    onChange={(e) => set("customerCompany", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Complaint Raised By</label>
                  <input
                    className="form-input"
                    placeholder="Customer name"
                    value={form.customerName}
                    onChange={(e) => set("customerName", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-section">Inverter Details</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Brand Name</label>
                  <div ref={brandWrapRef} style={{ position: "relative" }}>
                    <button
                      type="button"
                      className="form-select"
                      aria-haspopup="listbox"
                      aria-expanded={brandOpen}
                      disabled={loading}
                      onClick={() => {
                        setBrandOpen((v) => !v);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ color: brandLabel ? "var(--text)" : "var(--text3)" }}>
                        {brandLabel || "Select brand (optional)"}
                      </span>
                      <span aria-hidden style={{ color: "var(--text3)" }}>▾</span>
                    </button>

                    {brandOpen ? (
                      <div
                        role="listbox"
                        aria-label="Brand options"
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "calc(100% + 6px)",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          boxShadow: "var(--shadow)",
                          zIndex: 50,
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ padding: 10, borderBottom: "1px solid var(--border)" }}>
                          <div className="search-wrap">
                            <span className="search-icon" aria-hidden>
                              <LuSearch />
                            </span>
                            <input
                              ref={brandSearchRef}
                              className="form-input"
                              placeholder="Search brand..."
                              value={brandSearch}
                              onChange={(e) => setBrandSearch(e.target.value)}
                              style={{ paddingLeft: 32 }}
                            />
                          </div>
                          {brandSearch.trim() ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setBrandSearch("");
                                brandSearchRef.current?.focus();
                              }}
                              style={{ marginTop: 8 }}
                            >
                              Clear search
                            </button>
                          ) : null}
                        </div>

                        <div style={{ maxHeight: 240, overflowY: "auto" }}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={!brandOption}
                            className="table-link"
                            onClick={() => {
                              setBrandOption("");
                              set("inverterMake", "");
                              setBrandSearch("");
                              setBrandOpen(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              textAlign: "left",
                              color: !brandOption ? "var(--accent)" : "var(--text)",
                            }}
                          >
                            Select brand (optional)
                          </button>

                          {filteredBrands.map((b) => {
                            const selected = brandOption === b;
                            return (
                              <button
                                key={b}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                className="table-link"
                                onClick={() => {
                                  setBrandOption(b);
                                  set("inverterMake", b);
                                  setBrandSearch("");
                                  setBrandOpen(false);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  color: selected ? "var(--accent)" : "var(--text)",
                                }}
                              >
                                {b}
                              </button>
                            );
                          })}

                          <div style={{ height: 1, background: "var(--border)" }} />

                          <button
                            type="button"
                            role="option"
                            aria-selected={brandOption === OTHER_BRAND_VALUE}
                            className="table-link"
                            onClick={() => {
                              setBrandOption(OTHER_BRAND_VALUE);
                              set("inverterMake", "");
                              setBrandSearch("");
                              setBrandOpen(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              textAlign: "left",
                              color: brandOption === OTHER_BRAND_VALUE ? "var(--accent)" : "var(--text)",
                            }}
                          >
                            Others
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input
                    className="form-input"
                    placeholder={modelPlaceholder}
                    value={form.inverterModel}
                    onChange={(e) => set("inverterModel", e.target.value)}
                    disabled={loading}
                  />
                </div>
                {brandOption === OTHER_BRAND_VALUE ? (
                  <div className="form-group full">
                    <label className="form-label">Other Brand</label>
                    <input
                      className="form-input"
                      placeholder="Enter brand name"
                      value={form.inverterMake}
                      onChange={(e) => set("inverterMake", e.target.value)}
                    />
                  </div>
                ) : null}
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 50kW"
                    ref={capacityRef}
                    onChange={(e) => set("capacity", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Serial Number</label>
                  <input
                    className="form-input"
                    placeholder="Equipment serial"
                    onChange={(e) => set("serialNumber", e.target.value)}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Inverter Location</label>
                  <input
                    className="form-input"
                    placeholder="Pickup/installation location (Full Address)"
                    onChange={(e) => set("inverterLocation", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-section">Fault Details</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Fault Description *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the issue..."
                    ref={faultRef}
                    onChange={(e) => set("faultDescription", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Error Code</label>
                  <input
                    className="form-input"
                    placeholder="e.g. F001"
                    onChange={(e) => set("errorCode", e.target.value)}
                  />
                </div>
                {canSetPriorityAndWarranty ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={form.priority}
                        onChange={(e) => set("priority", e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Warranty</label>
                      <select
                        className="form-select"
                        value={form.warrantyStatus ? "true" : "false"}
                        onChange={(e) => {
                          const under = e.target.value === "true";
                          set("warrantyStatus", under);
                          if (!under) set("warrantyEndDate", "");
                        }}
                      >
                        <option value="true">Under Warranty</option>
                        <option value="false">Out of Warranty</option>
                      </select>
                    </div>
                    {form.warrantyStatus ? (
                      <div className="form-group">
                        <label className="form-label">Warranty End Date</label>
                        <DatePicker
                          value={form.warrantyEndDate}
                          onChange={(next) => set("warrantyEndDate", next)}
                          placeholder="Select end date"
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div className="form-section">Customer Information</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    className="form-input"
                    placeholder="Company name"
                    value={bulkCustomer.customerCompany}
                    onChange={(e) =>
                      setBulkCustomer((p) => ({ ...p, customerCompany: e.target.value }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Complaint Raised By</label>
                  <input
                    className="form-input"
                    placeholder="Customer name"
                    value={bulkCustomer.customerName}
                    onChange={(e) =>
                      setBulkCustomer((p) => ({ ...p, customerName: e.target.value }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Inverter Location</label>
                  <input
                    className="form-input"
                    placeholder="Pickup/installation location (Full Address)"
                    value={bulkCustomer.inverterLocation}
                    onChange={(e) =>
                      setBulkCustomer((p) => ({ ...p, inverterLocation: e.target.value }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              {canSetPriorityAndWarranty ? (
                <>
                  <div className="form-section">Ticket Settings</div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={bulkSettings.priority}
                        onChange={(e) =>
                          setBulkSettings((p) => ({
                            ...p,
                            priority: e.target.value as "LOW" | "MEDIUM" | "HIGH",
                          }))
                        }
                        disabled={loading}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Warranty</label>
                      <select
                        className="form-select"
                        value={bulkSettings.warrantyStatus ? "true" : "false"}
                        onChange={(e) => {
                          const under = e.target.value === "true";
                          setBulkSettings((p) => ({
                            ...p,
                            warrantyStatus: under,
                            warrantyEndDate: under ? p.warrantyEndDate : "",
                          }));
                        }}
                        disabled={loading}
                      >
                        <option value="true">Under Warranty</option>
                        <option value="false">Out of Warranty</option>
                      </select>
                    </div>
                    {bulkSettings.warrantyStatus ? (
                      <div className="form-group">
                        <label className="form-label">Warranty End Date</label>
                        <DatePicker
                          value={bulkSettings.warrantyEndDate}
                          onChange={(next) =>
                            setBulkSettings((p) => ({ ...p, warrantyEndDate: next }))
                          }
                          placeholder="Select end date"
                        />
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}

              <div className="form-section">Inverter & Fault Details</div>
              <div className="bulk-nav" role="tablist" aria-label="Bulk ticket selector">
                {(bulkItems || []).map((_, idx) => {
                  const active = idx === bulkActiveIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`btn btn-ghost btn-sm bulk-pill ${active ? "active" : ""}`}
                      onClick={() => setBulkActiveIndex(idx)}
                      disabled={loading}
                      title={`Ticket #${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {bulkItems[bulkActiveIndex] ? (
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>
                      Ticket #{bulkActiveIndex + 1}
                    </div>
                    {bulkItems.length > 1 ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeBulkItem(bulkActiveIndex)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="bulk-ticket-grid">
                    <div className="form-group">
                      <label className="form-label">Brand Name</label>
                      <div ref={bulkBrandWrapRef} style={{ position: "relative" }}>
                        <button
                          type="button"
                          className="form-select"
                          aria-haspopup="listbox"
                          aria-expanded={bulkBrandOpen}
                          disabled={loading}
                          onClick={() => setBulkBrandOpen((v) => !v)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span style={{ color: bulkBrandLabel ? "var(--text)" : "var(--text3)" }}>
                            {bulkBrandLabel || "Select brand (optional)"}
                          </span>
                          <span aria-hidden style={{ color: "var(--text3)" }}>
                            ▾
                          </span>
                        </button>

                        {bulkBrandOpen ? (
                          <div
                            role="listbox"
                            aria-label="Brand options"
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              top: "calc(100% + 6px)",
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              borderRadius: 10,
                              boxShadow: "var(--shadow)",
                              zIndex: 50,
                              overflow: "hidden",
                            }}
                          >
                            <div style={{ padding: 10, borderBottom: "1px solid var(--border)" }}>
                              <div className="search-wrap">
                                <span className="search-icon" aria-hidden>
                                  <LuSearch />
                                </span>
                                <input
                                  ref={bulkBrandSearchRef}
                                  className="form-input"
                                  placeholder="Search brand..."
                                  value={bulkBrandSearch}
                                  onChange={(e) => setBulkBrandSearch(e.target.value)}
                                  style={{ paddingLeft: 32 }}
                                />
                              </div>
                              {bulkBrandSearch.trim() ? (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => {
                                    setBulkBrandSearch("");
                                    bulkBrandSearchRef.current?.focus();
                                  }}
                                  style={{ marginTop: 8 }}
                                >
                                  Clear search
                                </button>
                              ) : null}
                            </div>

                            <div style={{ maxHeight: 240, overflowY: "auto" }}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={!bulkBrandOption}
                                className="table-link"
                                onClick={() => {
                                  setBulkItem(bulkActiveIndex, { brandOption: "", inverterMake: "" });
                                  setBulkBrandSearch("");
                                  setBulkBrandOpen(false);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  color: !bulkBrandOption ? "var(--accent)" : "var(--text)",
                                }}
                              >
                                Select brand (optional)
                              </button>

                              {bulkFilteredBrands.map((b) => {
                                const selected = bulkBrandOption === b;
                                return (
                                  <button
                                    key={b}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    className="table-link"
                                    onClick={() => {
                                      setBulkItem(bulkActiveIndex, { brandOption: b, inverterMake: b });
                                      setBulkBrandSearch("");
                                      setBulkBrandOpen(false);
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "10px 12px",
                                      textAlign: "left",
                                      color: selected ? "var(--accent)" : "var(--text)",
                                    }}
                                  >
                                    {b}
                                  </button>
                                );
                              })}

                              <div style={{ height: 1, background: "var(--border)" }} />

                              <button
                                type="button"
                                role="option"
                                aria-selected={bulkBrandOption === OTHER_BRAND_VALUE}
                                className="table-link"
                                onClick={() => {
                                  setBulkItem(bulkActiveIndex, {
                                    brandOption: OTHER_BRAND_VALUE,
                                    inverterMake: "",
                                  });
                                  setBulkBrandSearch("");
                                  setBulkBrandOpen(false);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  color: bulkBrandOption === OTHER_BRAND_VALUE ? "var(--accent)" : "var(--text)",
                                }}
                              >
                                Others
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {bulkBrandOption === OTHER_BRAND_VALUE ? (
                        <div style={{ marginTop: 10 }}>
                          <label className="form-label">Other Brand</label>
                          <input
                            className="form-input"
                            placeholder="Enter brand name"
                            value={bulkItems[bulkActiveIndex]!.inverterMake}
                            onChange={(e) => setBulkItem(bulkActiveIndex, { inverterMake: e.target.value })}
                            disabled={loading}
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model</label>
                      <input
                        className="form-input"
                        placeholder={modelPlaceholder}
                        value={bulkItems[bulkActiveIndex]!.inverterModel}
                        onChange={(e) => setBulkItem(bulkActiveIndex, { inverterModel: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Capacity *</label>
                      <input
                        className="form-input"
                        placeholder="e.g. 50kW"
                        value={bulkItems[bulkActiveIndex]!.capacity}
                        onChange={(e) => setBulkItem(bulkActiveIndex, { capacity: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Serial Number</label>
                      <input
                        className="form-input"
                        placeholder="Equipment serial"
                        value={bulkItems[bulkActiveIndex]!.serialNumber}
                        onChange={(e) => setBulkItem(bulkActiveIndex, { serialNumber: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: "span 3" }}>
                      <label className="form-label">Fault Description *</label>
                      <textarea
                        className="form-textarea"
                        rows={1}
                        placeholder="Describe the issue..."
                        value={bulkItems[bulkActiveIndex]!.faultDescription}
                        onChange={(e) => setBulkItem(bulkActiveIndex, { faultDescription: e.target.value })}
                        disabled={loading}
                        style={{ minHeight: 38 }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Error Code</label>
                      <input
                        className="form-input"
                        placeholder="e.g. F001"
                        value={bulkItems[bulkActiveIndex]!.errorCode}
                        onChange={(e) => setBulkItem(bulkActiveIndex, { errorCode: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                className="btn btn-ghost"
                onClick={addBulkItem}
                disabled={loading}
                style={{ width: "100%" }}
              >
                + Add More
              </button>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-accent"
            onClick={mode === "single" ? handleSubmit : handleSubmitBulk}
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : mode === "single"
                ? "Create Ticket →"
                : `Create ${bulkItems.length} Ticket${bulkItems.length === 1 ? "" : "s"} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
