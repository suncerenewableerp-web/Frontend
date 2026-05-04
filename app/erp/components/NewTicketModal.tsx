"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  apiCustomerCompaniesList,
  apiCustomerCompanyAdd,
  apiCustomerCompanyDelete,
  apiInverterModelAdd,
  apiInverterModelsList,
  apiInverterCapacitiesList,
  apiInverterCapacityAdd,
  apiInverterCapacityDelete,
  apiInverterBrandAdd,
  apiInverterBrandDelete,
  apiInverterBrandsList,
  type TicketCreateInput,
} from "../api";
import inverterCatalog from "../data/inverter_catalog.json";
import DatePicker from "./DatePicker";
import { LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";

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
const OTHER_COMPANY_VALUE = "OTHER_COMPANY";
const OTHER_MODEL_VALUE = "OTHER_MODEL";
const OTHER_CAPACITY_VALUE = "OTHER_CAPACITY";

function toBrandKey(input: string): string {
  return String(input || "").trim().replace(/\s+/g, " ").trim().toLowerCase();
}

type InverterCatalog = {
  companies?: string[];
  makes?: string[];
  modelsByMakeKey?: Record<string, string[]>;
  capacities?: string[];
  capacitiesByMakeKey?: Record<string, string[]>;
};

function uniqueSorted(values: string[]): string[] {
  const map = new Map<string, string>();
  for (const raw of values) {
    const v = String(raw || "").trim().replace(/\s+/g, " ").trim();
    if (!v) continue;
    const k = toBrandKey(v);
    if (!k) continue;
    if (!map.has(k)) map.set(k, v);
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
}

const CATALOG = (inverterCatalog || {}) as InverterCatalog;
const COMPANY_OPTIONS = uniqueSorted(CATALOG.companies || []);
const MAKE_OPTIONS_FROM_JSON = uniqueSorted(CATALOG.makes || []);
const MODELS_BY_MAKE_KEY: Record<string, string[]> = CATALOG.modelsByMakeKey || {};
const CAPACITY_OPTIONS = uniqueSorted(CATALOG.capacities || []);
const CAPACITIES_BY_MAKE_KEY: Record<string, string[]> = CATALOG.capacitiesByMakeKey || {};

const DEFAULT_BRANDS = uniqueSorted([...INVERTER_BRANDS, ...MAKE_OPTIONS_FROM_JSON]);

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
    onsiteRepairing: false,
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    warrantyStatus: false,
    warrantyEndDate: "",
  });
  const [brandOption, setBrandOption] = useState<string>("");
  const [modelOption, setModelOption] = useState<string>("");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>(() => [...DEFAULT_BRANDS]);
  const [companyOption, setCompanyOption] = useState<string>("");
  const [companySearch, setCompanySearch] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companies, setCompanies] = useState<string[]>(() => [...COMPANY_OPTIONS]);
  const [capacityOption, setCapacityOption] = useState<string>("");
  const [capacitySearch, setCapacitySearch] = useState("");
  const [capacityOpen, setCapacityOpen] = useState(false);
  const [capacities, setCapacities] = useState<string[]>(() => [...CAPACITY_OPTIONS]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const capacityRef = useRef<HTMLInputElement | null>(null);
  const faultRef = useRef<HTMLTextAreaElement | null>(null);
  const brandSearchRef = useRef<HTMLInputElement | null>(null);
  const brandWrapRef = useRef<HTMLDivElement | null>(null);
  const companySearchRef = useRef<HTMLInputElement | null>(null);
  const companyWrapRef = useRef<HTMLDivElement | null>(null);
  const capacitySearchRef = useRef<HTMLInputElement | null>(null);
  const capacityWrapRef = useRef<HTMLDivElement | null>(null);
  const [bulkBrandOpen, setBulkBrandOpen] = useState(false);
  const [bulkBrandSearch, setBulkBrandSearch] = useState("");
  const bulkBrandSearchRef = useRef<HTMLInputElement | null>(null);
  const bulkBrandWrapRef = useRef<HTMLDivElement | null>(null);
  const [bulkCompanyOption, setBulkCompanyOption] = useState<string>("");
  const [bulkCompanyOpen, setBulkCompanyOpen] = useState(false);
  const [bulkCompanySearch, setBulkCompanySearch] = useState("");
  const bulkCompanySearchRef = useRef<HTMLInputElement | null>(null);
  const bulkCompanyWrapRef = useRef<HTMLDivElement | null>(null);
  const [bulkCapacityOpen, setBulkCapacityOpen] = useState(false);
  const [bulkCapacitySearch, setBulkCapacitySearch] = useState("");
  const bulkCapacitySearchRef = useRef<HTMLInputElement | null>(null);
  const bulkCapacityWrapRef = useRef<HTMLDivElement | null>(null);

  type BulkItem = {
    brandOption: string;
    modelOption: string;
    inverterMake: string;
    inverterModel: string;
    capacityOption: string;
    capacity: string;
    serialNumber: string;
    faultDescription: string;
    errorCode: string;
  };

  const emptyBulkItem = (): BulkItem => ({
    brandOption: "",
    modelOption: "",
    inverterMake: "",
    inverterModel: "",
    capacityOption: "",
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

  const bulkItemNavState = useMemo(() => {
    return bulkItems.map((it) => {
      const capacity = String(it.capacity || "").trim();
      const faultDescription = String(it.faultDescription || "").trim();
      const complete = Boolean(capacity && faultDescription);
      const hasAny = [
        it.brandOption,
        it.inverterMake,
        it.inverterModel,
        it.capacity,
        it.serialNumber,
        it.faultDescription,
        it.errorCode,
      ].some((v) => Boolean(String(v || "").trim()));
      const partial = hasAny && !complete;
      return { complete, partial };
    });
  }, [bulkItems]);

  const roleNorm = String(userRole || "").trim().toUpperCase();
  const isCustomer = roleNorm === "CUSTOMER";

  const canSetPriorityAndWarranty = roleNorm === "ADMIN" || roleNorm === "SALES";

  const canManageBrandList = roleNorm === "ADMIN";
  const canManageCompanyList = roleNorm === "ADMIN" || roleNorm === "SALES";
  const canDeleteCompanyList = roleNorm === "ADMIN";
  const canManageCapacityList = roleNorm === "ADMIN" || roleNorm === "SALES";
  const canDeleteCapacityList = roleNorm === "ADMIN";
  const [brandManageMsg, setBrandManageMsg] = useState("");
  const [brandManageError, setBrandManageError] = useState("");
  const [brandManageBusyKey, setBrandManageBusyKey] = useState<string>("");
  const canManageModelList = roleNorm === "ADMIN" || roleNorm === "SALES";
  const [modelManageMsg, setModelManageMsg] = useState("");
  const [modelManageError, setModelManageError] = useState("");
  const [modelManageBusyKey, setModelManageBusyKey] = useState<string>("");
  const [companyManageMsg, setCompanyManageMsg] = useState("");
  const [companyManageError, setCompanyManageError] = useState("");
  const [companyManageBusyKey, setCompanyManageBusyKey] = useState<string>("");
  const [capacityManageMsg, setCapacityManageMsg] = useState("");
  const [capacityManageError, setCapacityManageError] = useState("");
  const [capacityManageBusyKey, setCapacityManageBusyKey] = useState<string>("");

  const brandKeys = useMemo(() => {
    const s = new Set<string>();
    (brands || []).forEach((b) => {
      const k = toBrandKey(String(b || ""));
      if (k) s.add(k);
    });
    return s;
  }, [brands]);

  const companyKeys = useMemo(() => {
    const s = new Set<string>();
    (companies || []).forEach((c) => {
      const k = toBrandKey(String(c || ""));
      if (k) s.add(k);
    });
    return s;
  }, [companies]);

  const capacityKeys = useMemo(() => {
    const s = new Set<string>();
    (capacities || []).forEach((c) => {
      const k = toBrandKey(String(c || ""));
      if (k) s.add(k);
    });
    return s;
  }, [capacities]);

  const [serverModelsByMakeKey, setServerModelsByMakeKey] = useState<Record<string, string[]>>({});
  const fetchedModelsMakeKeysRef = useRef<Set<string>>(new Set());

  const mergeServerModels = (makeKey: string, models: string[]) => {
    if (!makeKey) return;
    const incoming = (models || []).map((m) => String(m || "").trim()).filter(Boolean);
    if (!incoming.length) return;
    setServerModelsByMakeKey((prev) => {
      const existing = Array.isArray(prev?.[makeKey]) ? prev[makeKey]! : [];
      const next = uniqueSorted([...existing, ...incoming]);
      if (next.length === existing.length) return prev;
      return { ...(prev || {}), [makeKey]: next };
    });
  };

  const fetchModelsForMakeIfNeeded = async (make: string) => {
    const makeKey = toBrandKey(make);
    if (!makeKey) return;
    if (fetchedModelsMakeKeysRef.current.has(makeKey)) return;
    fetchedModelsMakeKeysRef.current.add(makeKey);
    try {
      const rows = await apiInverterModelsList(make);
      mergeServerModels(makeKey, rows);
    } catch {
      // Keep static catalog list if API fails.
    }
  };

  const addModelToDropdown = async (rawMake: string, rawModel: string) => {
    if (!canManageModelList) return;
    const make = String(rawMake || "").trim().replace(/\s+/g, " ").trim();
    const model = String(rawModel || "").trim().replace(/\s+/g, " ").trim();
    const makeKey = toBrandKey(make);
    const modelKey = toBrandKey(model);
    if (!makeKey || !modelKey) return;
    setModelManageMsg("");
    setModelManageError("");
    setModelManageBusyKey(`add:${makeKey}:${modelKey}`);
    try {
      const savedName = await apiInverterModelAdd(make, model);
      mergeServerModels(makeKey, [savedName]);
      setModelManageMsg("Added to dropdown.");
    } catch (e) {
      setModelManageError(e instanceof Error ? e.message : "Failed to add model");
    } finally {
      setModelManageBusyKey("");
    }
  };

  const addBrandToDropdown = async (rawName: string) => {
    if (!canManageBrandList) return;
    const name = String(rawName || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return;
    setBrandManageMsg("");
    setBrandManageError("");
    setBrandManageBusyKey(`add:${key}`);
    try {
      const savedName = await apiInverterBrandAdd(name);
      setBrands((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        const saved = String(savedName || name).trim();
        const savedKey = toBrandKey(saved);
        if (savedKey && !next.some((b) => toBrandKey(String(b || "")) === savedKey)) {
          next.push(saved);
        }
        next.sort((a, b) => String(a).localeCompare(String(b)));
        return next;
      });
      setBrandManageMsg("Added to dropdown.");
    } catch (e) {
      setBrandManageError(e instanceof Error ? e.message : "Failed to add brand");
    } finally {
      setBrandManageBusyKey("");
    }
  };

  const deleteBrandFromDropdown = async (rawNameOrKey: string) => {
    if (!canManageBrandList) return;
    const key = toBrandKey(rawNameOrKey);
    if (!key) return;
    setBrandManageMsg("");
    setBrandManageError("");
    setBrandManageBusyKey(`del:${key}`);
    try {
      const deletedName = await apiInverterBrandDelete(rawNameOrKey);
      const deletedKey = toBrandKey(deletedName || rawNameOrKey);
      setBrands((prev) => (Array.isArray(prev) ? prev.filter((b) => toBrandKey(String(b || "")) !== deletedKey) : []));
      // If currently selected brand was deleted, clear it.
      setBrandOption((prev) => {
        if (toBrandKey(prev) === deletedKey) {
          set("inverterMake", "");
          return "";
        }
        return prev;
      });
      setBulkItems((prev) =>
        (prev || []).map((it) => {
          if (!it) return it;
          const optKey = toBrandKey(String(it.brandOption || ""));
          const makeKey = toBrandKey(String(it.inverterMake || ""));
          if (optKey === deletedKey || makeKey === deletedKey) {
            return { ...it, brandOption: "", inverterMake: "" };
          }
          return it;
        }),
      );
      setBrandManageMsg("Deleted from dropdown.");
    } catch (e) {
      setBrandManageError(e instanceof Error ? e.message : "Failed to delete brand");
    } finally {
      setBrandManageBusyKey("");
    }
  };

  const addCompanyToDropdown = async (rawName: string) => {
    if (!canManageCompanyList) return;
    const name = String(rawName || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return;
    setCompanyManageMsg("");
    setCompanyManageError("");
    setCompanyManageBusyKey(`add:${key}`);
    try {
      const savedName = await apiCustomerCompanyAdd(name);
      setCompanies((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        const saved = String(savedName || name).trim();
        const savedKey = toBrandKey(saved);
        if (savedKey && !next.some((c) => toBrandKey(String(c || "")) === savedKey)) {
          next.push(saved);
        }
        next.sort((a, b) => String(a).localeCompare(String(b)));
        return next;
      });
      setCompanyManageMsg("Added to dropdown.");
    } catch (e) {
      setCompanyManageError(e instanceof Error ? e.message : "Failed to add company");
    } finally {
      setCompanyManageBusyKey("");
    }
  };

  const deleteCompanyFromDropdown = async (rawNameOrKey: string) => {
    if (!canDeleteCompanyList) return;
    const key = toBrandKey(rawNameOrKey);
    if (!key) return;
    setCompanyManageMsg("");
    setCompanyManageError("");
    setCompanyManageBusyKey(`del:${key}`);
    try {
      const deletedName = await apiCustomerCompanyDelete(rawNameOrKey);
      const deletedKey = toBrandKey(deletedName || rawNameOrKey);
      setCompanies((prev) =>
        (Array.isArray(prev) ? prev : []).filter((c) => toBrandKey(String(c || "")) !== deletedKey),
      );
      setCompanyOption((prev) => {
        if (toBrandKey(prev) === deletedKey) {
          set("customerCompany", "");
          return "";
        }
        return prev;
      });
      setBulkCompanyOption((prev) => {
        if (toBrandKey(prev) === deletedKey) {
          setBulkCustomer((p) => ({ ...p, customerCompany: "" }));
          return "";
        }
        return prev;
      });
      setCompanyManageMsg("Deleted from dropdown.");
    } catch (e) {
      setCompanyManageError(e instanceof Error ? e.message : "Failed to delete company");
    } finally {
      setCompanyManageBusyKey("");
    }
  };

  const addCapacityToDropdown = async (rawName: string) => {
    if (!canManageCapacityList) return;
    const name = String(rawName || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return;
    setCapacityManageMsg("");
    setCapacityManageError("");
    setCapacityManageBusyKey(`add:${key}`);
    try {
      const savedName = await apiInverterCapacityAdd(name);
      setCapacities((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        const saved = String(savedName || name).trim();
        const savedKey = toBrandKey(saved);
        if (savedKey && !next.some((c) => toBrandKey(String(c || "")) === savedKey)) {
          next.push(saved);
        }
        next.sort((a, b) => String(a).localeCompare(String(b)));
        return next;
      });
      setCapacityManageMsg("Added to dropdown.");
    } catch (e) {
      setCapacityManageError(e instanceof Error ? e.message : "Failed to add capacity");
    } finally {
      setCapacityManageBusyKey("");
    }
  };

  const deleteCapacityFromDropdown = async (rawNameOrKey: string) => {
    if (!canDeleteCapacityList) return;
    const key = toBrandKey(rawNameOrKey);
    if (!key) return;
    setCapacityManageMsg("");
    setCapacityManageError("");
    setCapacityManageBusyKey(`del:${key}`);
    try {
      const deletedName = await apiInverterCapacityDelete(rawNameOrKey);
      const deletedKey = toBrandKey(deletedName || rawNameOrKey);
      setCapacities((prev) =>
        (Array.isArray(prev) ? prev : []).filter((c) => toBrandKey(String(c || "")) !== deletedKey),
      );
      setCapacityOption((prev) => {
        if (toBrandKey(prev) === deletedKey) {
          set("capacity", "");
          return "";
        }
        return prev;
      });
      setBulkItems((prev) =>
        (prev || []).map((it) => {
          if (!it) return it;
          if (toBrandKey(String(it.capacityOption || "")) === deletedKey) {
            return { ...it, capacityOption: "", capacity: "" };
          }
          return it;
        }),
      );
      setCapacityManageMsg("Deleted from dropdown.");
    } catch (e) {
      setCapacityManageError(e instanceof Error ? e.message : "Failed to delete capacity");
    } finally {
      setCapacityManageBusyKey("");
    }
  };

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const filteredBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    const src = (brands || []).map((b) => String(b || "")).filter(Boolean);
    if (!q) return src;
    return src.filter((b) => String(b).toLowerCase().includes(q));
  }, [brandSearch, brands]);

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    const src = (companies || []).map((c) => String(c || "")).filter(Boolean);
    if (!q) return src;
    return src.filter((c) => String(c).toLowerCase().includes(q));
  }, [companySearch, companies]);

  const filteredCapacities = useMemo(() => {
    const q = capacitySearch.trim().toLowerCase();
    const src = (capacities || []).map((c) => String(c || "")).filter(Boolean);
    if (!q) return src;
    return src.filter((c) => String(c).toLowerCase().includes(q));
  }, [capacitySearch, capacities]);

  const brandAddCandidate = useMemo(() => {
    if (!canManageBrandList) return null;
    const name = String(brandSearch || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return null;
    if (brandKeys.has(key)) return null;
    return { name, key };
  }, [brandSearch, brandKeys, canManageBrandList]);

  const companyAddCandidate = useMemo(() => {
    if (!canManageCompanyList) return null;
    const name = String(companySearch || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return null;
    if (companyKeys.has(key)) return null;
    return { name, key };
  }, [companySearch, companyKeys, canManageCompanyList]);

  const capacityAddCandidate = useMemo(() => {
    if (!canManageCapacityList) return null;
    const name = String(capacitySearch || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return null;
    if (capacityKeys.has(key)) return null;
    return { name, key };
  }, [capacitySearch, capacityKeys, canManageCapacityList]);

  const bulkFilteredBrands = useMemo(() => {
    const q = bulkBrandSearch.trim().toLowerCase();
    const src = (brands || []).map((b) => String(b || "")).filter(Boolean);
    if (!q) return src;
    return src.filter((b) => String(b).toLowerCase().includes(q));
  }, [bulkBrandSearch, brands]);

  const bulkFilteredCompanies = useMemo(() => {
    const q = bulkCompanySearch.trim().toLowerCase();
    const src = (companies || []).map((c) => String(c || "")).filter(Boolean);
    if (!q) return src;
    return src.filter((c) => String(c).toLowerCase().includes(q));
  }, [bulkCompanySearch, companies]);

  const bulkFilteredCapacities = useMemo(() => {
    const q = bulkCapacitySearch.trim().toLowerCase();
    const src = (capacities || []).map((c) => String(c || "")).filter(Boolean);
    if (!q) return src;
    return src.filter((c) => String(c).toLowerCase().includes(q));
  }, [bulkCapacitySearch, capacities]);

  const bulkBrandAddCandidate = useMemo(() => {
    if (!canManageBrandList) return null;
    const name = String(bulkBrandSearch || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return null;
    if (brandKeys.has(key)) return null;
    return { name, key };
  }, [bulkBrandSearch, brandKeys, canManageBrandList]);

  const bulkCompanyAddCandidate = useMemo(() => {
    if (!canManageCompanyList) return null;
    const name = String(bulkCompanySearch || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return null;
    if (companyKeys.has(key)) return null;
    return { name, key };
  }, [bulkCompanySearch, companyKeys, canManageCompanyList]);

  const bulkCapacityAddCandidate = useMemo(() => {
    if (!canManageCapacityList) return null;
    const name = String(bulkCapacitySearch || "").trim().replace(/\s+/g, " ").trim();
    const key = toBrandKey(name);
    if (!key) return null;
    if (capacityKeys.has(key)) return null;
    return { name, key };
  }, [bulkCapacitySearch, capacityKeys, canManageCapacityList]);

  const switchMode = (next: "single" | "bulk") => {
    setMode(next);
    setError("");
    setBrandOpen(false);
    setBulkBrandOpen(false);
    setBulkBrandSearch("");
    setCompanyOpen(false);
    setBulkCompanyOpen(false);
    setCompanySearch("");
    setBulkCompanySearch("");
    setCapacityOpen(false);
    setBulkCapacityOpen(false);
    setCapacitySearch("");
    setBulkCapacitySearch("");
    if (next === "bulk") {
      setForm((p) => ({ ...p, onsiteRepairing: false }));
    }
  };

  const modelsForSelectedMake = useMemo(() => {
    const key = toBrandKey(form.inverterMake);
    if (!key) return [];
    const base = MODELS_BY_MAKE_KEY[key] || [];
    const extra = serverModelsByMakeKey[key] || [];
    return uniqueSorted([...base, ...extra]);
  }, [form.inverterMake, serverModelsByMakeKey]);

  const bulkModelsForSelectedMake = useMemo(() => {
    const make = bulkItems[bulkActiveIndex]?.inverterMake || "";
    const key = toBrandKey(make);
    if (!key) return [];
    const base = MODELS_BY_MAKE_KEY[key] || [];
    const extra = serverModelsByMakeKey[key] || [];
    return uniqueSorted([...base, ...extra]);
  }, [bulkItems, bulkActiveIndex, serverModelsByMakeKey]);

  const capacitiesForSelectedMake = useMemo(() => {
    const makeKey = toBrandKey(form.inverterMake);
    const scoped = makeKey ? CAPACITIES_BY_MAKE_KEY[makeKey] || [] : [];
    return scoped.length ? scoped : capacities;
  }, [form.inverterMake, capacities]);

  const bulkCapacitiesForSelectedMake = useMemo(() => {
    const make = bulkItems[bulkActiveIndex]?.inverterMake || "";
    const makeKey = toBrandKey(make);
    const scoped = makeKey ? CAPACITIES_BY_MAKE_KEY[makeKey] || [] : [];
    return scoped.length ? scoped : capacities;
  }, [bulkItems, bulkActiveIndex, capacities]);

  useEffect(() => {
    if (!modelsForSelectedMake.length) return;
    if (modelOption === OTHER_MODEL_VALUE) return;
    const current = toBrandKey(form.inverterModel);
    if (!current) return;
    if (!modelsForSelectedMake.some((m) => toBrandKey(m) === current)) {
      set("inverterModel", "");
    }
  }, [modelsForSelectedMake, form.inverterModel, modelOption]);

  useEffect(() => {
    const active = bulkItems[bulkActiveIndex];
    if (!active) return;
    if (!bulkModelsForSelectedMake.length) return;
    if (active.modelOption === OTHER_MODEL_VALUE) return;
    const current = toBrandKey(active.inverterModel);
    if (!current) return;
    if (!bulkModelsForSelectedMake.some((m) => toBrandKey(m) === current)) {
      setBulkItem(bulkActiveIndex, { inverterModel: "" });
    }
  }, [bulkModelsForSelectedMake, bulkItems, bulkActiveIndex]);

  useEffect(() => {
    if (!form.inverterMake.trim()) return;
    void fetchModelsForMakeIfNeeded(form.inverterMake);
  }, [form.inverterMake]);

  useEffect(() => {
    const make = bulkItems[bulkActiveIndex]?.inverterMake || "";
    if (!String(make).trim()) return;
    void fetchModelsForMakeIfNeeded(make);
  }, [bulkItems, bulkActiveIndex]);

  const activateBulkTicket = (idx: number) => {
    setBulkActiveIndex(idx);
    setBulkBrandOpen(false);
    setBulkBrandSearch("");
    setBulkCompanyOpen(false);
    setBulkCompanySearch("");
    setBulkCapacityOpen(false);
    setBulkCapacitySearch("");
  };

  useEffect(() => {
    let cancelled = false;
    apiInverterBrandsList()
      .then((rows) => {
        if (cancelled) return;
        if (Array.isArray(rows) && rows.length) {
          setBrands((prev) => uniqueSorted([...DEFAULT_BRANDS, ...prev, ...rows]));
        }
      })
      .catch(() => {
        // Keep static fallback list if API fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiCustomerCompaniesList()
      .then((rows) => {
        if (cancelled) return;
        if (Array.isArray(rows) && rows.length) {
          setCompanies((prev) => uniqueSorted([...COMPANY_OPTIONS, ...prev, ...rows]));
        }
      })
      .catch(() => {
        // Keep static fallback list if API fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiInverterCapacitiesList()
      .then((rows) => {
        if (cancelled) return;
        if (Array.isArray(rows) && rows.length) {
          setCapacities((prev) => uniqueSorted([...CAPACITY_OPTIONS, ...prev, ...rows]));
        }
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
    if (!companyOpen) return;
    queueMicrotask(() => companySearchRef.current?.focus());

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setCompanyOpen(false);
    };

    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      const el = companyWrapRef.current;
      if (!el) return;
      const target = ev.target as Node | null;
      if (target && !el.contains(target)) setCompanyOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [companyOpen]);

  useEffect(() => {
    if (!capacityOpen) return;
    queueMicrotask(() => capacitySearchRef.current?.focus());

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setCapacityOpen(false);
    };

    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      const el = capacityWrapRef.current;
      if (!el) return;
      const target = ev.target as Node | null;
      if (target && !el.contains(target)) setCapacityOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [capacityOpen]);

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

  useEffect(() => {
    if (!bulkCompanyOpen) return;
    queueMicrotask(() => bulkCompanySearchRef.current?.focus());

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setBulkCompanyOpen(false);
    };

    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      const el = bulkCompanyWrapRef.current;
      if (!el) return;
      const target = ev.target as Node | null;
      if (target && !el.contains(target)) setBulkCompanyOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [bulkCompanyOpen]);

  useEffect(() => {
    if (!bulkCapacityOpen) return;
    queueMicrotask(() => bulkCapacitySearchRef.current?.focus());

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setBulkCapacityOpen(false);
    };

    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      const el = bulkCapacityWrapRef.current;
      if (!el) return;
      const target = ev.target as Node | null;
      if (target && !el.contains(target)) setBulkCapacityOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [bulkCapacityOpen]);

  const brandLabel = useMemo(() => {
    if (!brandOption) return "";
    if (brandOption === OTHER_BRAND_VALUE) return "Others";
    return brandOption;
  }, [brandOption]);

  const companyLabel = useMemo(() => {
    if (!companyOption) return "";
    if (companyOption === OTHER_COMPANY_VALUE) return "Others";
    return companyOption;
  }, [companyOption]);

  const capacityLabel = useMemo(() => {
    if (!capacityOption) return "";
    if (capacityOption === OTHER_CAPACITY_VALUE) return "Others";
    return capacityOption;
  }, [capacityOption]);

  const bulkBrandOption = bulkItems[bulkActiveIndex]?.brandOption || "";
  const bulkBrandLabel = useMemo(() => {
    if (!bulkBrandOption) return "";
    if (bulkBrandOption === OTHER_BRAND_VALUE) return "Others";
    return bulkBrandOption;
  }, [bulkBrandOption]);

  const bulkCompanyLabel = useMemo(() => {
    if (!bulkCompanyOption) return "";
    if (bulkCompanyOption === OTHER_COMPANY_VALUE) return "Others";
    return bulkCompanyOption;
  }, [bulkCompanyOption]);

  const bulkCapacityOption = bulkItems[bulkActiveIndex]?.capacityOption || "";
  const bulkCapacityLabel = useMemo(() => {
    if (!bulkCapacityOption) return "";
    if (bulkCapacityOption === OTHER_CAPACITY_VALUE) return "Others";
    return bulkCapacityOption;
  }, [bulkCapacityOption]);

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
      if (!capacity) {
        setCapacityOpen(true);
        queueMicrotask(() => capacitySearchRef.current?.focus());
        capacityRef.current?.focus();
      }
      else faultRef.current?.focus();
      return;
    }
    setLoading(true);
    setError("");
    onSubmit({
      capacity,
      faultDescription,
      ...(form.onsiteRepairing ? { serviceType: "ONSITE" } : {}),
      customerName: form.customerName.trim() || undefined,
      customerCompany: form.customerCompany.trim() || undefined,
      inverterMake: form.inverterMake.trim() || undefined,
      inverterModel: form.inverterModel.trim() || undefined,
      serialNumber: isCustomer ? undefined : form.serialNumber.trim() || undefined,
      inverterLocation: form.inverterLocation.trim() || undefined,
      errorCode: isCustomer ? undefined : form.errorCode.trim() || undefined,
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
      setBulkBrandOpen(false);
      setBulkBrandSearch("");
      return next;
    });
  };

  const removeBulkItem = (idx: number) => {
    setBulkBrandOpen(false);
    setBulkBrandSearch("");
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
        serialNumber: isCustomer ? undefined : it.serialNumber.trim() || undefined,
        errorCode: isCustomer ? undefined : it.errorCode.trim() || undefined,
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
                  onClick={() => switchMode("single")}
                  role="button"
                  tabIndex={0}
                >
                  Single Ticket
                </div>
                <div
                  className={`tab ${mode === "bulk" ? "active" : ""}`}
                  onClick={() => switchMode("bulk")}
                  role="button"
                  tabIndex={0}
                >
                  Bulk Ticket Raiser
                </div>
          </div>

          {mode === "single" ? (
            <>
              <div className="form-section">Service Type</div>
              <div style={{ marginBottom: 14 }}>
                <button
                  type="button"
                  className={form.onsiteRepairing ? "btn btn-accent btn-sm" : "btn btn-ghost btn-sm"}
                  disabled={loading}
                  onClick={() => set("onsiteRepairing", !form.onsiteRepairing)}
                >
                  On-site Repairing
                </button>
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--text3)" }}>
                  Select this if you want an engineer to visit the company site and repair the inverter (offline booking).
                </div>
              </div>

	              <div className="form-section">Customer Information</div>
	              <div className="form-grid">
	                <div className="form-group">
	                  <label className="form-label">Company Name</label>
	                  <div ref={companyWrapRef} style={{ position: "relative" }}>
	                    <button
	                      type="button"
	                      className="form-select"
	                      aria-haspopup="listbox"
	                      aria-expanded={companyOpen}
	                      disabled={loading}
	                      onClick={() => setCompanyOpen((v) => !v)}
	                      style={{
	                        width: "100%",
	                        textAlign: "left",
	                        display: "flex",
	                        justifyContent: "space-between",
	                        alignItems: "center",
	                        gap: 10,
	                      }}
	                    >
	                      <span style={{ color: companyLabel ? "var(--text)" : "var(--text3)" }}>
	                        {companyLabel || "Select company (optional)"}
	                      </span>
	                      <span aria-hidden style={{ color: "var(--text3)" }}>▾</span>
	                    </button>

	                    {companyOpen ? (
	                      <div
	                        role="listbox"
	                        aria-label="Company options"
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
	                              ref={companySearchRef}
	                              className="form-input"
	                              placeholder="Search company..."
	                              value={companySearch}
	                              onChange={(e) => setCompanySearch(e.target.value)}
	                              style={{ paddingLeft: 32 }}
	                            />
	                          </div>

	                          {companySearch.trim() ? (
	                            <button
	                              type="button"
	                              className="btn btn-ghost btn-sm"
	                              onClick={() => {
	                                setCompanySearch("");
	                                companySearchRef.current?.focus();
	                              }}
	                              style={{ marginTop: 8 }}
	                            >
	                              Clear search
	                            </button>
	                          ) : null}

	                          {companyAddCandidate ? (
	                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
	                              <button
	                                type="button"
	                                className="btn btn-ghost btn-sm"
	                                disabled={loading || companyManageBusyKey === `add:${companyAddCandidate.key}`}
	                                onClick={() => addCompanyToDropdown(companyAddCandidate.name)}
	                              >
	                                Add "{companyAddCandidate.name}"
	                              </button>
	                              <span style={{ fontSize: 12, color: "var(--text3)" }}>
	                                Sales/Admin: add company to dropdown.
	                              </span>
	                            </div>
	                          ) : null}

	                          {(companyManageMsg || companyManageError) && (
	                            <div style={{ marginTop: 8, fontSize: 12 }}>
	                              {companyManageMsg ? (
	                                <div style={{ color: "var(--text3)" }}>{companyManageMsg}</div>
	                              ) : null}
	                              {companyManageError ? (
	                                <div style={{ color: "var(--danger)" }}>{companyManageError}</div>
	                              ) : null}
	                            </div>
	                          )}
	                        </div>

	                        <div style={{ maxHeight: 240, overflowY: "auto" }}>
	                          <button
	                            type="button"
	                            role="option"
	                            aria-selected={!companyOption}
	                            className="table-link"
	                            onClick={() => {
	                              setCompanyOption("");
	                              set("customerCompany", "");
	                              setCompanySearch("");
	                              setCompanyOpen(false);
	                            }}
	                            style={{
	                              width: "100%",
	                              padding: "10px 12px",
	                              textAlign: "left",
	                              color: !companyOption ? "var(--accent)" : "var(--text)",
	                            }}
	                          >
	                            Select company (optional)
	                          </button>

	                          {filteredCompanies.map((c) => {
	                            const selected = companyOption === c;
	                            return (
	                              <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}>
	                                <button
	                                  type="button"
	                                  role="option"
	                                  aria-selected={selected}
	                                  className="table-link"
	                                  onClick={() => {
	                                    setCompanyOption(c);
	                                    set("customerCompany", c);
	                                    setCompanySearch("");
	                                    setCompanyOpen(false);
	                                  }}
	                                  style={{
	                                    flex: 1,
	                                    padding: "10px 12px",
	                                    textAlign: "left",
	                                    color: selected ? "var(--accent)" : "var(--text)",
	                                  }}
	                                >
	                                  {c}
	                                </button>
	                                {canDeleteCompanyList ? (
	                                  <button
	                                    type="button"
	                                    className="btn btn-ghost btn-sm"
	                                    aria-label={`Delete ${c}`}
	                                    disabled={loading || companyManageBusyKey === `del:${toBrandKey(c)}`}
	                                    onClick={(e) => {
	                                      e.preventDefault();
	                                      e.stopPropagation();
	                                      if (
	                                        typeof window !== "undefined" &&
	                                        !window.confirm(`Delete company "${c}" from dropdown?`)
	                                      )
	                                        return;
	                                      deleteCompanyFromDropdown(c);
	                                    }}
	                                    title="Delete company"
	                                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
	                                  >
	                                    <LuTrash2 aria-hidden />
	                                  </button>
	                                ) : null}
	                              </div>
	                            );
	                          })}

	                          <div style={{ height: 1, background: "var(--border)" }} />

	                          <button
	                            type="button"
	                            role="option"
	                            aria-selected={companyOption === OTHER_COMPANY_VALUE}
	                            className="table-link"
	                            onClick={() => {
	                              setCompanyOption(OTHER_COMPANY_VALUE);
	                              set("customerCompany", "");
	                              setCompanySearch("");
	                              setCompanyOpen(false);
	                            }}
	                            style={{
	                              width: "100%",
	                              padding: "10px 12px",
	                              textAlign: "left",
	                              color: companyOption === OTHER_COMPANY_VALUE ? "var(--accent)" : "var(--text)",
	                            }}
	                          >
	                            Others
	                          </button>
	                        </div>
	                      </div>
	                    ) : null}
	                  </div>
	                </div>
	                {companyOption === OTHER_COMPANY_VALUE ? (
	                  <div className="form-group full">
	                    <label className="form-label">Other Company</label>
	                    <input
	                      className="form-input"
	                      placeholder="Enter company name"
	                      value={form.customerCompany}
	                      onChange={(e) => set("customerCompany", e.target.value)}
	                      disabled={loading}
	                    />
	                    <div style={{ marginTop: 6, fontSize: 12, color: "var(--text3)" }}>
	                      This company is not in dropdown yet. Sales team can add it later.
	                    </div>
	                    {canManageCompanyList && form.customerCompany.trim() && !companyKeys.has(toBrandKey(form.customerCompany)) ? (
	                      <button
	                        type="button"
	                        className="btn btn-ghost btn-sm"
	                        disabled={loading || companyManageBusyKey === `add:${toBrandKey(form.customerCompany)}`}
	                        onClick={() => addCompanyToDropdown(form.customerCompany)}
	                        style={{ marginTop: 8 }}
	                      >
	                        Add "{form.customerCompany.trim()}" to dropdown
	                      </button>
	                    ) : null}
	                  </div>
	                ) : null}
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
                          {canManageBrandList ? (
                            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              {brandAddCandidate ? (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  disabled={loading || brandManageBusyKey === `add:${brandAddCandidate.key}`}
                                  onClick={() => addBrandToDropdown(brandAddCandidate.name)}
                                  title="Add typed brand to dropdown"
                                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                                >
                                  <LuPlus aria-hidden />
                                  Add "{brandAddCandidate.name}"
                                </button>
                              ) : null}
                              {brandManageMsg ? (
                                <span style={{ fontSize: 12, color: "var(--green)" }}>{brandManageMsg}</span>
                              ) : brandManageError ? (
                                <span style={{ fontSize: 12, color: "var(--red)" }}>{brandManageError}</span>
                              ) : (
                                <span style={{ fontSize: 12, color: "var(--text3)" }}>
                                  Admin: add or delete brands from this dropdown.
                                </span>
                              )}
                            </div>
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
                              setModelOption("");
                              set("inverterModel", "");
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
                              <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  className="table-link"
                                  onClick={() => {
                                    setBrandOption(b);
                                    set("inverterMake", b);
                                    setModelOption("");
                                    set("inverterModel", "");
                                    setBrandSearch("");
                                    setBrandOpen(false);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    color: selected ? "var(--accent)" : "var(--text)",
                                  }}
                                >
                                  {b}
                                </button>
                                {canManageBrandList ? (
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    aria-label={`Delete ${b}`}
                                    disabled={loading || brandManageBusyKey === `del:${toBrandKey(b)}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (
                                        typeof window !== "undefined" &&
                                        !window.confirm(`Delete brand \"${b}\" from dropdown?`)
                                      )
                                        return;
                                      deleteBrandFromDropdown(b);
                                    }}
                                    title="Delete brand"
                                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                  >
                                    <LuTrash2 aria-hidden />
                                  </button>
                                ) : null}
                              </div>
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
                              setModelOption("");
                              set("inverterModel", "");
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
	                  {modelsForSelectedMake.length ? (
                      <>
	                      <select
	                        className="form-select"
	                        value={modelOption === OTHER_MODEL_VALUE ? OTHER_MODEL_VALUE : form.inverterModel}
	                        onChange={(e) => {
	                          const v = e.target.value;
	                          if (v === OTHER_MODEL_VALUE) {
	                            setModelOption(OTHER_MODEL_VALUE);
	                            set("inverterModel", "");
	                            return;
	                          }
	                          setModelOption("");
	                          set("inverterModel", v);
	                        }}
	                        disabled={loading}
	                      >
	                        <option value="">Select model (optional)</option>
	                        {modelsForSelectedMake.map((m) => (
	                          <option key={m} value={m}>
	                            {m}
	                          </option>
	                        ))}
	                        <option value={OTHER_MODEL_VALUE}>Others</option>
	                      </select>
                      {modelOption === OTHER_MODEL_VALUE ? (
                        <div style={{ marginTop: 10 }}>
                          <input
                            className="form-input"
                            placeholder="Enter model name"
                            value={form.inverterModel}
                            onChange={(e) => {
                              setModelManageMsg("");
                              setModelManageError("");
                              set("inverterModel", e.target.value);
                            }}
                            disabled={loading}
                          />
                          <div style={{ marginTop: 6, fontSize: 12, color: "var(--text3)" }}>
                            This model is not in dropdown yet. Sales team can add it later.
                          </div>
                          {canManageModelList &&
                          form.inverterMake.trim() &&
                          form.inverterModel.trim() &&
                          !modelsForSelectedMake.some((m) => toBrandKey(m) === toBrandKey(form.inverterModel)) ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={
                                loading ||
                                modelManageBusyKey ===
                                  `add:${toBrandKey(form.inverterMake)}:${toBrandKey(form.inverterModel)}`
                              }
                              onClick={() => addModelToDropdown(form.inverterMake, form.inverterModel)}
                              style={{ marginTop: 8 }}
                            >
                              Add "{form.inverterModel.trim()}" to dropdown
                            </button>
                          ) : null}
                          {(modelManageMsg || modelManageError) && (
                            <div style={{ marginTop: 8, fontSize: 12 }}>
                              {modelManageMsg ? (
                                <div style={{ color: "var(--text3)" }}>{modelManageMsg}</div>
                              ) : null}
                              {modelManageError ? <div style={{ color: "var(--red)" }}>{modelManageError}</div> : null}
                            </div>
                          )}
                        </div>
                      ) : null}
                      </>
	                  ) : (
	                    <input
	                      className="form-input"
	                      placeholder={modelPlaceholder}
	                      value={form.inverterModel}
	                      onChange={(e) => set("inverterModel", e.target.value)}
	                      disabled={loading}
	                    />
	                  )}
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
	                  <div ref={capacityWrapRef} style={{ position: "relative" }}>
	                    <button
	                      type="button"
	                      className="form-select"
	                      aria-haspopup="listbox"
	                      aria-expanded={capacityOpen}
	                      disabled={loading}
	                      onClick={() => setCapacityOpen((v) => !v)}
	                      style={{
	                        width: "100%",
	                        textAlign: "left",
	                        display: "flex",
	                        justifyContent: "space-between",
	                        alignItems: "center",
	                        gap: 10,
	                      }}
	                    >
	                      <span style={{ color: capacityLabel ? "var(--text)" : "var(--text3)" }}>
	                        {capacityLabel || "Select capacity *"}
	                      </span>
	                      <span aria-hidden style={{ color: "var(--text3)" }}>▾</span>
	                    </button>

	                    {capacityOpen ? (
	                      <div
	                        role="listbox"
	                        aria-label="Capacity options"
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
	                              ref={capacitySearchRef}
	                              className="form-input"
	                              placeholder="Search capacity..."
	                              value={capacitySearch}
	                              onChange={(e) => setCapacitySearch(e.target.value)}
	                              style={{ paddingLeft: 32 }}
	                            />
	                          </div>

	                          {capacitySearch.trim() ? (
	                            <button
	                              type="button"
	                              className="btn btn-ghost btn-sm"
	                              onClick={() => {
	                                setCapacitySearch("");
	                                capacitySearchRef.current?.focus();
	                              }}
	                              style={{ marginTop: 8 }}
	                            >
	                              Clear search
	                            </button>
	                          ) : null}

	                          {capacityAddCandidate ? (
	                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
	                              <button
	                                type="button"
	                                className="btn btn-ghost btn-sm"
	                                disabled={loading || capacityManageBusyKey === `add:${capacityAddCandidate.key}`}
	                                onClick={() => addCapacityToDropdown(capacityAddCandidate.name)}
	                              >
	                                Add "{capacityAddCandidate.name}"
	                              </button>
	                              <span style={{ fontSize: 12, color: "var(--text3)" }}>
	                                Sales/Admin: add capacity to dropdown.
	                              </span>
	                            </div>
	                          ) : null}

	                          {(capacityManageMsg || capacityManageError) && (
	                            <div style={{ marginTop: 8, fontSize: 12 }}>
	                              {capacityManageMsg ? (
	                                <div style={{ color: "var(--text3)" }}>{capacityManageMsg}</div>
	                              ) : null}
	                              {capacityManageError ? (
	                                <div style={{ color: "var(--danger)" }}>{capacityManageError}</div>
	                              ) : null}
	                            </div>
	                          )}
	                        </div>

	                        <div style={{ maxHeight: 240, overflowY: "auto" }}>
	                          <button
	                            type="button"
	                            role="option"
	                            aria-selected={!capacityOption}
	                            className="table-link"
	                            onClick={() => {
	                              setCapacityOption("");
	                              set("capacity", "");
	                              setCapacitySearch("");
	                              setCapacityOpen(false);
	                              queueMicrotask(() => capacityRef.current?.focus());
	                            }}
	                            style={{
	                              width: "100%",
	                              padding: "10px 12px",
	                              textAlign: "left",
	                              color: !capacityOption ? "var(--accent)" : "var(--text)",
	                            }}
	                          >
	                            Select capacity *
	                          </button>

	                          {capacitiesForSelectedMake
	                            .filter((c) => String(c).toLowerCase().includes(capacitySearch.trim().toLowerCase()))
	                            .map((c) => {
	                              const selected = capacityOption === c;
	                              return (
	                                <div
	                                  key={c}
	                                  style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}
	                                >
	                                  <button
	                                    type="button"
	                                    role="option"
	                                    aria-selected={selected}
	                                    className="table-link"
	                                    onClick={() => {
	                                      setCapacityOption(c);
	                                      set("capacity", c);
	                                      setCapacitySearch("");
	                                      setCapacityOpen(false);
	                                      queueMicrotask(() => capacityRef.current?.focus());
	                                    }}
	                                    style={{
	                                      flex: 1,
	                                      padding: "10px 12px",
	                                      textAlign: "left",
	                                      color: selected ? "var(--accent)" : "var(--text)",
	                                    }}
	                                  >
	                                    {c}
	                                  </button>
	                                  {canDeleteCapacityList ? (
	                                    <button
	                                      type="button"
	                                      className="btn btn-ghost btn-sm"
	                                      aria-label={`Delete ${c}`}
	                                      disabled={loading || capacityManageBusyKey === `del:${toBrandKey(c)}`}
	                                      onClick={(e) => {
	                                        e.preventDefault();
	                                        e.stopPropagation();
	                                        if (
	                                          typeof window !== "undefined" &&
	                                          !window.confirm(`Delete capacity "${c}" from dropdown?`)
	                                        )
	                                          return;
	                                        deleteCapacityFromDropdown(c);
	                                      }}
	                                      title="Delete capacity"
	                                      style={{
	                                        display: "inline-flex",
	                                        alignItems: "center",
	                                        justifyContent: "center",
	                                      }}
	                                    >
	                                      <LuTrash2 aria-hidden />
	                                    </button>
	                                  ) : null}
	                                </div>
	                              );
	                            })}

	                          <div style={{ height: 1, background: "var(--border)" }} />

	                          <button
	                            type="button"
	                            role="option"
	                            aria-selected={capacityOption === OTHER_CAPACITY_VALUE}
	                            className="table-link"
	                            onClick={() => {
	                              setCapacityOption(OTHER_CAPACITY_VALUE);
	                              set("capacity", "");
	                              setCapacitySearch("");
	                              setCapacityOpen(false);
	                              queueMicrotask(() => capacityRef.current?.focus());
	                            }}
	                            style={{
	                              width: "100%",
	                              padding: "10px 12px",
	                              textAlign: "left",
	                              color: capacityOption === OTHER_CAPACITY_VALUE ? "var(--accent)" : "var(--text)",
	                            }}
	                          >
	                            Others
	                          </button>
	                        </div>
	                      </div>
	                    ) : null}
	                  </div>
		                  {capacityOption === OTHER_CAPACITY_VALUE ? (
		                    <div style={{ marginTop: 10 }}>
		                      <label className="form-label">Other Capacity *</label>
	                      <input
	                        ref={capacityRef}
	                        className="form-input"
	                        placeholder="e.g. 50kW"
	                        value={form.capacity}
	                        onChange={(e) => set("capacity", e.target.value)}
	                        disabled={loading}
	                      />
	                      <div style={{ marginTop: 6, fontSize: 12, color: "var(--text3)" }}>
	                        This capacity is not in dropdown yet. Sales team can add it later.
	                      </div>
	                      {canManageCapacityList &&
	                      form.capacity.trim() &&
	                      !capacityKeys.has(toBrandKey(form.capacity)) ? (
	                        <button
	                          type="button"
	                          className="btn btn-ghost btn-sm"
	                          disabled={loading || capacityManageBusyKey === `add:${toBrandKey(form.capacity)}`}
	                          onClick={() => addCapacityToDropdown(form.capacity)}
	                          style={{ marginTop: 8 }}
	                        >
	                          Add "{form.capacity.trim()}" to dropdown
	                        </button>
		                      ) : null}
		                    </div>
		                  ) : null}
		                </div>
                {!isCustomer ? (
                  <div className="form-group">
                    <label className="form-label">Serial Number</label>
                    <input
                      className="form-input"
                      placeholder="Equipment serial"
                      onChange={(e) => set("serialNumber", e.target.value)}
                    />
                  </div>
                ) : null}
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
                {!isCustomer ? (
                  <div className="form-group">
                    <label className="form-label">Error Code</label>
                    <input
                      className="form-input"
                      placeholder="e.g. F001"
                      onChange={(e) => set("errorCode", e.target.value)}
                    />
                  </div>
                ) : null}
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
	                  <div ref={bulkCompanyWrapRef} style={{ position: "relative" }}>
	                    <button
	                      type="button"
	                      className="form-select"
	                      aria-haspopup="listbox"
	                      aria-expanded={bulkCompanyOpen}
	                      disabled={loading}
	                      onClick={() => setBulkCompanyOpen((v) => !v)}
	                      style={{
	                        width: "100%",
	                        textAlign: "left",
	                        display: "flex",
	                        justifyContent: "space-between",
	                        alignItems: "center",
	                        gap: 10,
	                      }}
	                    >
	                      <span style={{ color: bulkCompanyLabel ? "var(--text)" : "var(--text3)" }}>
	                        {bulkCompanyLabel || "Select company (optional)"}
	                      </span>
	                      <span aria-hidden style={{ color: "var(--text3)" }}>▾</span>
	                    </button>

	                    {bulkCompanyOpen ? (
	                      <div
	                        role="listbox"
	                        aria-label="Company options"
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
	                              ref={bulkCompanySearchRef}
	                              className="form-input"
	                              placeholder="Search company..."
	                              value={bulkCompanySearch}
	                              onChange={(e) => setBulkCompanySearch(e.target.value)}
	                              style={{ paddingLeft: 32 }}
	                            />
	                          </div>

	                          {bulkCompanySearch.trim() ? (
	                            <button
	                              type="button"
	                              className="btn btn-ghost btn-sm"
	                              onClick={() => {
	                                setBulkCompanySearch("");
	                                bulkCompanySearchRef.current?.focus();
	                              }}
	                              style={{ marginTop: 8 }}
	                            >
	                              Clear search
	                            </button>
	                          ) : null}

	                          {bulkCompanyAddCandidate ? (
	                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
	                              <button
	                                type="button"
	                                className="btn btn-ghost btn-sm"
	                                disabled={loading || companyManageBusyKey === `add:${bulkCompanyAddCandidate.key}`}
	                                onClick={() => addCompanyToDropdown(bulkCompanyAddCandidate.name)}
	                              >
	                                Add "{bulkCompanyAddCandidate.name}"
	                              </button>
	                              <span style={{ fontSize: 12, color: "var(--text3)" }}>
	                                Sales/Admin: add company to dropdown.
	                              </span>
	                            </div>
	                          ) : null}

	                          {(companyManageMsg || companyManageError) && (
	                            <div style={{ marginTop: 8, fontSize: 12 }}>
	                              {companyManageMsg ? (
	                                <div style={{ color: "var(--text3)" }}>{companyManageMsg}</div>
	                              ) : null}
	                              {companyManageError ? (
	                                <div style={{ color: "var(--danger)" }}>{companyManageError}</div>
	                              ) : null}
	                            </div>
	                          )}
	                        </div>

	                        <div style={{ maxHeight: 240, overflowY: "auto" }}>
	                          <button
	                            type="button"
	                            role="option"
	                            aria-selected={!bulkCompanyOption}
	                            className="table-link"
	                            onClick={() => {
	                              setBulkCompanyOption("");
	                              setBulkCustomer((p) => ({ ...p, customerCompany: "" }));
	                              setBulkCompanySearch("");
	                              setBulkCompanyOpen(false);
	                            }}
	                            style={{
	                              width: "100%",
	                              padding: "10px 12px",
	                              textAlign: "left",
	                              color: !bulkCompanyOption ? "var(--accent)" : "var(--text)",
	                            }}
	                          >
	                            Select company (optional)
	                          </button>

	                          {bulkFilteredCompanies.map((c) => {
	                            const selected = bulkCompanyOption === c;
	                            return (
	                              <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}>
	                                <button
	                                  type="button"
	                                  role="option"
	                                  aria-selected={selected}
	                                  className="table-link"
	                                  onClick={() => {
	                                    setBulkCompanyOption(c);
	                                    setBulkCustomer((p) => ({ ...p, customerCompany: c }));
	                                    setBulkCompanySearch("");
	                                    setBulkCompanyOpen(false);
	                                  }}
	                                  style={{
	                                    flex: 1,
	                                    padding: "10px 12px",
	                                    textAlign: "left",
	                                    color: selected ? "var(--accent)" : "var(--text)",
	                                  }}
	                                >
	                                  {c}
	                                </button>
	                                {canDeleteCompanyList ? (
	                                  <button
	                                    type="button"
	                                    className="btn btn-ghost btn-sm"
	                                    aria-label={`Delete ${c}`}
	                                    disabled={loading || companyManageBusyKey === `del:${toBrandKey(c)}`}
	                                    onClick={(e) => {
	                                      e.preventDefault();
	                                      e.stopPropagation();
	                                      if (
	                                        typeof window !== "undefined" &&
	                                        !window.confirm(`Delete company "${c}" from dropdown?`)
	                                      )
	                                        return;
	                                      deleteCompanyFromDropdown(c);
	                                    }}
	                                    title="Delete company"
	                                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
	                                  >
	                                    <LuTrash2 aria-hidden />
	                                  </button>
	                                ) : null}
	                              </div>
	                            );
	                          })}

	                          <div style={{ height: 1, background: "var(--border)" }} />

	                          <button
	                            type="button"
	                            role="option"
	                            aria-selected={bulkCompanyOption === OTHER_COMPANY_VALUE}
	                            className="table-link"
	                            onClick={() => {
	                              setBulkCompanyOption(OTHER_COMPANY_VALUE);
	                              setBulkCustomer((p) => ({ ...p, customerCompany: "" }));
	                              setBulkCompanySearch("");
	                              setBulkCompanyOpen(false);
	                            }}
	                            style={{
	                              width: "100%",
	                              padding: "10px 12px",
	                              textAlign: "left",
	                              color: bulkCompanyOption === OTHER_COMPANY_VALUE ? "var(--accent)" : "var(--text)",
	                            }}
	                          >
	                            Others
	                          </button>
	                        </div>
	                      </div>
	                    ) : null}
	                  </div>
	                </div>
	                {bulkCompanyOption === OTHER_COMPANY_VALUE ? (
	                  <div className="form-group full">
	                    <label className="form-label">Other Company</label>
	                    <input
	                      className="form-input"
	                      placeholder="Enter company name"
	                      value={bulkCustomer.customerCompany}
	                      onChange={(e) => setBulkCustomer((p) => ({ ...p, customerCompany: e.target.value }))}
	                      disabled={loading}
	                    />
	                    <div style={{ marginTop: 6, fontSize: 12, color: "var(--text3)" }}>
	                      This company is not in dropdown yet. Sales team can add it later.
	                    </div>
	                    {canManageCompanyList &&
	                    bulkCustomer.customerCompany.trim() &&
	                    !companyKeys.has(toBrandKey(bulkCustomer.customerCompany)) ? (
	                      <button
	                        type="button"
	                        className="btn btn-ghost btn-sm"
	                        disabled={loading || companyManageBusyKey === `add:${toBrandKey(bulkCustomer.customerCompany)}`}
	                        onClick={() => addCompanyToDropdown(bulkCustomer.customerCompany)}
	                        style={{ marginTop: 8 }}
	                      >
	                        Add "{bulkCustomer.customerCompany.trim()}" to dropdown
	                      </button>
	                    ) : null}
	                  </div>
	                ) : null}
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
                  const nav = bulkItemNavState[idx] || { complete: false, partial: false };
                  return (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`btn btn-ghost btn-sm bulk-pill ${active ? "active" : ""} ${
                        nav.complete ? "filled" : nav.partial ? "partial" : ""
                      }`}
                      onClick={() => activateBulkTicket(idx)}
                      disabled={loading}
                      title={`Ticket #${idx + 1}${nav.complete ? " (Filled)" : nav.partial ? " (In progress)" : ""}`}
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
                              {canManageBrandList ? (
                                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                  {bulkBrandAddCandidate ? (
                                    <button
                                      type="button"
                                      className="btn btn-ghost btn-sm"
                                      disabled={loading || brandManageBusyKey === `add:${bulkBrandAddCandidate.key}`}
                                      onClick={() => addBrandToDropdown(bulkBrandAddCandidate.name)}
                                      title="Add typed brand to dropdown"
                                      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                                    >
                                      <LuPlus aria-hidden />
                                      Add "{bulkBrandAddCandidate.name}"
                                    </button>
                                  ) : null}
                                  {brandManageMsg ? (
                                    <span style={{ fontSize: 12, color: "var(--green)" }}>{brandManageMsg}</span>
                                  ) : brandManageError ? (
                                    <span style={{ fontSize: 12, color: "var(--red)" }}>{brandManageError}</span>
                                  ) : (
                                    <span style={{ fontSize: 12, color: "var(--text3)" }}>
                                      Admin: add or delete brands from this dropdown.
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>

                            <div style={{ maxHeight: 240, overflowY: "auto" }}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={!bulkBrandOption}
                                className="table-link"
                                onClick={() => {
                                  setBulkItem(bulkActiveIndex, {
                                    brandOption: "",
                                    modelOption: "",
                                    inverterMake: "",
                                    inverterModel: "",
                                  });
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
                                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}>
                                    <button
                                      type="button"
                                      role="option"
                                      aria-selected={selected}
                                      className="table-link"
                                      onClick={() => {
                                        setBulkItem(bulkActiveIndex, {
                                          brandOption: b,
                                          modelOption: "",
                                          inverterMake: b,
                                          inverterModel: "",
                                        });
                                        setBulkBrandSearch("");
                                        setBulkBrandOpen(false);
                                      }}
                                      style={{
                                        flex: 1,
                                        padding: "10px 12px",
                                        textAlign: "left",
                                        color: selected ? "var(--accent)" : "var(--text)",
                                      }}
                                    >
                                      {b}
                                    </button>
                                    {canManageBrandList ? (
                                      <button
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                        aria-label={`Delete ${b}`}
                                        disabled={loading || brandManageBusyKey === `del:${toBrandKey(b)}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (
                                            typeof window !== "undefined" &&
                                            !window.confirm(`Delete brand \"${b}\" from dropdown?`)
                                          )
                                            return;
                                          deleteBrandFromDropdown(b);
                                        }}
                                        title="Delete brand"
                                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        <LuTrash2 aria-hidden />
                                      </button>
                                    ) : null}
                                  </div>
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
                                    modelOption: "",
                                    inverterMake: "",
                                    inverterModel: "",
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
	                      {bulkModelsForSelectedMake.length ? (
                        <>
	                          <select
	                            className="form-select"
	                            value={
	                              bulkItems[bulkActiveIndex]!.modelOption === OTHER_MODEL_VALUE
	                                ? OTHER_MODEL_VALUE
	                                : bulkItems[bulkActiveIndex]!.inverterModel
	                            }
	                            onChange={(e) => {
	                              const v = e.target.value;
	                              if (v === OTHER_MODEL_VALUE) {
	                                setBulkItem(bulkActiveIndex, { modelOption: OTHER_MODEL_VALUE, inverterModel: "" });
	                                return;
	                              }
	                              setBulkItem(bulkActiveIndex, { modelOption: "", inverterModel: v });
	                            }}
	                            disabled={loading}
	                          >
	                            <option value="">Select model (optional)</option>
	                            {bulkModelsForSelectedMake.map((m) => (
	                              <option key={m} value={m}>
	                                {m}
	                              </option>
	                            ))}
	                            <option value={OTHER_MODEL_VALUE}>Others</option>
	                          </select>
                          {bulkItems[bulkActiveIndex]!.modelOption === OTHER_MODEL_VALUE ? (
                            <div style={{ marginTop: 10 }}>
                              <input
                                className="form-input"
                                placeholder="Enter model name"
                                value={bulkItems[bulkActiveIndex]!.inverterModel}
                                onChange={(e) => {
                                  setModelManageMsg("");
                                  setModelManageError("");
                                  setBulkItem(bulkActiveIndex, { inverterModel: e.target.value });
                                }}
                                disabled={loading}
                              />
                              <div style={{ marginTop: 6, fontSize: 12, color: "var(--text3)" }}>
                                This model is not in dropdown yet. Sales team can add it later.
                              </div>
                              {canManageModelList &&
                              bulkItems[bulkActiveIndex]!.inverterMake.trim() &&
                              bulkItems[bulkActiveIndex]!.inverterModel.trim() &&
                              !bulkModelsForSelectedMake.some(
                                (m) => toBrandKey(m) === toBrandKey(bulkItems[bulkActiveIndex]!.inverterModel),
                              ) ? (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  disabled={
                                    loading ||
                                    modelManageBusyKey ===
                                      `add:${toBrandKey(bulkItems[bulkActiveIndex]!.inverterMake)}:${toBrandKey(
                                        bulkItems[bulkActiveIndex]!.inverterModel,
                                      )}`
                                  }
                                  onClick={() =>
                                    addModelToDropdown(
                                      bulkItems[bulkActiveIndex]!.inverterMake,
                                      bulkItems[bulkActiveIndex]!.inverterModel,
                                    )
                                  }
                                  style={{ marginTop: 8 }}
                                >
                                  Add "{bulkItems[bulkActiveIndex]!.inverterModel.trim()}" to dropdown
                                </button>
                              ) : null}
                              {(modelManageMsg || modelManageError) && (
                                <div style={{ marginTop: 8, fontSize: 12 }}>
                                  {modelManageMsg ? (
                                    <div style={{ color: "var(--text3)" }}>{modelManageMsg}</div>
                                  ) : null}
                                  {modelManageError ? (
                                    <div style={{ color: "var(--red)" }}>{modelManageError}</div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </>
	                      ) : (
	                        <input
	                          className="form-input"
	                          placeholder={modelPlaceholder}
	                          value={bulkItems[bulkActiveIndex]!.inverterModel}
	                          onChange={(e) => setBulkItem(bulkActiveIndex, { inverterModel: e.target.value })}
	                          disabled={loading}
	                        />
	                      )}
	                    </div>
	                    <div className="form-group">
	                      <label className="form-label">Capacity *</label>
	                      <div ref={bulkCapacityWrapRef} style={{ position: "relative" }}>
	                        <button
	                          type="button"
	                          className="form-select"
	                          aria-haspopup="listbox"
	                          aria-expanded={bulkCapacityOpen}
	                          disabled={loading}
	                          onClick={() => setBulkCapacityOpen((v) => !v)}
	                          style={{
	                            width: "100%",
	                            textAlign: "left",
	                            display: "flex",
	                            justifyContent: "space-between",
	                            alignItems: "center",
	                            gap: 10,
	                          }}
	                        >
	                          <span style={{ color: bulkCapacityLabel ? "var(--text)" : "var(--text3)" }}>
	                            {bulkCapacityLabel || "Select capacity *"}
	                          </span>
	                          <span aria-hidden style={{ color: "var(--text3)" }}>▾</span>
	                        </button>

	                        {bulkCapacityOpen ? (
	                          <div
	                            role="listbox"
	                            aria-label="Capacity options"
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
	                                  ref={bulkCapacitySearchRef}
	                                  className="form-input"
	                                  placeholder="Search capacity..."
	                                  value={bulkCapacitySearch}
	                                  onChange={(e) => setBulkCapacitySearch(e.target.value)}
	                                  style={{ paddingLeft: 32 }}
	                                />
	                              </div>

	                              {bulkCapacitySearch.trim() ? (
	                                <button
	                                  type="button"
	                                  className="btn btn-ghost btn-sm"
	                                  onClick={() => {
	                                    setBulkCapacitySearch("");
	                                    bulkCapacitySearchRef.current?.focus();
	                                  }}
	                                  style={{ marginTop: 8 }}
	                                >
	                                  Clear search
	                                </button>
	                              ) : null}

	                              {bulkCapacityAddCandidate ? (
	                                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
	                                  <button
	                                    type="button"
	                                    className="btn btn-ghost btn-sm"
	                                    disabled={loading || capacityManageBusyKey === `add:${bulkCapacityAddCandidate.key}`}
	                                    onClick={() => addCapacityToDropdown(bulkCapacityAddCandidate.name)}
	                                  >
	                                    Add "{bulkCapacityAddCandidate.name}"
	                                  </button>
	                                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
	                                    Sales/Admin: add capacity to dropdown.
	                                  </span>
	                                </div>
	                              ) : null}

	                              {(capacityManageMsg || capacityManageError) && (
	                                <div style={{ marginTop: 8, fontSize: 12 }}>
	                                  {capacityManageMsg ? (
	                                    <div style={{ color: "var(--text3)" }}>{capacityManageMsg}</div>
	                                  ) : null}
	                                  {capacityManageError ? (
	                                    <div style={{ color: "var(--danger)" }}>{capacityManageError}</div>
	                                  ) : null}
	                                </div>
	                              )}
	                            </div>

	                            <div style={{ maxHeight: 240, overflowY: "auto" }}>
	                              <button
	                                type="button"
	                                role="option"
	                                aria-selected={!bulkCapacityOption}
	                                className="table-link"
	                                onClick={() => {
	                                  setBulkItem(bulkActiveIndex, { capacityOption: "", capacity: "" });
	                                  setBulkCapacitySearch("");
	                                  setBulkCapacityOpen(false);
	                                }}
	                                style={{
	                                  width: "100%",
	                                  padding: "10px 12px",
	                                  textAlign: "left",
	                                  color: !bulkCapacityOption ? "var(--accent)" : "var(--text)",
	                                }}
	                              >
	                                Select capacity *
	                              </button>

	                              {bulkCapacitiesForSelectedMake
	                                .filter((c) =>
	                                  String(c).toLowerCase().includes(bulkCapacitySearch.trim().toLowerCase()),
	                                )
	                                .map((c) => {
	                                  const selected = bulkCapacityOption === c;
	                                  return (
	                                    <div
	                                      key={c}
	                                      style={{
	                                        display: "flex",
	                                        alignItems: "center",
	                                        gap: 8,
	                                        paddingRight: 8,
	                                      }}
	                                    >
	                                      <button
	                                        type="button"
	                                        role="option"
	                                        aria-selected={selected}
	                                        className="table-link"
	                                        onClick={() => {
	                                          setBulkItem(bulkActiveIndex, { capacityOption: c, capacity: c });
	                                          setBulkCapacitySearch("");
	                                          setBulkCapacityOpen(false);
	                                        }}
	                                        style={{
	                                          flex: 1,
	                                          padding: "10px 12px",
	                                          textAlign: "left",
	                                          color: selected ? "var(--accent)" : "var(--text)",
	                                        }}
	                                      >
	                                        {c}
	                                      </button>
	                                      {canDeleteCapacityList ? (
	                                        <button
	                                          type="button"
	                                          className="btn btn-ghost btn-sm"
	                                          aria-label={`Delete ${c}`}
	                                          disabled={loading || capacityManageBusyKey === `del:${toBrandKey(c)}`}
	                                          onClick={(e) => {
	                                            e.preventDefault();
	                                            e.stopPropagation();
	                                            if (
	                                              typeof window !== "undefined" &&
	                                              !window.confirm(`Delete capacity "${c}" from dropdown?`)
	                                            )
	                                              return;
	                                            deleteCapacityFromDropdown(c);
	                                          }}
	                                          title="Delete capacity"
	                                          style={{
	                                            display: "inline-flex",
	                                            alignItems: "center",
	                                            justifyContent: "center",
	                                          }}
	                                        >
	                                          <LuTrash2 aria-hidden />
	                                        </button>
	                                      ) : null}
	                                    </div>
	                                  );
	                                })}

	                              <div style={{ height: 1, background: "var(--border)" }} />

	                              <button
	                                type="button"
	                                role="option"
	                                aria-selected={bulkCapacityOption === OTHER_CAPACITY_VALUE}
	                                className="table-link"
	                                onClick={() => {
	                                  setBulkItem(bulkActiveIndex, { capacityOption: OTHER_CAPACITY_VALUE, capacity: "" });
	                                  setBulkCapacitySearch("");
	                                  setBulkCapacityOpen(false);
	                                }}
	                                style={{
	                                  width: "100%",
	                                  padding: "10px 12px",
	                                  textAlign: "left",
	                                  color:
	                                    bulkCapacityOption === OTHER_CAPACITY_VALUE ? "var(--accent)" : "var(--text)",
	                                }}
	                              >
	                                Others
	                              </button>
	                            </div>
	                          </div>
	                        ) : null}
	                      </div>

	                      {bulkCapacityOption === OTHER_CAPACITY_VALUE ? (
	                        <div style={{ marginTop: 10 }}>
	                          <label className="form-label">Other Capacity *</label>
	                          <input
	                            className="form-input"
	                            placeholder="e.g. 50kW"
	                            value={bulkItems[bulkActiveIndex]!.capacity}
	                            onChange={(e) =>
	                              setBulkItem(bulkActiveIndex, { capacity: e.target.value })
	                            }
	                            disabled={loading}
	                          />
	                          <div style={{ marginTop: 6, fontSize: 12, color: "var(--text3)" }}>
	                            This capacity is not in dropdown yet. Sales team can add it later.
	                          </div>
	                          {canManageCapacityList &&
	                          bulkItems[bulkActiveIndex]!.capacity.trim() &&
	                          !capacityKeys.has(toBrandKey(bulkItems[bulkActiveIndex]!.capacity)) ? (
	                            <button
	                              type="button"
	                              className="btn btn-ghost btn-sm"
	                              disabled={
	                                loading ||
	                                capacityManageBusyKey ===
	                                  `add:${toBrandKey(bulkItems[bulkActiveIndex]!.capacity)}`
	                              }
	                              onClick={() => addCapacityToDropdown(bulkItems[bulkActiveIndex]!.capacity)}
	                              style={{ marginTop: 8 }}
	                            >
	                              Add "{bulkItems[bulkActiveIndex]!.capacity.trim()}" to dropdown
	                            </button>
	                          ) : null}
	                        </div>
	                      ) : null}
	                    </div>
                    {!isCustomer ? (
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
                    ) : null}
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
                    {!isCustomer ? (
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
                    ) : null}
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
                ? form.onsiteRepairing
                  ? "Create Offline Booking →"
                  : "Create Ticket →"
                : `Create ${bulkItems.length} Ticket${bulkItems.length === 1 ? "" : "s"} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
