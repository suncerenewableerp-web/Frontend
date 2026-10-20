import type { BlogPost } from "./types";

const PUBLISHED = "2026-10-20";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-is-my-solar-inverter-not-working",
    title: "Why Is My Solar Inverter Not Working? 9 Causes & Fixes",
    description:
      "Solar inverter not working or showing no generation? Learn the 9 most common causes, what you can safely check yourself and when to call a solar inverter technician.",
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
      "Watch for these 7 warning signs that your solar inverter needs repair — from error lights and noise to falling generation — before a small fault becomes a costly breakdown.",
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
      "When should you replace a solar inverter instead of repairing it? Six clear signals — age, damage, parts, efficiency and capacity — from solar inverter repair experts.",
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
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const blogUrl = (slug: string) => `/blog/${slug}`;
