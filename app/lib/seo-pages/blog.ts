import type { BlogPost } from "./types";

const PUBLISHED = "2026-10-20";
// Content calendar — 5 posts per day across 22–26 Oct.
const BATCH_22 = "2026-10-22";
const BATCH_23 = "2026-10-23";
const BATCH_24 = "2026-10-24";
const BATCH_25 = "2026-10-25";
const BATCH_26 = "2026-10-26";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-is-my-solar-inverter-not-working",
    title: "Why Is My Solar Inverter Not Working? 9 Causes & Fixes",
    description:
      "Solar inverter not working or showing no generation? The 9 most common causes, what you can safely check yourself and when to call a technician.",
    h1: "Why Is My Solar Inverter Not Working?",
    datePublished: PUBLISHED,
    readMinutes: 6,
    keywords: ["why is my solar inverter not working", "solar inverter not working", "solar inverter no generation"],
    intro: [
      "A solar inverter that has stopped working is one of the most common calls we receive at Sunce Renewables. The good news: many causes are simple, and some can be checked safely without opening the inverter. Here are the nine causes we see most often, in roughly the order you should rule them out.",
    ],
    sections: [
      {
        heading: "1. A breaker or isolator is switched off",
        paragraphs: [
          "Check the DC isolator next to the inverter and the AC breaker in your ACDB or distribution board. Maintenance staff, electricians or a tripped MCB often leave one of them off.",
        ],
      },
      {
        heading: "2. There is no grid supply (on-grid inverters)",
        paragraphs: [
          "On-grid inverters are designed to shut down when the grid fails. This is a safety feature called anti-islanding, not a fault. Generation resumes a few minutes after the grid returns.",
        ],
      },
      {
        heading: "3. Grid voltage is too high",
        paragraphs: [
          "If your site is at the end of a long feeder, grid voltage can exceed the inverter's limit around midday, causing it to disconnect repeatedly. The display usually shows a grid over-voltage error. This needs a check of the AC cable size and a discussion with the DISCOM — not an inverter replacement.",
        ],
      },
      {
        heading: "4. Isolation or earth fault on the DC side",
        paragraphs: [
          "Damaged DC cables, water in a junction box or a burnt MC4 connector reduce insulation resistance. The inverter refuses to start, especially on humid mornings, and shows an isolation or ISO error.",
        ],
      },
      { heading: "5. Overheating", paragraphs: ["Inverters in direct sun or with failed fans derate or shut down to protect themselves. If it stops in the afternoon and restarts in the evening, heat is a likely cause."] },
      { heading: "6. Blown fuses or a failed relay", paragraphs: ["String fuses, internal fuses and grid relays fail with age. A relay check failure error points directly at this."] },
      { heading: "7. Failed auxiliary power supply", paragraphs: ["If the display is completely blank even with good DC voltage in daylight, the inverter's internal power supply (SMPS) may have failed."] },
      { heading: "8. Control or power board failure", paragraphs: ["Lightning, surges and age can damage the control board or IGBT power stage. These need PCB-level repair in a workshop."] },
      { heading: "9. Configuration or firmware problems", paragraphs: ["Wrong grid code, country settings or a failed firmware update can stop an inverter from connecting. This is common on hybrid inverters."] },
      {
        heading: "What you can safely do",
        bullets: [
          "Note down the exact error code or take a photo of the display",
          "Check the AC breaker and DC isolator positions",
          "Check whether the grid supply is available",
          "Look at the monitoring app for when generation stopped",
          "Do not open the inverter or disconnect DC cables under load — solar DC voltage is dangerous",
        ],
      },
    ],
    faqs: [
      { q: "Why does my inverter show no generation even when it is sunny?", a: "The inverter may be disconnected from the grid, have an isolation fault, or have tripped on high grid voltage. Check the display for an error code first." },
    ],
    relatedServices: ["solar-inverter-troubleshooting", "on-grid-solar-inverter-repair"],
  },
  {
    slug: "common-solar-inverter-problems-and-solutions",
    title: "Common Solar Inverter Problems and Solutions",
    description:
      "The most common solar inverter problems — error codes, overheating, tripping, battery charging and low efficiency — and practical solutions from repair experts.",
    h1: "Common Solar Inverter Problems and Solutions",
    datePublished: PUBLISHED,
    readMinutes: 7,
    keywords: ["common solar inverter problems and solutions", "solar inverter problems", "solar inverter faults"],
    intro: [
      "Every solar inverter brand has its own error codes, but the underlying problems are remarkably similar. Here are the issues our technicians see most often across Growatt, Solis, Sungrow, GoodWe, Huawei, SMA, Luminous and other inverters — and how each one is solved.",
    ],
    sections: [
      { heading: "Problem: Grid voltage or frequency errors", paragraphs: ["Solution: Measure the grid voltage at the inverter terminals during peak generation. Undersized or long AC cables raise the voltage seen by the inverter. Upgrading the cable, tightening terminations or adjusting settings within permitted limits usually fixes it. If the grid is normal, the inverter's sensing circuit or relay may need repair."] },
      { heading: "Problem: Isolation / insulation fault", paragraphs: ["Solution: Test the insulation resistance of each string to find the faulty one, then inspect its cables, connectors and junction boxes for damage or water ingress."] },
      { heading: "Problem: Overheating and derating", paragraphs: ["Solution: Clean heat sinks and fans, replace failed fans, and shade the inverter or move it out of direct sun with proper ventilation clearance."] },
      { heading: "Problem: Frequent tripping", paragraphs: ["Solution: Check whether it is the inverter tripping or the AC breaker. Undersized breakers, loose connections and earth leakage are frequent causes."] },
      { heading: "Problem: Battery not charging (off-grid / hybrid)", paragraphs: ["Solution: Verify battery health and settings, check fuses and solar input, then test the charge controller and MOSFETs."] },
      { heading: "Problem: Display not working", paragraphs: ["Solution: If the inverter still generates, it is likely a display board or cable fault. If it does not, the auxiliary supply may have failed."] },
      { heading: "Problem: Low efficiency / low generation", paragraphs: ["Solution: Compare string-wise currents. One weak string often reveals shading, dirty panels, a failed connector or an MPPT fault."] },
      { heading: "Problem: Monitoring offline", paragraphs: ["Solution: Usually a Wi-Fi password change, router issue or failed data logger — not an inverter failure."] },
    ],
    relatedServices: ["solar-inverter-troubleshooting", "solar-inverter-pcb-repair"],
  },
  {
    slug: "signs-your-solar-inverter-needs-repair",
    title: "7 Signs Your Solar Inverter Needs Repair",
    description:
      "7 warning signs your solar inverter needs repair — error lights, noise, falling generation — and how to act before a small fault becomes a costly breakdown.",
    h1: "7 Signs Your Solar Inverter Needs Repair",
    datePublished: PUBLISHED,
    readMinutes: 5,
    keywords: ["signs your solar inverter needs repair", "solar inverter warning signs"],
    intro: ["Inverters rarely fail without warning. Catching these signs early usually means a cheaper repair and less lost generation."],
    sections: [
      {
        heading: "Warning signs to look for",
        bullets: [
          "Red fault LED or recurring error codes on the display",
          "Generation falling month on month compared with last year",
          "Inverter shutting down in the afternoon heat",
          "Unusual buzzing, clicking or fan noise",
          "Burning smell or discoloured terminals",
          "Inverter starting late in the morning or switching off early",
          "Monitoring data showing gaps or one MPPT producing much less",
        ],
      },
      {
        heading: "What to do next",
        paragraphs: [
          "Record the error codes and dates, compare generation with the same month last year, and get the inverter inspected. A preventive inspection costs far less than a breakdown repair after a power-stage failure.",
        ],
      },
    ],
    relatedServices: ["solar-inverter-maintenance-amc", "solar-inverter-troubleshooting"],
  },
  {
    slug: "solar-inverter-repair-cost",
    title: "How Much Does Solar Inverter Repair Cost in India?",
    description:
      "What decides solar inverter repair cost and repair charges in India — fault type, capacity, parts and on-site vs workshop repair — and how to avoid overpaying.",
    h1: "How Much Does Solar Inverter Repair Cost?",
    datePublished: PUBLISHED,
    readMinutes: 6,
    keywords: ["how much does solar inverter repair cost", "solar inverter repair cost", "solar inverter repair charges", "affordable solar inverter repair"],
    intro: [
      "There is no single price for solar inverter repair, because a loose connection and a failed IGBT power stage are very different jobs. What we can do is explain what drives the cost, so you can judge any estimate you receive.",
    ],
    sections: [
      {
        heading: "What affects solar inverter repair charges",
        bullets: [
          "Type of fault — fan, fuse or relay replacement costs far less than power-stage or control board repair",
          "Inverter capacity — larger three phase and central inverters use costlier components",
          "Parts availability — imported or discontinued parts cost more and take longer",
          "On-site vs workshop repair — transport and technician visits add cost",
          "Extent of damage — lightning or water damage often affects several boards",
        ],
      },
      {
        heading: "Repair is usually cheaper than replacement",
        paragraphs: [
          "For most faults, component-level repair costs a fraction of a new inverter. Replacement only makes sense when damage is severe or the repair cost approaches the price of a new unit.",
        ],
      },
      {
        heading: "How to avoid overpaying",
        bullets: [
          "Ask for diagnosis before any part is replaced",
          "Get a written estimate that lists the parts and labour",
          "Ask whether the repair carries a warranty",
          "Consider an AMC if you have several inverters — it reduces breakdown costs",
        ],
      },
      {
        heading: "Get an estimate",
        paragraphs: [
          "Share your inverter brand, model, capacity and error code with Sunce Renewables on +91-9540263987. We give a transparent estimate after diagnosis, before starting any repair.",
        ],
      },
    ],
    faqs: [
      { q: "Is solar inverter repair worth it?", a: "In most cases, yes. Component-level repair typically costs much less than a new inverter and restores generation quickly." },
    ],
    relatedServices: ["solar-inverter-replacement", "solar-inverter-pcb-repair"],
  },
  {
    slug: "how-to-maintain-a-solar-inverter",
    title: "How to Maintain a Solar Inverter: Owner's Guide",
    description:
      "Practical guide to solar inverter maintenance for owners — placement, cleaning, monitoring, safety and when to call a professional for preventive maintenance.",
    h1: "How to Maintain a Solar Inverter",
    datePublished: PUBLISHED,
    readMinutes: 5,
    keywords: ["how to maintain a solar inverter", "solar inverter maintenance"],
    intro: ["Solar inverters don't need daily attention, but a few simple habits add years to their life. This guide covers what owners can do themselves and what should be left to a technician."],
    sections: [
      {
        heading: "What owners can do",
        bullets: [
          "Keep the inverter shaded and well ventilated — never box it in",
          "Keep the area around it dry and free of dust, leaves and stored items",
          "Check the monitoring app weekly for drops in generation or error alerts",
          "Wipe dust off the outer casing and vents with a dry cloth (inverter switched off)",
          "Keep a log of error codes and dates",
        ],
      },
      {
        heading: "What a technician should do",
        bullets: [
          "Tighten AC and DC terminations and check for heat damage",
          "Clean internal heat sinks and replace worn fans",
          "Test insulation resistance and earthing",
          "Review event logs and firmware",
          "Run a performance comparison against expected generation",
        ],
      },
    ],
    relatedServices: ["solar-inverter-maintenance-amc"],
  },
  {
    slug: "how-to-troubleshoot-solar-inverter-errors",
    title: "How to Troubleshoot Solar Inverter Errors",
    description:
      "A step-by-step method to troubleshoot solar inverter error codes — grid, isolation, temperature and DC errors — safely, before calling a repair technician.",
    h1: "How to Troubleshoot Solar Inverter Errors",
    datePublished: PUBLISHED,
    readMinutes: 6,
    keywords: ["how to troubleshoot solar inverter errors", "solar inverter error code repair", "solar inverter error codes"],
    intro: ["Error codes differ between brands, but they fall into a handful of groups. Identifying the group tells you whether the problem is the grid, the solar array, the environment or the inverter itself."],
    sections: [
      { heading: "Step 1: Record the exact error", paragraphs: ["Note the code, the time it appears and whether it clears on its own. Check the inverter manual or app for the description."] },
      { heading: "Step 2: Identify the error group", bullets: ["Grid errors — voltage, frequency, no grid, anti-islanding", "DC / array errors — isolation, PV over-voltage, reverse polarity, string faults", "Temperature errors — over-temperature, fan fault", "Internal errors — relay check, DC bus, DSP, communication between boards"] },
      { heading: "Step 3: Check the obvious", paragraphs: ["For grid errors, confirm the grid is present and stable. For DC errors after rain, wait for panels to dry — if the error persists, a cable or connector is likely damaged. For temperature errors, check ventilation and fan noise."] },
      { heading: "Step 4: Restart correctly", paragraphs: ["Switch off AC first, then DC, wait five minutes, then switch DC on followed by AC (or as per the manufacturer's manual). If an internal error returns immediately after restart, the inverter needs repair."] },
      { heading: "Step 5: Call a technician for internal errors", paragraphs: ["Relay, DC bus, DSP and hardware errors require test equipment and PCB-level skills. Don't keep resetting the inverter — repeated restarts on a damaged power stage can cause further damage."] },
    ],
    relatedServices: ["solar-inverter-troubleshooting"],
  },
  {
    slug: "on-grid-vs-off-grid-solar-inverter",
    title: "On-Grid vs Off-Grid vs Hybrid Solar Inverter",
    description:
      "On-grid vs off-grid solar inverter — how they work, cost, backup, net metering and maintenance differences, plus where a hybrid inverter fits.",
    h1: "On-Grid vs Off-Grid Solar Inverter: Which Is Right for You?",
    datePublished: PUBLISHED,
    readMinutes: 6,
    keywords: ["on grid vs off grid solar inverter", "hybrid solar inverter", "grid tie inverter"],
    intro: ["The inverter type decides whether you get backup during power cuts, whether you can use net metering and how much maintenance the system needs."],
    sections: [
      { heading: "On-grid (grid-tie) inverters", paragraphs: ["Convert solar DC to AC and feed it to your loads and the grid. No batteries, lowest cost, net metering possible. They shut down during power cuts for safety."] },
      { heading: "Off-grid inverters", paragraphs: ["Work with batteries and do not export to the grid. They provide backup and suit areas with poor grid supply, but batteries add cost and need replacement every few years."] },
      { heading: "Hybrid inverters", paragraphs: ["Combine both: export to the grid and backup from batteries. They are the most flexible and the most complex to configure and repair."] },
      { heading: "Maintenance differences", bullets: ["On-grid: grid-voltage tripping and isolation faults are the most common issues", "Off-grid: battery charging problems and low-voltage cut-offs dominate", "Hybrid: BMS communication and configuration faults are common"] },
    ],
    relatedServices: ["on-grid-solar-inverter-repair", "off-grid-solar-inverter-repair", "hybrid-solar-inverter-repair"],
  },
  {
    slug: "when-to-replace-a-solar-inverter",
    title: "When to Replace a Solar Inverter: 6 Clear Signals",
    description:
      "When should you replace a solar inverter instead of repairing it? Six clear signals — age, damage, parts, efficiency and capacity — from repair experts.",
    h1: "When to Replace a Solar Inverter",
    datePublished: PUBLISHED,
    readMinutes: 4,
    keywords: ["when to replace a solar inverter", "solar inverter replacement"],
    intro: ["Most inverter faults are repairable. But there are situations where replacement is the smarter investment. Here are the signals we use when advising customers."],
    sections: [
      {
        heading: "Replace the inverter when…",
        bullets: [
          "The repair estimate is close to the price of a new inverter",
          "The inverter is badly fire, flood or lightning damaged across several boards",
          "Parts are no longer available and no equivalent exists",
          "It has failed repeatedly in a short period despite proper repairs",
          "Its efficiency is far below modern inverters and your plant is large enough for the difference to matter",
          "You are expanding your plant and need more capacity anyway",
        ],
      },
      { heading: "Otherwise, repair first", paragraphs: ["If none of these apply, repair is almost always better value. A repaired old inverter can also be kept as a standby after you upgrade."] },
    ],
    relatedServices: ["solar-inverter-replacement"],
  },
  {
    slug: "how-long-does-a-solar-inverter-last",
    title: "How Long Does a Solar Inverter Last?",
    description:
      "How long a solar inverter lasts, what shortens inverter life in Indian conditions, and how maintenance and timely repair can extend it.",
    h1: "How Long Does a Solar Inverter Last?",
    datePublished: PUBLISHED,
    readMinutes: 4,
    keywords: ["how long does a solar inverter last", "solar inverter life"],
    intro: ["Solar panels often carry 25-year performance warranties, but inverters usually have shorter lives — commonly in the range of 10 to 15 years for string inverters, depending on quality, design and site conditions. That means most plants will need inverter repair or replacement at least once."],
    sections: [
      { heading: "What shortens inverter life in India", bullets: ["High ambient temperatures and direct sun exposure", "Dust clogging fans and heat sinks", "Grid voltage fluctuations and surges", "Lightning without proper surge protection", "Humidity and water ingress during monsoon", "Poor installation — loose terminals, undersized cables"] },
      { heading: "How to extend inverter life", bullets: ["Install in a shaded, ventilated location", "Schedule preventive maintenance", "Replace fans and ageing capacitors before they fail", "Use proper earthing and surge protection", "Repair faults early instead of running with errors"] },
    ],
    relatedServices: ["solar-inverter-maintenance-amc", "solar-inverter-pcb-repair"],
  },
  {
    slug: "solar-inverter-maintenance-checklist",
    title: "Solar Inverter Maintenance Checklist (Monthly, Quarterly, Yearly)",
    description:
      "A practical solar inverter maintenance checklist — monthly, quarterly and yearly tasks for rooftop and commercial solar plants.",
    h1: "Solar Inverter Maintenance Checklist",
    datePublished: PUBLISHED,
    readMinutes: 4,
    keywords: ["solar inverter maintenance checklist", "solar inverter preventive maintenance"],
    intro: ["Use this checklist to plan routine care. Monthly items can be done by the owner or facility team; quarterly and yearly items should be done by a qualified solar technician."],
    sections: [
      { heading: "Monthly", bullets: ["Review generation versus the same month last year", "Check the display and app for error codes", "Make sure vents are clear and the area is dry", "Listen for abnormal fan or relay noise"] },
      { heading: "Quarterly", bullets: ["Clean external vents, fans and filters", "Inspect DC and AC cables and MC4 connectors for heat damage", "Check string-wise currents for imbalance", "Verify monitoring and data logging"] },
      { heading: "Yearly", bullets: ["Torque check of all terminations", "Insulation resistance and earthing tests", "Thermal imaging of inverter and DC/AC boxes", "Internal cleaning and fan replacement if worn", "Firmware review and full service report"] },
    ],
    relatedServices: ["solar-inverter-maintenance-amc", "solar-plant-operation-maintenance"],
  },
  {
    slug: "reasons-for-solar-inverter-failure",
    title: "8 Reasons for Solar Inverter Failure",
    description:
      "Why solar inverters fail — heat, dust, surges, moisture, poor installation, ageing components and more — and how to prevent each cause.",
    h1: "8 Reasons for Solar Inverter Failure",
    datePublished: PUBLISHED,
    readMinutes: 5,
    keywords: ["reasons for solar inverter failure", "why solar inverters fail"],
    intro: ["After repairing inverters from hundreds of plants, we see the same root causes again and again. Most are preventable."],
    sections: [
      { heading: "1. Heat", paragraphs: ["Electronic component life drops sharply at high temperatures. Inverters in direct sun or enclosed rooms age fastest."] },
      { heading: "2. Dust", paragraphs: ["Dust clogs heat sinks and fans, raising internal temperature."] },
      { heading: "3. Voltage surges and lightning", paragraphs: ["Without proper SPDs and earthing, surges damage input stages and communication boards."] },
      { heading: "4. Moisture", paragraphs: ["Water ingress and condensation cause isolation faults and corrosion on PCBs."] },
      { heading: "5. Poor installation", paragraphs: ["Loose terminals, undersized cables and wrong string design cause overheating and stress."] },
      { heading: "6. Ageing capacitors and fans", paragraphs: ["Electrolytic capacitors and fans are wear parts that need timely replacement."] },
      { heading: "7. Grid instability", paragraphs: ["Frequent high voltage and fluctuations stress relays and power stages."] },
      { heading: "8. Ignored early faults", paragraphs: ["Running an inverter with recurring errors often turns a small fault into a major failure."] },
    ],
    relatedServices: ["solar-inverter-pcb-repair", "solar-inverter-maintenance-amc"],
  },
  {
    slug: "how-to-improve-solar-inverter-performance",
    title: "How to Improve Solar Inverter Performance",
    description:
      "Simple, proven ways to improve solar inverter performance and generation — cooling, cleaning, string balance, settings and monitoring.",
    h1: "How to Improve Solar Inverter Performance",
    datePublished: PUBLISHED,
    readMinutes: 5,
    keywords: ["how to improve solar inverter performance", "solar inverter efficiency problems"],
    intro: ["Small losses at the inverter add up over a 25-year plant life. These steps help your inverter convert more of your panels' energy."],
    sections: [
      { heading: "Keep the inverter cool", paragraphs: ["Inverters derate output when hot. Shade, ventilation and clean fans keep it at full power during peak hours."] },
      { heading: "Keep panels clean", paragraphs: ["Dirty panels reduce input power. In dusty regions, regular cleaning has a direct impact on generation."] },
      { heading: "Balance strings and MPPTs", paragraphs: ["Mismatched strings on one MPPT reduce output. Check string currents and re-arrange if needed."] },
      { heading: "Fix AC voltage rise", paragraphs: ["High AC voltage causes the inverter to throttle or trip. Correct cable sizing helps."] },
      { heading: "Use monitoring", paragraphs: ["String-level and inverter-level monitoring catches under-performance early."] },
      { heading: "Keep firmware and settings correct", paragraphs: ["Correct grid codes and up-to-date firmware avoid unnecessary disconnects."] },
    ],
    relatedServices: ["scada-solar-monitoring", "solar-inverter-testing-commissioning"],
  },
  {
    slug: "solar-inverter-repair-vs-replacement",
    title: "Solar Inverter Repair vs Replacement: Cost & Decision Guide",
    description:
      "Solar inverter repair vs replacement — compare cost, downtime, warranty, efficiency and risk to decide what's best for your solar system.",
    h1: "Solar Inverter Repair vs Replacement",
    datePublished: PUBLISHED,
    readMinutes: 5,
    keywords: ["solar inverter repair vs replacement", "repair or replace solar inverter"],
    intro: ["When an inverter fails, the decision is financial as much as technical. Compare the two options on these factors."],
    sections: [
      { heading: "Cost", paragraphs: ["Repair usually costs a fraction of a new inverter. Replacement includes the new unit, installation and commissioning."] },
      { heading: "Downtime", paragraphs: ["Simple repairs restore generation quickly. Repairs needing imported parts may take longer than buying a replacement off the shelf — ask for timelines on both."] },
      { heading: "Warranty", paragraphs: ["A new inverter carries a fresh manufacturer warranty; repairs carry a service warranty on the work done."] },
      { heading: "Efficiency", paragraphs: ["Modern inverters can be slightly more efficient, which matters for large plants with long remaining life."] },
      { heading: "A simple rule", paragraphs: ["If the repair cost is well below a new inverter and the unit is otherwise healthy, repair. If the inverter is old, badly damaged or repeatedly failing, replace — and consider keeping the repaired old unit as a spare."] },
    ],
    relatedServices: ["solar-inverter-replacement", "solar-inverter-pcb-repair"],
  },
  {
    slug: "benefits-of-regular-solar-inverter-maintenance",
    title: "Benefits of Regular Solar Inverter Maintenance",
    description:
      "Why regular solar inverter maintenance pays — fewer breakdowns, more generation, longer inverter life, safer operation and better ROI.",
    h1: "Benefits of Regular Solar Inverter Maintenance",
    datePublished: PUBLISHED,
    readMinutes: 4,
    keywords: ["benefits of regular solar inverter maintenance", "solar inverter AMC benefits"],
    intro: ["Preventive maintenance is often skipped because the inverter seems to be working fine. Here is what regular maintenance actually delivers."],
    sections: [
      {
        heading: "The benefits",
        bullets: [
          "Fewer unplanned breakdowns and less lost generation",
          "Longer inverter life by controlling heat, dust and loose connections",
          "Higher energy yield and plant performance ratio",
          "Safer operation — early detection of overheating terminals and earth faults",
          "Lower lifetime repair cost",
          "Service records that support warranty and insurance claims",
          "Predictable maintenance budgets through an AMC",
        ],
      },
      { heading: "Making it easy", paragraphs: ["A solar inverter AMC puts maintenance on a schedule so nothing is forgotten, and gives you priority support when a fault does occur."] },
    ],
    relatedServices: ["solar-inverter-maintenance-amc", "solar-plant-operation-maintenance"],
  },
  {
    slug: "how-to-repair-a-solar-inverter",
    title: "How to Repair a Solar Inverter: What Owners Should Know",
    description:
      "How solar inverter repair is done — safe checks owners can do, how technicians diagnose and repair faults, and why DIY internal repair is dangerous.",
    h1: "How to Repair a Solar Inverter",
    datePublished: PUBLISHED,
    readMinutes: 6,
    keywords: ["how to repair a solar inverter", "solar inverter repair guide"],
    intro: [
      "Solar inverters handle hundreds of volts DC from panels and stored energy in large capacitors, even after switching off. Internal repair is not a DIY job. But understanding how professional repair works helps you take the right first steps and judge the service you receive.",
    ],
    sections: [
      { heading: "Safe first steps for owners", bullets: ["Record the error code and take a photo of the display", "Check AC breaker, DC isolator and grid supply", "Try one correct restart as per the manual", "Check the monitoring app for when the fault started", "Call a technician if the error returns"] },
      { heading: "How technicians diagnose", paragraphs: ["A technician reviews logs, measures string voltages and insulation resistance, checks grid parameters and inspects the inverter for heat damage. This identifies whether the fault is external (wiring, grid, panels) or internal."] },
      { heading: "How internal repairs are done", bullets: ["Safe discharge of DC link capacitors", "Board-level inspection for burnt components and tracks", "Bench testing of power supplies, drivers and power stages", "Replacement of failed components with correctly rated parts", "Load testing and burn-in before re-installation"] },
      { heading: "Why DIY internal repair is risky", paragraphs: ["Beyond the shock risk, incorrect parts or poor soldering can cause fire or repeat failure and may void warranties. Use an experienced solar inverter repair company."] },
    ],
    relatedServices: ["solar-inverter-pcb-repair", "solar-inverter-troubleshooting"],
  },
  {
    slug: "solar-inverter-repair-in-noida-guide",
    title: "How to Choose a Solar Inverter Repair Service in Noida",
    description:
      "How to choose a reliable solar inverter repair service in Noida — questions to ask, red flags to avoid and how genuine component-level repair works.",
    h1: "How to Choose a Solar Inverter Repair Service in Noida",
    datePublished: BATCH_22,
    readMinutes: 6,
    keywords: [
      "how to choose solar inverter repair service",
      "questions to ask solar inverter technician",
      "solar inverter repair red flags",
    ],
    intro: [
      "Noida has hundreds of rooftop solar systems across Sector 62, 63, 137, Greater Noida West and the industrial areas — and when an inverter stops working, most owners face the same problem: who do you call? This guide explains how to judge a solar inverter repair service in Noida before you hand over your inverter.",
    ],
    sections: [
      {
        heading: "What to check before choosing a repair service",
        bullets: [
          "Do they repair at component (PCB) level, or only swap whole boards?",
          "Do they service your inverter's brand and model?",
          "Do they give a written estimate after diagnosis, before repair?",
          "Do they have a workshop, not just field technicians?",
          "Do they handle out-of-warranty and discontinued inverters?",
          "Are there genuine customer reviews with local addresses?",
        ],
      },
      {
        heading: "Red flags to avoid",
        paragraphs: [
          "Anyone who quotes a fixed price over the phone without seeing the fault, refuses to explain what failed, or pushes you straight to buying a new inverter is usually not doing you a favour. A trustworthy service diagnoses first, explains the fault in plain language, then shares the cost of repair.",
        ],
      },
      {
        heading: "Why a local Noida workshop matters",
        paragraphs: [
          "For simple faults a technician can fix things on site. But PCB-level failures — burnt power stages, dead power supplies, damaged control boards — need bench testing equipment that only a workshop has. A repair company with its own workshop in Noida can diagnose properly, test the repaired board under load before re-installation, and give you a warranty on the repair itself.",
        ],
      },
      {
        heading: "Questions worth asking on the first call",
        bullets: [
          "What is the diagnosis charge, and is it adjusted against the repair?",
          "How long will the repair take?",
          "What warranty do you give on the repair?",
          "Will you share what actually failed, with photos?",
          "Do you handle AMC if I have more than one inverter?",
        ],
      },
      {
        heading: "How Sunce Renewables works",
        paragraphs: [
          "We are based at Sector 63A, Noida, with our own repair workshop. Share your inverter brand, model and error code on call or WhatsApp — we first narrow the fault remotely, then either fix it on site or bring it to the workshop for component-level repair. You always get an estimate before any repair starts, and a warranty on the work done.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does solar inverter repair cost in Noida?",
        a: "It depends on the fault. Simple fan or fuse replacement costs little; power-stage or control board repair costs more but is still far cheaper than a new inverter. A good service shares the estimate after diagnosis.",
      },
      {
        q: "Do you collect the inverter from my location in Noida?",
        a: "Yes. For workshop-level repairs we arrange pickup across Noida, Greater Noida and Ghaziabad, and return the inverter after testing.",
      },
    ],
    relatedServices: ["solar-inverter-troubleshooting", "solar-inverter-maintenance-amc"],
    relatedLinks: [{ label: "Solar Inverter Repair in Noida", href: "/solar-inverter-repair/noida" }],
  },
  {
    slug: "solar-inverter-amc-cost-india",
    title: "Solar Inverter AMC Cost in India: What's Included & Is It Worth It?",
    description:
      "What decides solar inverter AMC cost in India, what a good AMC includes, and how to judge whether an annual maintenance contract is worth it.",
    h1: "Solar Inverter AMC Cost in India",
    datePublished: BATCH_22,
    readMinutes: 5,
    keywords: [
      "solar inverter AMC cost",
      "solar inverter annual maintenance contract cost",
      "solar AMC charges india",
      "solar inverter maintenance plan",
    ],
    intro: [
      "An annual maintenance contract (AMC) keeps your solar inverter serviced on a schedule and gives you priority support when something fails. But AMC pricing is rarely published, and what is actually covered varies enormously. Here is how AMC cost is decided and what you should insist on.",
    ],
    sections: [
      {
        heading: "What drives AMC cost",
        bullets: [
          "Number and capacity of inverters at the site",
          "Whether it is a comprehensive AMC (all parts included) or a non-comprehensive one (only labour and visit)",
          "Inverter brand and whether spares are easily available",
          "Site accessibility and how many visits per year are planned",
          "Response time commitment you expect",
        ],
      },
      {
        heading: "Comprehensive vs non-comprehensive AMC",
        paragraphs: [
          "A comprehensive AMC covers scheduled visits plus replacement of most parts, and costs more. A non-comprehensive AMC covers inspection, cleaning and labour only — parts are billed separately. For a single healthy residential inverter, a non-comprehensive plan usually gives the best value. For a commercial plant with several inverters and costly downtime, a comprehensive plan removes surprise bills.",
        ],
      },
      {
        heading: "Signs a good AMC is worth the money",
        bullets: [
          "Your plant has more than one inverter or is business-critical",
          "The site is dusty or exposed and has a history of faults",
          "You have no in-house team to check generation data regularly",
          "Downtime directly costs you money or savings",
        ],
      },
      {
        heading: "Questions to ask before signing",
        bullets: [
          "How many preventive visits are included?",
          "Are cleaning, torque checks and insulation testing included?",
          "What is the response time for a breakdown?",
          "Are replacement parts included or billed separately?",
          "Is there a discount if I bundle panel cleaning or O&M?",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a solar inverter AMC worth it?",
        a: "For a single small inverter with no fault history, yearly preventive maintenance may be enough. For commercial plants, multi-inverter sites or dusty environments, an AMC usually pays for itself by preventing breakdowns.",
      },
      {
        q: "How often should an inverter be serviced under an AMC?",
        a: "Most AMCs include one or two preventive visits a year. Dusty or industrial sites benefit from quarterly attention.",
      },
    ],
    relatedServices: ["solar-inverter-maintenance-amc", "solar-plant-operation-maintenance"],
  },
  {
    slug: "growatt-solar-inverter-common-errors",
    title: "Growatt Solar Inverter Common Errors & What They Mean",
    description:
      "Growatt inverter showing an error? What common Growatt faults mean — no AC connection, PV isolation low, residual current — and what to check first.",
    h1: "Growatt Solar Inverter Common Errors",
    datePublished: BATCH_22,
    readMinutes: 6,
    keywords: [
      "growatt inverter error code",
      "growatt inverter fault",
      "growatt inverter not working",
      "growatt inverter repair",
    ],
    intro: [
      "Growatt is one of the most widely installed inverter brands in India, and its fault messages are a frequent search. Exact codes and wording vary across models and firmware (MIN, MID, MOD, SPH), so always check your model's manual — but the messages fall into a few clear groups. Identifying the group tells you whether the problem is the grid, the solar array, the environment or the inverter itself.",
    ],
    sections: [
      {
        heading: "Common Growatt error groups",
        bullets: [
          "No AC Connection / AC V Outrange / AC F Outrange — the grid is absent, or its voltage or frequency is outside the inverter's limits.",
          "PV Isolation Low — insulation resistance on the DC (panel) side is too low, usually due to moisture or damaged cabling.",
          "Over-temperature warnings — the inverter is too hot and has derated or shut down.",
          "Residual I High — residual (leakage) current fault, often caused by moisture or damaged DC cabling.",
          "Numbered \"Error\" codes (for example relay or internal faults) — usually an internal hardware problem that needs a technician.",
          "Monitoring offline — the Wi-Fi / ShineLink dongle has lost connection to the inverter or the router.",
        ],
      },
      {
        heading: "What to check first, safely",
        bullets: [
          "Is the grid supply present and stable?",
          "Are the AC breaker and DC isolator both ON?",
          "Did the error start after rain, cleaning or recent work on the site?",
          "Is the inverter in direct sun with blocked ventilation?",
          "Note the exact code and time it appears before restarting anything.",
        ],
      },
      {
        heading: "When it needs a technician",
        paragraphs: [
          "If the same Growatt error returns immediately after a correct restart, the fault is internal — relay, power supply, control board or power stage. Do not keep resetting: repeated restarts on a damaged power stage can turn a repairable fault into a total failure.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why does my Growatt inverter keep showing a grid fault?",
        a: "Usually the grid voltage is outside the inverter's acceptable range — common at the far end of a feeder in the afternoon. If the grid reads normal at the terminals and the error persists, the inverter's relay or sensing circuit needs checking.",
      },
      {
        q: "Can a Growatt isolation fault be fixed?",
        a: "Yes. It is usually caused by damaged DC cable, water in a junction box or a failed MC4 connector. Finding and repairing the specific string resolves it.",
      },
    ],
    relatedServices: ["solar-inverter-troubleshooting", "solar-inverter-pcb-repair"],
  },
  {
    slug: "monsoon-problems-for-solar-inverters",
    title: "Monsoon Problems for Solar Inverters in India — Protection Guide",
    description:
      "How the monsoon affects solar inverters in India — moisture, isolation faults, lightning surges — and the checks that prevent monsoon breakdowns.",
    h1: "Monsoon Problems for Solar Inverters",
    datePublished: BATCH_22,
    readMinutes: 5,
    keywords: [
      "monsoon solar inverter problems",
      "solar inverter water damage",
      "solar inverter isolation fault rain",
      "lightning damage solar inverter",
    ],
    intro: [
      "Every year, just after the first heavy rains, solar inverter faults spike. Moisture, humidity and lightning account for a large share of the breakdowns we see during the monsoon season. Most of them are preventable with a few simple checks.",
    ],
    sections: [
      {
        heading: "How rain damages inverters",
        bullets: [
          "Water entering junction boxes and DC connectors lowers insulation resistance, causing isolation faults",
          "Humidity causes condensation and corrosion on PCBs over time",
          "Lightning and grid surges damage input stages and communication boards",
          "Wet dust becomes conductive and clogs vents and heat sinks",
        ],
      },
      {
        heading: "Pre-monsoon checks worth doing",
        bullets: [
          "Inspect the inverter's mounting shade and cable entries for gaps",
          "Check that junction boxes and connectors are properly sealed",
          "Verify earthing and surge protection devices are working",
          "Clear drainage paths so water does not pool near the inverter",
          "Check insulation resistance before the rains if the plant is large",
        ],
      },
      {
        heading: "After heavy rain — what to do",
        paragraphs: [
          "If your inverter shows an isolation or residual current error after rain, do not keep restarting it. Let panels and cabling dry, then a technician should test insulation resistance string by string to find the exact point of moisture ingress and seal it properly.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a solar inverter safe in the rain?",
        a: "A properly installed inverter with correct IP rating, sealed cable entries and good earthing handles normal rain safely. Problems come from poor installation, damaged seals and missing surge protection.",
      },
    ],
    relatedServices: ["solar-inverter-maintenance-amc", "solar-inverter-troubleshooting"],
  },
  {
    slug: "solar-inverter-warranty-what-is-covered",
    title: "Solar Inverter Warranty: What's Covered and What Voids It",
    description:
      "What a standard solar inverter warranty covers, what voids it, the difference between product and performance warranty, and what to do once it expires.",
    h1: "Solar Inverter Warranty Explained",
    datePublished: BATCH_22,
    readMinutes: 5,
    keywords: [
      "solar inverter warranty",
      "solar inverter warranty period",
      "out of warranty solar inverter repair",
      "does solar inverter warranty void",
    ],
    intro: [
      "Most string inverters in India carry a standard 5-year product warranty, extendable to 10 or 20 years on many brands. But the warranty only protects you if you understand what it covers — and what can void it.",
    ],
    sections: [
      {
        heading: "Product vs performance warranty",
        bullets: [
          "Product warranty covers defects and failures of the inverter itself",
          "Performance warranty guarantees minimum conversion efficiency over the years",
          "Extensions usually add to the product warranty, sometimes at extra cost at time of purchase",
        ],
      },
      {
        heading: "What typically voids a warranty",
        bullets: [
          "Opening the inverter or breaking the manufacturer's seal",
          "Repair by an unauthorised party",
          "Incorrect installation — wrong earthing, undersized cables, unstable grid",
          "Damage from lightning or surges where surge protection was not provided",
          "Using the inverter outside its rated conditions",
        ],
      },
      {
        heading: "Once the warranty ends",
        paragraphs: [
          "Out-of-warranty is where independent repair makes the biggest difference. Component-level repair of the failed board costs a fraction of a new inverter and gets your plant generating again quickly — the same work is often not offered by the manufacturer's service channel once the unit is out of warranty.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can an out-of-warranty solar inverter be repaired?",
        a: "Yes, and it is usually very economical. Component-level repair restores the inverter at a fraction of replacement cost, even for models with no spare parts available.",
      },
    ],
    relatedServices: ["solar-inverter-replacement", "solar-inverter-pcb-repair"],
  },
  {
    slug: "how-to-reduce-solar-inverter-downtime",
    title: "How to Reduce Solar Inverter Downtime in Commercial Plants",
    description:
      "Practical ways to cut solar inverter downtime in commercial and industrial plants — standby units, monitoring, spares strategy and root-cause analysis.",
    h1: "Reducing Solar Inverter Downtime",
    datePublished: BATCH_23,
    readMinutes: 5,
    keywords: [
      "solar inverter downtime",
      "solar plant uptime",
      "commercial solar inverter maintenance",
      "solar plant availability",
    ],
    intro: [
      "In a commercial or industrial solar plant, a single failed inverter can mean thousands of units of lost generation every week. Here is how plant owners keep downtime low.",
    ],
    sections: [
      {
        heading: "Strategies that work",
        bullets: [
          "Remote monitoring with alerts, so a fault is spotted the same day — not at month end",
          "A repaired standby unit for plants with several identical inverters",
          "A small spares kit of fuses, fans, connectors and communication dongles on site",
          "Root-cause analysis of repeat failures instead of repeated resets",
          "Scheduled preventive maintenance before peak generation season",
        ],
      },
      {
        heading: "Why repeat failures happen",
        paragraphs: [
          "If the same inverter fails again within months, the fault was never fully diagnosed — or an external cause (grid voltage, cabling, earthing) was never fixed. Replacing parts without finding the root cause just delays the next breakdown.",
        ],
      },
      {
        heading: "How Sunce helps commercial plants",
        paragraphs: [
          "For C&I plants we combine SCADA and string-level monitoring with AMC plans, so under-performance and faults are flagged early. Repaired units are load-tested before re-installation, and we analyse failures across the fleet to fix the cause, not just the symptom.",
        ],
      },
    ],
    relatedServices: ["commercial-industrial-solar-inverter-repair", "scada-solar-monitoring"],
  },
  {
    slug: "how-a-solar-inverter-works",
    title: "How a Solar Inverter Works (Explained Simply)",
    description:
      "How does a solar inverter work? A simple explanation of DC to AC conversion, MPPT, grid synchronisation and why the inverter is the brain of your solar plant.",
    h1: "How a Solar Inverter Works",
    datePublished: BATCH_23,
    readMinutes: 6,
    keywords: ["how solar inverter works", "solar inverter working principle", "dc to ac conversion solar"],
    intro: [
      "Solar panels produce DC (direct current) electricity, but your home and the grid run on AC (alternating current). The solar inverter is the device in between — and it does far more than convert. It is the brain of your entire solar system.",
    ],
    sections: [
      {
        heading: "Step 1: Converting DC to AC",
        paragraphs: [
          "Panels send DC power to the inverter. Using high-speed switching electronics (IGBTs and MOSFETs), the inverter turns it into clean AC electricity at the same voltage and frequency as the grid — 230V, 50Hz in India — so it can run your appliances directly.",
        ],
      },
      {
        heading: "Step 2: MPPT — extracting maximum power",
        paragraphs: [
          "Panel output changes with sunlight, temperature and shade. The inverter's MPPT (Maximum Power Point Tracking) continuously adjusts the operating voltage so it always pulls the maximum possible power from the panels, even in partial shade or on cloudy days.",
        ],
      },
      {
        heading: "Step 3: Grid synchronisation & safety",
        paragraphs: [
          "Before exporting power, the inverter matches the grid's voltage, frequency and phase exactly. It also constantly monitors the grid — if the grid fails, voltage goes out of range or frequency drifts, the inverter shuts down within milliseconds (anti-islanding) to protect line workers.",
        ],
      },
      {
        heading: "Step 4: Monitoring & reporting",
        paragraphs: [
          "Every few seconds the inverter logs generation, voltage, current and temperature, then sends the data to your monitoring app. This is why most 'solar inverter not working' complaints are first noticed in the app — the monitoring is doing its job.",
        ],
      },
      {
        heading: "Why this matters for repairs",
        bullets: [
          "Any of these four functions failing = a fault — conversion, MPPT, grid sync or monitoring",
          "Grid-related faults (voltage/frequency) are often site issues, not inverter defects",
          "MPPT and power-stage problems need component-level PCB repair",
          "Firmware/software issues can often be fixed without opening the inverter",
        ],
      },
    ],
    faqs: [
      {
        q: "Can a solar inverter work without a battery?",
        a: "Yes. On-grid (string) inverters work without batteries — they feed power directly to your loads and the grid. Batteries are only needed for off-grid or hybrid systems.",
      },
      {
        q: "Does a solar inverter work at night?",
        a: "No. There is no solar input at night, so an on-grid inverter stays off. Your home draws from the grid (or from batteries in a hybrid system).",
      },
    ],
    relatedServices: ["solar-inverter-troubleshooting", "on-grid-solar-inverter-repair"],
  },
  {
    slug: "solar-inverter-lights-and-display-symbols",
    title: "Solar Inverter Lights & Display Symbols Explained",
    description:
      "Solar inverter showing a red, green or flashing light? What green, red, yellow and blinking indicators mean on a solar inverter, and when each one needs a technician.",
    h1: "Solar Inverter Lights & Display Symbols Explained",
    datePublished: BATCH_23,
    readMinutes: 5,
    keywords: ["solar inverter light meaning", "solar inverter red light", "solar inverter green light blinking", "solar inverter display symbols"],
    intro: [
      "Most solar inverter faults are first spotted as a coloured light, long before anything stops working. Here is what the common indicators mean — and which ones can wait, and which ones cannot.",
    ],
    sections: [
      {
        heading: "The common indicator colours",
        bullets: [
          "Solid green — normal operation, converting power",
          "Blinking green — starting up, or normal in some models during data communication",
          "Solid yellow/orange — warning: derated, waiting on grid, or a non-critical alert",
          "Solid red — fault: the inverter has stopped or restricted output",
          "Flashing red — active fault needing prompt attention",
          "No light at all — no DC input, no AC supply, or an internal power failure",
        ],
      },
      {
        heading: "What each type of indicator usually points to",
        paragraphs: [
          "Green then red at startup usually means a grid or insulation check failed. Red appearing only at midday suggests high grid voltage or overheating. A completely dark display with good sunshine points to a blown fuse, failed auxiliary supply or a tripped isolator rather than a panel problem.",
        ],
      },
      {
        heading: "What to do before calling",
        bullets: [
          "Note the exact colour and whether it flashes (count the pattern)",
          "Take a photo of the display showing any error code",
          "Check the AC breaker and DC isolator are ON",
          "Check the app — when did generation stop?",
          "Do not open the inverter under any circumstances",
        ],
      },
    ],
    faqs: [
      {
        q: "My inverter light is red but power is still flowing — is that okay?",
        a: "Some inverters run on reduced output while showing a warning. A persistent red light means an active fault — it should be diagnosed even if generation continues, because it usually precedes a shutdown.",
      },
    ],
    relatedServices: ["solar-inverter-troubleshooting"],
  },
  {
    slug: "why-is-my-solar-inverter-beeping",
    title: "Why Is My Solar Inverter Beeping? Alarm Reasons & Fixes",
    description:
      "Solar inverter beeping or buzzing? Why inverters beep — alarms, fault alerts, fan noise and loose parts — what each sound means and when it needs a repair.",
    h1: "Why Is My Solar Inverter Beeping?",
    datePublished: BATCH_23,
    readMinutes: 4,
    keywords: ["solar inverter beeping", "solar inverter alarm sound", "solar inverter buzzing noise", "solar inverter sound"],
    intro: [
      "A beeping solar inverter is trying to tell you something. Sometimes it is a simple notification — export limits, a grid event, or a scheduled self-test — and sometimes it is a fault alarm. The pattern and timing of the sound tells you which.",
    ],
    sections: [
      {
        heading: "Common reasons a solar inverter beeps",
        bullets: [
          "Fault alarm — usually a repeating beep with a red light or error code",
          "Grid event — a short beep when the grid drops out or returns",
          "Relay clicking — a normal tick at startup and shutdown, not a fault",
          "Over-temperature warning — beeps when the unit is too hot",
          "Low export / zero-export notification — common in plants with export control",
          "Battery alarms (hybrid/off-grid) — low battery or BMS communication issues",
        ],
      },
      {
        heading: "Non-sounding noises that get mistaken for beeps",
        paragraphs: [
          "A high-pitched whine can be the cooling fan or, in some cases, magnetostriction in the transformer under load. A loud buzz that grows over months usually means a failing fan bearing or a loose component — both worth checking before they become a shutdown.",
        ],
      },
      {
        heading: "When to call a technician",
        bullets: [
          "The beeping repeats and the inverter has stopped generating",
          "An error code appears with the alarm",
          "The sound comes from inside and is getting louder",
          "Beeping is accompanied by a burning smell or discoloured terminals — switch off and call immediately",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a single beep when the grid comes back normal?",
        a: "Yes. Most inverters click or beep briefly when they reconnect to the grid after an outage. It is normal behaviour, not a fault.",
      },
    ],
    relatedServices: ["solar-inverter-troubleshooting", "solar-inverter-maintenance-amc"],
  },
  {
    slug: "how-to-check-if-solar-panels-are-working",
    title: "How to Check If Your Solar Panels Are Working",
    description:
      "Simple ways to check if your solar panels are working — reading the inverter, comparing generation, visual checks and tests that separate panel faults from inverter faults.",
    h1: "How to Check If Your Solar Panels Are Working",
    datePublished: BATCH_23,
    readMinutes: 5,
    keywords: ["how to check solar panels are working", "solar panel test", "solar panels not working", "check solar generation"],
    intro: [
      "Low electricity savings can come from the panels, the inverter or the wiring — and telling them apart early saves a wasted technician visit. These checks need no tools and take five minutes.",
    ],
    sections: [
      {
        heading: "1. Read your inverter",
        bullets: [
          "Is the display green and showing current power in kW?",
          "At midday, is the output close to your system's expected capacity?",
          "Open the monitoring app — does generation start in the morning and peak around noon?",
        ],
      },
      {
        heading: "2. Compare with what you expect",
        paragraphs: [
          "A rough rule in North India: a 1 kW system produces 4–5 units per day on a clear day (less in monsoon and winter). If a 5 kW plant is giving 8 units instead of the usual 20+, something has changed — and comparing string-wise data in the app usually shows which string dropped.",
        ],
      },
      {
        heading: "3. Visual checks (from the ground)",
        bullets: [
          "Broken, cracked or bird-dropped panels",
          "Heavy dust, bird droppings or leaf cover",
          "Shade from a new tree, water tank or building",
          "Burnt or hanging cables near the DC box",
        ],
      },
      {
        heading: "4. Knowing which side the fault is on",
        paragraphs: [
          "Inverter green but output low = panel/string side (dirt, shade, damaged panel, loose MC4 connector). Inverter red or dark = inverter side (grid, fuse, internal fault). Inverter normal but app offline = communication side only — generation may still be fine.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I test solar panels with a multimeter?",
        a: "A technician can check open-circuit voltage (Voc) and short-circuit current (Isc) per string with a multimeter to find the weak string. We do this during troubleshooting as standard.",
      },
      {
        q: "Do solar panels work on cloudy days?",
        a: "Yes, at reduced output — typically 10–25% of rated capacity. Very low output on cloudy days is normal and not a fault.",
      },
    ],
    relatedServices: ["solar-panel-repair", "solar-inverter-testing-commissioning"],
  },
  {
    slug: "solar-panels-not-generating-electricity",
    title: "Solar Panels Not Generating Electricity? 8 Reasons",
    description:
      "Solar panels not producing power? The 8 most common causes — grid supply, tripped breaker, isolation fault, shade, dirt, panel damage, wiring and inverter failure.",
    h1: "Solar Panels Not Generating Electricity",
    datePublished: BATCH_24,
    readMinutes: 6,
    keywords: ["solar panels not generating electricity", "solar system not working", "solar power not coming", "solar not generating"],
    intro: [
      "When the savings stop and the inverter shows zero, the cause is usually one of a handful of things. Work through these in order — most can be ruled out in a few minutes without opening anything.",
    ],
    sections: [
      {
        heading: "1. No grid supply",
        paragraphs: [
          "On-grid inverters switch off when the grid fails (anti-islanding). If there is a power cut or the grid voltage is out of range, the inverter waits. Check whether the grid is present before suspecting the solar system.",
        ],
      },
      {
        heading: "2. A breaker or isolator is off",
        paragraphs: [
          "The AC breaker in the ACDB and the DC isolator next to the inverter are the two most common culprits — often tripped during cleaning, maintenance or a minor fault elsewhere.",
        ],
      },
      {
        heading: "3. Isolation or earth fault on the DC side",
        paragraphs: [
          "Water in a junction box, damaged DC cable or a burnt MC4 connector drops insulation resistance below the inverter's limit and it refuses to start — classically on humid mornings.",
        ],
      },
      {
        heading: "4. Grid voltage too high",
        paragraphs: [
          "At midday, inverter export raises the local voltage. If it crosses the inverter's upper limit, generation is throttled or shut down. This shows as grid over-voltage and is a site/wiring issue, not an inverter defect.",
        ],
      },
      {
        heading: "5–8. The remaining causes",
        bullets: [
          "Heavy shade or dirt — output falls, sometimes to near zero",
          "Damaged or cracked panels — one string can drag the whole array down",
          "Blown string fuse or failed MC4 connector — that string goes silent",
          "Internal inverter fault — display shows a red code or stays blank",
        ],
      },
      {
        heading: "Safe checks you can do yourself",
        bullets: [
          "Confirm grid supply is present",
          "Check AC breaker and DC isolator are ON",
          "Note any error code on the display or app",
          "Compare string currents in the monitoring app if available",
          "Do not open the inverter or DC box — DC from panels is live even when the inverter is off",
        ],
      },
    ],
    faqs: [
      {
        q: "Solar panels are fine but no power in the meter — what now?",
        a: "If the inverter shows generation but your import meter doesn't show export, the issue is usually net metering configuration or CT direction — an electrician or we can verify it.",
      },
      {
        q: "Does rain stop solar generation?",
        a: "Heavy rain reduces output but rarely to zero. Generation usually returns as clouds pass — and rain often cleans panels, improving output afterwards.",
      },
    ],
    relatedServices: ["solar-inverter-troubleshooting", "solar-panel-repair"],
  },
  {
    slug: "rooftop-solar-subsidy-india-guide",
    title: "Rooftop Solar Subsidy in India: How to Claim It (2026 Guide)",
    description:
      "How to claim rooftop solar subsidy in India under PM Surya Ghar — eligibility, per-kW subsidy amounts, installer rules, net metering and the step-by-step process.",
    h1: "Rooftop Solar Subsidy in India Guide",
    datePublished: BATCH_24,
    readMinutes: 7,
    keywords: ["rooftop solar subsidy india", "pm surya ghar subsidy", "solar subsidy up", "solar panel subsidy kaise le"],
    intro: [
      "Central subsidy is the biggest reason rooftop solar has taken off in Indian homes. The process itself is straightforward if you follow it in the right order — most rejections happen because people install before registering.",
    ],
    sections: [
      {
        heading: "How much subsidy is available",
        bullets: [
          "Residential households: subsidy per kW for systems up to 3 kW under the PM Surya Ghar scheme (amounts are revised — check the current rate on pmsuryaghar.gov.in)",
          "The subsidy is capped for larger systems above 3 kW",
          "Only grid-connected systems with a valid net meter qualify",
          "The subsidy is paid directly to your bank account, not to the installer",
        ],
      },
      {
        heading: "Golden rules before you install",
        bullets: [
          "Register on the national portal BEFORE installation — installations before registration are not eligible",
          "Use a registered/approved vendor in your state",
          "Your electricity connection must be in your name",
          "Apply for the net meter at the same time as the plant",
        ],
      },
      {
        heading: "Step-by-step process",
        bullets: [
          "1. Register on the PM Surya Ghar portal with your discom/consumer number",
          "2. Get a technical feasibility approval from your discom",
          "3. Install through an approved vendor",
          "4. Apply for net metering after installation",
          "5. Get the plant commissioned and inspection done",
          "6. Upload documents and commissioning certificate on the portal",
          "7. Subsidy is credited to your registered bank account",
        ],
      },
      {
        heading: "Common mistakes that delay the subsidy",
        paragraphs: [
          "Installing before registering, mismatched names on the connection and application, missing the commissioning certificate, or choosing an installer who has not completed previous projects on the portal. Choose the installer carefully — they handle most of the portal work.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is subsidy available for commercial installations?",
        a: "No. The PM Surya Ghar residential subsidy applies to households. Commercial and industrial plants are evaluated on payback and policy benefits instead.",
      },
      {
        q: "Can I claim subsidy on a 10-year-old solar plant?",
        a: "No. Subsidy applies to new grid-connected rooftop systems registered under the current scheme, not to existing plants.",
      },
    ],
    relatedServices: ["solar-plant-operation-maintenance", "solar-inverter-testing-commissioning"],
  },
  {
    slug: "net-metering-process-uttar-pradesh-delhi",
    title: "Net Metering Process for Rooftop Solar (UP & Delhi)",
    description:
      "How net metering works for rooftop solar in Uttar Pradesh and Delhi — application steps, meter import/export readings, billing and how it affects your savings.",
    h1: "Net Metering Process for Rooftop Solar",
    datePublished: BATCH_24,
    readMinutes: 6,
    keywords: ["net metering process", "net metering uttar pradesh", "net metering delhi", "solar net meter kaise lagta hai"],
    intro: [
      "Net metering is what turns your rooftop solar into real savings — every unit you export to the grid is credited against the units you import later. Here is how the process works in UP and Delhi, and what actually determines your bill.",
    ],
    sections: [
      {
        heading: "How net metering works",
        paragraphs: [
          "A bi-directional meter records both import (grid → home) and export (home → grid). Your bill is calculated on net consumption over the billing period, usually at a prescribed rate or adjusted unit-for-unit, as per your discom's rules.",
        ],
      },
      {
        heading: "Application process",
        bullets: [
          "Apply to your discom (PVUVNL / MGVCL in UP, BSES / TPDDL in Delhi) with plant details",
          "Technical feasibility approval — they check your connection capacity and local transformer headroom",
          "Install the plant through a registered vendor",
          "Install the net meter after discom inspection/approval",
          "Commissioning and meter sealing",
        ],
      },
      {
        heading: "What affects your actual savings",
        bullets: [
          "Self-consumption ratio — using power when the sun shines gives the best return",
          "Export credit rate vs your slab rate — many discoms credit at a lower rate than the highest slab",
          "Billing period alignment — summer generation exports offset winter imports",
          "Plant size vs your daytime load — oversizing lowers the value of exported units",
        ],
      },
      {
        heading: "How the inverter affects net metering",
        paragraphs: [
          "Grid voltage rise caused by export is the single most common reason for inverter tripping in net-metered homes, especially at the end of long feeders. If your inverter shuts down at midday with a grid over-voltage code, the wiring and cable sizing — not the meter — should be checked first.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I export unlimited power?",
        a: "Discoms cap sanctioned load or plant capacity for export. Your plant size is approved against your connection, and export beyond the approved capacity is not permitted.",
      },
      {
        q: "Do I need net metering for on-grid solar?",
        a: "For exporting power and receiving credit, yes. Without a net meter, your system works in zero-export mode or only offsets daytime self-consumption.",
      },
    ],
    relatedServices: ["on-grid-solar-inverter-repair", "solar-inverter-testing-commissioning"],
  },
  {
    slug: "solar-roi-payback-period-india",
    title: "Solar ROI & Payback Period in India (2026)",
    description:
      "How to calculate solar ROI and payback period for a rooftop plant in India — cost per kW, units generated, tariff assumptions and what shortens the payback.",
    h1: "Solar ROI & Payback Period in India",
    datePublished: BATCH_24,
    readMinutes: 6,
    keywords: ["solar roi india", "solar payback period", "solar savings calculation", "rooftop solar cost benefit"],
    intro: [
      "Every solar buyer asks the same question: how many years to recover the cost? The honest answer depends on four numbers — system cost, generation, your tariff, and how well the plant is maintained over those years.",
    ],
    sections: [
      {
        heading: "The basic calculation",
        paragraphs: [
          "Payback = total plant cost ÷ annual savings. Annual savings = units generated per year × the rate you would otherwise pay. A 5 kW system in North India generates roughly 7,000–8,000 units a year; at an average tariff of ₹8–10 per unit, annual savings are substantial and typical payback lands in the 4–6 year range.",
        ],
      },
      {
        heading: "Four factors that change your payback",
        bullets: [
          "Tariff — higher slabs and commercial tariffs shorten payback sharply",
          "Generation — orientation, shade and cleaning directly affect units",
          "Subsidy — reduces initial cost for residential systems",
          "Plant health — an unmaintained plant loses 10–20% output yearly",
        ],
      },
      {
        heading: "The maintenance factor nobody counts",
        paragraphs: [
          "A plant that loses generation to a failing inverter, dusty panels or a dead string has a payback that quietly stretches by years. A working inverter and regular cleaning are not an expense — they are the difference between a 5-year and an 8-year payback.",
        ],
      },
      {
        heading: "After payback",
        bullets: [
          "Electricity is effectively free for the remaining 15–20 years of panel life",
          "Well-maintained inverters last 10–15 years — budget one inverter replacement",
          "Net metering credits continue to offset night-time and monsoon consumption",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the typical payback for a commercial plant in India?",
        a: "Commercial plants with high daytime load usually see 3–5 year payback, because they self-consume most of the generation at slab rates above ₹8.",
      },
      {
        q: "Does a solar inverter failure affect ROI?",
        a: "Directly — a stopped inverter means zero generation until repaired. That is why fast repair and AMC are part of protecting your solar ROI, not separate from it.",
      },
    ],
    relatedServices: ["solar-plant-operation-maintenance", "solar-inverter-maintenance-amc"],
  },
  {
    slug: "solar-plant-earthing-and-lightning-protection",
    title: "Solar Plant Earthing & Lightning Protection Guide",
    description:
      "Why proper earthing and lightning protection matter for solar plants — types of earthing, SPD selection, resistance values and how surges destroy inverters.",
    h1: "Solar Plant Earthing & Lightning Protection",
    datePublished: BATCH_24,
    readMinutes: 6,
    keywords: ["solar plant earthing", "lightning protection solar", "spd for solar", "earth fault solar inverter"],
    intro: [
      "A surprising share of the inverter boards we repair are damaged by surges that proper earthing and SPDs would have stopped. Earthing is invisible until it fails — and when it fails, it is expensive.",
    ],
    sections: [
      {
        heading: "Three earthings a solar plant needs",
        bullets: [
          "Panel/frame earthing — the module mounting structure",
          "DC side earthing — DCDB, negative conductor as per design",
          "AC side earthing — inverter AC output, neutral earthing at the LT panel",
        ],
      },
      {
        heading: "Surge protection (SPD)",
        paragraphs: [
          "Type 1+2 SPDs at the DC and AC terminals divert lightning and grid surge energy away from the inverter. Without them, a nearby strike or grid switching surge reaches the input stage and control boards directly — one of the fastest ways to destroy an otherwise healthy inverter.",
        ],
      },
      {
        heading: "Earth resistance values to aim for",
        bullets: [
          "Lightning arrester earth: typically ≤ 10 Ω (as per IS/IEC and LA design)",
          "Protective/panel earthing: ≤ 5 Ω commonly specified for solar plants",
          "Values rise in dry, rocky or sandy soil — pit maintenance and watering matter",
        ],
      },
      {
        heading: "Warning signs of earthing problems",
        bullets: [
          "Recurring isolation/earth fault codes on the inverter",
          "RCD/ELCB tripping repeatedly",
          "Tingling on metal structures",
          "Corroded or loose earth strips and pits",
          "Repeated surge-related board failures",
        ],
      },
    ],
    faqs: [
      {
        q: "Does earthing cause the inverter to trip?",
        a: "Poor or incorrect earthing causes real earth leakage, which trips the inverter or RCD. Correct earthing stops nuisance tripping and protects the electronics.",
      },
      {
        q: "How often should earth pits be tested?",
        a: "Before monsoon annually, and after any electrical fault or lightning event. Resistance readings should be recorded each time.",
      },
    ],
    relatedServices: ["solar-plant-operation-maintenance", "solar-inverter-troubleshooting"],
  },
  {
    slug: "solar-inverter-installation-mistakes",
    title: "7 Solar Inverter Installation Mistakes That Cause Failures",
    description:
      "The most common solar inverter installation mistakes — wrong location, undersized cables, poor ventilation, bad earthing — that lead to early failures and tripping.",
    h1: "7 Solar Inverter Installation Mistakes",
    datePublished: BATCH_25,
    readMinutes: 6,
    keywords: ["solar inverter installation mistakes", "solar inverter installation guidelines", "where to install solar inverter", "solar installation errors"],
    intro: [
      "A large number of 'inverter faults' we attend are actually installation problems that could have been avoided. These seven mistakes account for most repeat failures — and most are cheap to fix if caught early.",
    ],
    sections: [
      {
        heading: "1. Installing the inverter in direct sun",
        paragraphs: [
          "Inverters derate or shut down when hot. Direct afternoon sun on the unit in North India pushes internal temperature well above design — the inverter quietly loses output exactly when generation should peak.",
        ],
      },
      {
        heading: "2. Enclosing or boxing the inverter",
        paragraphs: ["Wall niches, glass cabinets and tight cupboards trap heat. An inverter needs clear ventilation clearance on all sides as specified by the manufacturer."]},
      { heading: "3. Undersized AC/DC cables", paragraphs: ["Long or thin AC cables raise voltage at the inverter terminals — causing over-voltage trips at midday. Undersized DC cables cause losses and heating at terminations."] },
      { heading: "4. Weak or missing earthing & SPD", paragraphs: ["Poor earthing causes isolation faults and RCD tripping; missing SPDs let surges destroy input boards during lightning or grid events."] },
      { heading: "5. Bad cable entry / no drip protection", paragraphs: ["Open cable glands and unprotected joints let rainwater and humidity into the DC box — the classic cause of monsoon isolation faults."] },
      { heading: "6. Loose terminations", paragraphs: ["Thermal cycling loosens terminals over months. Loose DC/AC connections heat up, discolour and eventually burn — visible in thermal scans long before failure."] },
      { heading: "7. No commissioning verification", paragraphs: ["Skipping string-wise Voc/Isc recording, insulation test, grid parameter check and protection settings means faults are found later, under load, expensively."] },
      {
        heading: "Getting it right the first time",
        bullets: [
          "Shaded, ventilated, weather-protected location",
          "Correct cable sizing for length and current",
          "Tested earthing with recorded resistance and SPDs installed",
          "Torqued terminations and proper cable entries",
          "Full commissioning report with string and protection data",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I move an inverter that was installed in the sun?",
        a: "Yes, and it is often worth it. Relocating to a shaded, ventilated position reduces derating and heat-related failures significantly.",
      },
    ],
    relatedServices: ["solar-inverter-testing-commissioning", "solar-inverter-maintenance-amc"],
  },
  {
    slug: "can-i-run-ac-on-solar-inverter",
    title: "Can I Run an AC on Solar? What It Takes in India",
    description:
      "Can you run an air conditioner on solar inverter? What AC tonnage needs how many kW of solar, on-grid vs off-grid sizing, and how to avoid overloading your inverter.",
    h1: "Can I Run an AC on Solar?",
    datePublished: BATCH_25,
    readMinutes: 5,
    keywords: ["run ac on solar", "solar for ac india", "how much solar to run ac", "solar inverter for ac"],
    intro: [
      "Yes — running an AC on solar is completely practical in India, and it is one of the smartest uses of solar because AC load and sunshine peak at the same time. The only question is sizing: how much solar and which inverter your AC needs.",
    ],
    sections: [
      {
        heading: "How much solar does an AC need?",
        bullets: [
          "1 ton AC ≈ 1.2–1.5 kW of solar capacity (running load roughly 1–1.3 kW)",
          "1.5 ton ≈ 2–2.5 kW",
          "2 ton ≈ 2.5–3 kW",
          "Always add headroom — compressors draw extra current at startup",
        ],
      },
      {
        heading: "On-grid vs off-grid for AC",
        paragraphs: [
          "On-grid: your inverter supplies the AC while the sun shines and imports the rest from the grid — the simplest and cheapest way to cut AC bills. Off-grid: you need batteries sized for the AC's running current and hours of backup, which costs significantly more. Hybrid gives you both.",
        ],
      },
      {
        heading: "Inverter capacity matters",
        paragraphs: [
          "The solar inverter must handle the AC's startup surge, not just its running load. An undersized or ageing inverter trips the moment the compressor kicks in. If that happens only when the AC starts, the inverter capacity or its relay stage is the first thing to check — not the panels.",
        ],
      },
      {
        heading: "Getting the best results",
        bullets: [
          "Use the AC during peak sunshine hours — that is when it is effectively free",
          "Keep the inverter shaded and ventilated; heat derates it exactly when you need full output",
          "For frequent power cuts, choose a hybrid inverter with battery backup",
          "Get a load calculation done before buying panels or an inverter",
        ],
      },
    ],
    faqs: [
      {
        q: "Can a 3kW solar system run a 1.5 ton AC?",
        a: "During peak sunshine, yes — with some grid import depending on the AC's load and your other appliances. A 3kW system comfortably offsets a 1.5 ton AC used in the afternoon.",
      },
      {
        q: "Why does my inverter trip when the AC starts?",
        a: "The compressor's startup surge exceeds the inverter's capacity or its relay/power stage is weak. A technician can confirm whether it is a sizing issue or an inverter fault needing repair.",
      },
    ],
    relatedServices: ["on-grid-solar-inverter-repair", "hybrid-solar-inverter-repair"],
  },
  {
    slug: "best-solar-inverter-brands-in-india",
    title: "Best Solar Inverter Brands in India (Comparison Guide)",
    description:
      "A practical comparison of the best solar inverter brands in India — Growatt, Solis, Sungrow, GoodWe, Huawei, Luminous and more — reliability, service and what suits your plant.",
    h1: "Best Solar Inverter Brands in India",
    datePublished: BATCH_25,
    readMinutes: 6,
    keywords: ["best solar inverter brands india", "solar inverter comparison", "which solar inverter to buy", "top inverter brands india"],
    intro: [
      "There is no single 'best' inverter — the right brand depends on your plant size, whether you need batteries, and how good the local service network is. Here is how the major brands compare in real Indian conditions.",
    ],
    sections: [
      {
        heading: "The main players in India",
        bullets: [
          "Growatt — very popular for residential and small commercial; feature-rich app, competitive pricing",
          "Solis (Ginlong) — reliable string inverters, strong service network",
          "Sungrow — global leader, common in commercial and utility projects",
          "GoodWe — solid residential and C&I range, good hybrid options",
          "Huawei — smart features and efficiency, more common in larger plants",
          "Luminous, Microtek, Sukam — strong in off-grid and home inverter segments",
          "SMA, Fronius, ABB, Delta, Schneider — premium and older installed base",
        ],
      },
      {
        heading: "What actually matters when choosing",
        bullets: [
          "Local service availability — a great inverter with a 3-week repair turnaround is a bad deal",
          "Spare parts availability out of warranty",
          "Monitoring app quality and Wi-Fi reliability",
          "Warranty length and how claims are handled",
          "Efficiency and features you will actually use",
        ],
      },
      {
        heading: "The out-of-warranty reality",
        paragraphs: [
          "Every brand's inverter eventually needs repair — and after warranty, manufacturer channels often quote replacement instead of repair. This is where independent component-level repair makes the difference: same inverter, working again, at a fraction of new-unit cost. That is true for every brand on this list.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which solar inverter is most reliable in India?",
        a: "All major brands are reliable when correctly sized and installed with proper earthing and ventilation. Reliability drops far more with installation quality and site conditions than with brand choice.",
      },
      {
        q: "Do you repair all these brands?",
        a: "Yes — we repair all major brands at component level, including out-of-warranty and discontinued models.",
      },
    ],
    relatedServices: ["solar-inverter-troubleshooting", "solar-inverter-pcb-repair"],
  },
  {
    slug: "why-solar-inverter-shuts-down-at-noon",
    title: "Why Your Solar Inverter Shuts Down at Noon (and Evening)",
    description:
      "Solar inverter stops working at midday or in the afternoon? The most common reasons — grid over-voltage, overheating, export limits — and how each one is fixed.",
    h1: "Why Your Solar Inverter Shuts Down at Noon",
    datePublished: BATCH_25,
    readMinutes: 5,
    keywords: ["solar inverter stops at noon", "solar inverter shuts down afternoon", "inverter trips at midday", "solar inverter over voltage"],
    intro: [
      "A pattern we see every summer: the inverter runs fine in the morning, stops around midday, and sometimes comes back in the evening. Generation is lost exactly when it should be highest — and the cause is almost always one of three things.",
    ],
    sections: [
      {
        heading: "1. Grid voltage too high (the most common cause)",
        paragraphs: [
          "When your inverter exports power, it pushes local voltage up. At midday, with maximum generation, voltage can cross the inverter's upper limit (often 250V+), so the inverter disconnects to protect itself. It shows a grid over-voltage code. Undersized or long AC cables make it worse.",
        ],
        bullets: [
          "Fix: measure voltage at the inverter terminals at midday",
          "Check AC cable sizing and terminations",
          "Adjust voltage settings within permitted limits where allowed",
          "In persistent cases, discuss feeder voltage with your DISCOM",
        ],
      },
      {
        heading: "2. Overheating / derating",
        paragraphs: [
          "Direct sun, blocked vents or a failing cooling fan push internal temperature up. The inverter limits output (derates) or shuts down to protect itself — classically in the afternoon heat. A shaded, ventilated position and clean fans usually solve it.",
        ],
      },
      {
        heading: "3. Export limit / zero-export settings",
        paragraphs: [
          "Plants with export control throttle at midday by design when household consumption is low. If shutdown matches your load profile rather than heat, check the zero-export configuration first.",
        ],
      },
      {
        heading: "What to do",
        bullets: [
          "Note the exact time and the error code shown",
          "Check whether it happens only on hot, sunny days",
          "Record midday grid voltage if you can",
          "Do not keep restarting — repeated thermal or voltage trips stress the relay stage",
        ],
      },
    ],
    faqs: [
      {
        q: "Is it okay to let the inverter restart itself every day?",
        a: "Occasional restarts are survivable, but daily over-voltage or thermal shutdowns shorten the life of relays and power components. The underlying cause should be fixed.",
      },
    ],
    relatedServices: ["on-grid-solar-inverter-repair", "solar-inverter-troubleshooting"],
  },
  {
    slug: "5kw-solar-system-cost-and-generation-india",
    title: "5kW Solar System: Cost, Generation & Payback in India",
    description:
      "How much does a 5kW solar system cost in India, how many units it generates per day and per month, and its real payback period with net metering.",
    h1: "5kW Solar System: Cost & Generation",
    datePublished: BATCH_25,
    readMinutes: 6,
    keywords: ["5kw solar system cost india", "5kw solar panel generation", "5kw solar units per day", "5kw solar savings"],
    intro: [
      "5kW is one of the most popular rooftop sizes in India — big enough to make a serious dent in a household or small-office bill, small enough to fit most roofs and sanctioned loads. Here are the honest numbers.",
    ],
    sections: [
      {
        heading: "How many units does 5kW generate?",
        bullets: [
          "Per day (clear day, North India): roughly 20–25 units",
          "Per month: around 550–700 units, varying by season",
          "Monsoon and winter: 40–60% of summer output",
          "Actual generation depends on shade, orientation, dust and temperature",
        ],
      },
      {
        heading: "Cost in India",
        paragraphs: [
          "Cost varies with panel type (mono PERC, TOPCon), inverter brand, structure and installation complexity. Residential buyers should also factor in the central subsidy under PM Surya Ghar, which reduces the effective cost meaningfully for systems up to 3kW and partially above it. Always compare per-watt quotes with the same specifications, not headline prices.",
        ],
      },
      {
        heading: "What's included in a proper installation",
        bullets: [
          "Panels, inverter, DC and AC cabling, connectors",
          "Structure, earthing and surge protection",
          "Net metering support and commissioning",
          "Monitoring setup and a commissioning report",
        ],
      },
      {
        heading: "Payback",
        paragraphs: [
          "With self-consumption plus net metering credits, a 5kW system typically pays back in roughly 4–6 years. After that, the electricity is effectively free for the remaining 15+ years of panel life — provided the inverter is maintained (budget for one repair or replacement in that window).",
        ],
      },
    ],
    faqs: [
      {
        q: "Will 5kW run my whole house?",
        a: "For most Indian households during daylight, yes — including fridge, fans, lights and often the AC in the afternoon. Night-time consumption still comes from the grid or batteries.",
      },
      {
        q: "How much roof area does 5kW need?",
        a: "Roughly 300–350 sq ft of unshaded, preferably south-facing roof space.",
      },
    ],
    relatedServices: ["solar-plant-operation-maintenance", "solar-inverter-testing-commissioning"],
  },
  {
    slug: "how-to-reduce-electricity-bill-with-solar",
    title: "How to Reduce Your Electricity Bill with Solar (Practical Guide)",
    description:
      "Practical ways to cut your electricity bill with solar — right system sizing, self-consumption habits, net metering and maintenance that keeps savings real.",
    h1: "How to Reduce Your Electricity Bill with Solar",
    datePublished: BATCH_26,
    readMinutes: 5,
    keywords: ["reduce electricity bill with solar", "solar savings tips", "lower electricity bill india", "solar bill savings"],
    intro: [
      "Buying solar is the first step — actually cutting the bill depends on how the system is sized, used and maintained. These habits make the difference between a solar system that saves a little and one that saves a lot.",
    ],
    sections: [
      {
        heading: "1. Right-size for your daytime load",
        paragraphs: [
          "Solar savings peak when you use power while the sun shines. A system matched to your daytime consumption (pumps, AC, fridge, office equipment) gives the best return — exported units are usually credited at a lower rate than what you pay on import.",
        ],
      },
      {
        heading: "2. Move loads into sunshine hours",
        bullets: [
          "Run washing machine, water pump and geysers during the day",
          "Pre-cool the house in the afternoon instead of running the AC at night",
          "Charge devices and inverters' batteries during daylight",
        ],
      },
      {
        heading: "3. Use net metering properly",
        paragraphs: [
          "With a net meter, every exported unit offsets future import. Apply through your discom, keep the plant commissioned on paper, and check that bills actually reflect export credits — billing errors here quietly erase savings.",
        ],
      },
      {
        heading: "4. Keep the system healthy",
        bullets: [
          "Clean panels every 2–4 weeks in dusty areas",
          "Fix inverter faults immediately — a stopped inverter saves nothing",
          "Check generation monthly in the monitoring app against the same month last year",
          "Maintain earthing and connections to avoid nuisance tripping",
        ],
      },
    ],
    faqs: [
      {
        q: "How much can I realistically save?",
        a: "A well-sized system with good self-consumption can offset 70–90% of daytime consumption. Actual savings depend on your tariff slab — higher slabs mean faster, bigger savings.",
      },
    ],
    relatedServices: ["solar-plant-operation-maintenance", "solar-inverter-maintenance-amc"],
  },
  {
    slug: "why-solar-generation-drops-in-winter",
    title: "Why Solar Generation Drops in Winter (and How to Compensate)",
    description:
      "Solar generation falls in winter — shorter days, lower sun angle, fog and dust. Why it happens in North India and what you can do about each cause.",
    h1: "Why Solar Generation Drops in Winter",
    datePublished: BATCH_26,
    readMinutes: 4,
    keywords: ["solar generation drops in winter", "low solar output winter", "winter solar savings", "fog solar panels india"],
    intro: [
      "A 30–50% drop in winter generation surprises almost every new solar owner in North India. Part of it is physics you cannot change — but part of it is dust, angle and dirt that you can.",
    ],
    sections: [
      {
        heading: "Causes you cannot change",
        bullets: [
          "Shorter days — fewer sunshine hours",
          "Lower sun angle — panels receive less direct irradiance",
          "Fog, haze and cold spells — common across UP and Delhi NCR in December–January",
        ],
      },
      {
        heading: "Causes you CAN fix",
        bullets: [
          "Dust — winter is dry and dusty; uncleaned panels lose significant output",
          "Bird droppings and leaves — block individual cells and can shut down a whole string",
          "Horizontal panel tilt — steeper tilt suits winter sun and helps dust self-cleaning",
          "Shade — low winter sun means shadows travel much further across the roof",
        ],
      },
      {
        heading: "What actually helps",
        paragraphs: [
          "Clean panels more often in winter (every 2–3 weeks in dusty areas), check the app for strings that underperform, and compare generation with the same period last year rather than with summer. If the drop is much steeper than the season explains, a fault — not the weather — is likely.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is low winter generation a fault?",
        a: "Not by itself — 30–40% lower output in peak winter is normal. A sharper drop, or one string far below the others in the app, points to shade, dirt or a real fault worth checking.",
      },
    ],
    relatedServices: ["solar-panel-repair", "solar-plant-operation-maintenance"],
  },
  {
    slug: "solar-panel-shading-losses-explained",
    title: "Solar Panel Shading Losses: Why Small Shade Hurts a Lot",
    description:
      "How even partial shading of solar panels cuts generation far more than expected — the string effect, bypass diodes and practical ways to fix shading losses.",
    h1: "Solar Panel Shading Losses Explained",
    datePublished: BATCH_26,
    readMinutes: 5,
    keywords: ["solar panel shading losses", "shading effect solar panels", "shadow on solar panel", "partial shade solar"],
    intro: [
      "A small shadow across one corner of a panel can cut output far more than its size suggests. Understanding how strings and bypass diodes work explains why — and what can be done about it.",
    ],
    sections: [
      {
        heading: "Why small shade = big loss",
        paragraphs: [
          "Panels in a string are wired in series, so current flows through the weakest link. A shaded cell restricts current for the whole string — and since the inverter tracks the whole array's optimum point, output can fall much further than the shaded area alone.",
        ],
      },
      {
        heading: "Bypass diodes: the safety valve",
        paragraphs: [
          "Every panel has bypass diodes that route current around a heavily shaded section. They prevent hot-spot damage, but the shaded panel still contributes little. If a diode has failed, the panel behaves as fully shaded even in full sun — a common, invisible loss.",
        ],
      },
      {
        heading: "Common shading sources",
        bullets: [
          "Water tanks, pipes and parapet walls",
          "Trees and neighbouring buildings (worse in winter when shadows are long)",
          "Other rows of panels on ground-mount systems",
          "TV antennas, cables and even bird droppings",
        ],
      },
      {
        heading: "What to do about it",
        bullets: [
          "Map shadows across the day, especially in the morning and afternoon",
          "Trim branches before they grow into the array's path",
          "Rearrange strings so shaded panels sit on separate MPPTs",
          "Consider panel-level optimisers for unavoidable partial shade",
          "Fix failed bypass diodes — detected during string-wise testing",
        ],
      },
    ],
    faqs: [
      {
        q: "Will shading of one panel stop the whole system?",
        a: "Not usually — modern inverters and bypass diodes keep the system running at reduced output. But one badly shaded or faulty panel can drag a whole string's production down significantly.",
      },
    ],
    relatedServices: ["solar-panel-repair", "solar-inverter-testing-commissioning"],
  },
  {
    slug: "common-solar-energy-myths-debunked",
    title: "10 Common Solar Energy Myths in India — Debunked",
    description:
      "Solar doesn't work in monsoon, needs constant cleaning, panels stop working in heat — 10 popular solar myths in India explained with the actual facts.",
    h1: "10 Common Solar Myths in India",
    datePublished: BATCH_26,
    readMinutes: 6,
    keywords: ["solar energy myths", "solar myths india", "does solar work in monsoon", "solar panel facts"],
    intro: [
      "Bad information keeps good people from going solar — and sometimes from maintaining the system they already have. Here are the ten myths we hear most, and what is actually true.",
    ],
    sections: [
      { heading: "Myth 1: Solar doesn't work on cloudy days", paragraphs: ["Panels generate on diffuse light — typically 10–25% of rated output on a cloudy day. Generation drops; it doesn't stop."] },
      { heading: "Myth 2: You need to clean panels every day", paragraphs: ["Every 2–4 weeks in dusty areas is enough. Rain often cleans them too. Over-cleaning with abrasive tools actually harms the glass coating."] },
      { heading: "Myth 3: Panels can't handle Indian summer heat", paragraphs: ["Panels are tested for extreme temperatures. High heat slightly reduces efficiency but does not damage them. It is the INVERTER that suffers in heat — shade and ventilate it."] },
      { heading: "Myth 4: Solar stops working during power cuts", paragraphs: ["On-grid inverters do shut off during outages (anti-islanding) — that's safety, not failure. Hybrid systems with batteries keep supplying backup."] },
      { heading: "Myth 5: Solar panels need replacing every 5 years", paragraphs: ["Quality panels carry 25-year performance warranties and routinely last longer. The inverter is the component that needs repair or replacement first."] },
      { heading: "Myth 6: Rooftop solar is only for big houses", paragraphs: ["Systems start at 1kW and fit most roofs. Even a small system meaningfully cuts bills with net metering."] },
      { heading: "Myth 7: Solar is too expensive", paragraphs: ["Per-watt costs have fallen dramatically, and the PM Surya Ghar subsidy reduces residential cost further. Typical payback is 4–6 years for the remaining 20+ years of free power."] },
      { heading: "Myth 8: It generates zero in winter", paragraphs: ["Output is lower but real — winter still produces 50–70% of summer generation on clear days."] },
      { heading: "Myth 9: Once installed, it runs forever without attention", paragraphs: ["Panels need cleaning, connections need tightening, and inverters need periodic service. Neglected systems lose 10–20% a year."] },
      { heading: "Myth 10: Any electrician can install solar", paragraphs: ["String sizing, DC cable selection, earthing, SPDs and grid settings are specialised work. Poor installation is the root cause of most inverter failures we repair."] },
    ],
    faqs: [
      {
        q: "What is the biggest real risk with rooftop solar?",
        a: "Poor installation — wrong cable sizing, weak earthing, inverter in direct sun. It causes the majority of breakdowns, and it is entirely preventable.",
      },
    ],
    relatedServices: ["solar-inverter-maintenance-amc", "solar-inverter-testing-commissioning"],
  },
  {
    slug: "how-to-choose-solar-inverter-capacity",
    title: "How to Choose Solar Inverter Capacity (kW Sizing Guide)",
    description:
      "How to size your solar inverter — matching inverter kW to panel capacity, load, single vs three phase, and why oversizing or undersizing costs you generation.",
    h1: "How to Choose Solar Inverter Capacity",
    datePublished: BATCH_26,
    readMinutes: 5,
    keywords: ["solar inverter capacity", "how to size solar inverter", "solar inverter kw selection", "inverter panel matching"],
    intro: [
      "The inverter is the one component you will interact with every day, and sizing it wrong quietly costs generation for years. Here is how professionals choose the capacity.",
    ],
    sections: [
      {
        heading: "Match it to your panels",
        paragraphs: [
          "A common rule: inverter capacity ≈ 80–110% of total panel capacity. Panels rarely hit rated output in real conditions (heat, dust, angle), so a slightly smaller inverter runs at its efficient peak for more hours — this is normal and called DC oversizing of panels.",
        ],
      },
      {
        heading: "Match it to your load and phase",
        bullets: [
          "Up to ~5kW single phase: homes, small shops",
          "5–10kW and above: three phase, larger homes, offices, small factories",
          "Check your sanctioned load and discom approval limits",
          "For heavy motor loads (pumps, compressors), check starting-surge capacity",
        ],
      },
      {
        heading: "On-grid, hybrid or off-grid?",
        bullets: [
          "On-grid: cheapest, no backup during cuts",
          "Hybrid: adds battery backup; costs more, needs battery budget",
          "Off-grid: for locations with unreliable grid; sized on battery autonomy, not just panels",
        ],
      },
      {
        heading: "Signs your inverter is wrongly sized",
        bullets: [
          "Constant clipping — panels produce more than the inverter can convert",
          "Frequent overload trips when loads start",
          "Inverter running at max capacity for long hours (heat and wear)",
          "Planned expansion with no headroom left",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use a bigger inverter than my panels?",
        a: "Yes, but an oversized inverter operates at low efficiency percentages and may struggle to start MPPT in low light. Matched sizing performs best.",
      },
      {
        q: "Can I add panels later to the same inverter?",
        a: "Up to the inverter's max DC input. Tell your installer your expansion plans before choosing capacity.",
      },
    ],
    relatedServices: ["string-and-central-inverter-repair", "solar-inverter-testing-commissioning"],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const blogUrl = (slug: string) => `/blog/${slug}`;
