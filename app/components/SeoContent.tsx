const serviceAreas = [
  "Solar inverter repair",
  "Solar inverter maintenance",
  "Solar inverter AMC",
  "PCB card-level diagnostics",
  "SCADA monitoring",
  "Solar O&M services",
  "Project management consultancy",
  "Pan India solar support",
];

export default function SeoContent() {
  return (
    <section className="seo-section" aria-labelledby="solar-service-seo-title">
      <div className="seo-wrap">
        <div className="seo-kicker">Solar Energy Service Experts</div>
        <h2 id="solar-service-seo-title">
          Solar Inverter Repair, Maintenance and AMC Services in India
        </h2>
        <div className="seo-grid">
          <div className="seo-copy">
            <p>
              Sunce Renewables is a trusted solar service company for businesses,
              EPC teams, rooftop owners, industries, institutions and utility
              scale solar plants that need dependable solar inverter repair and
              long term performance support. Our work focuses on practical solar
              energy solutions that protect generation, reduce downtime and help
              customers get better returns from every installed kilowatt. From
              urgent solar inverter breakdown support to scheduled preventive
              maintenance, our technicians diagnose faults carefully, repair
              systems responsibly and guide customers with clear next steps.
            </p>
            <p>
              Our core expertise includes solar inverter repair, solar inverter
              maintenance, solar inverter AMC, PCB card-level repair, SCADA
              monitoring, IoT based plant visibility, operation and maintenance,
              design support and project management consultancy. Many solar
              assets lose revenue because small faults remain unnoticed until
              production drops. Sunce helps plant owners identify those problems
              early through inspection, remote monitoring, alarm review,
              component testing and structured service reporting. This makes the
              solar plant easier to maintain and gives decision makers a cleaner
              view of plant health.
            </p>
            <p>
              When a solar inverter fails, replacement is not always the smartest
              or most economical option. Our inverter doctors work on deep
              diagnostics for string inverters, central inverters and
              out-of-warranty systems from leading brands. We inspect boards,
              power stages, communication errors, DC and AC side symptoms,
              thermal damage and recurring tripping issues before recommending a
              repair path. This component-level approach can extend equipment
              life, lower service cost and bring solar generation back faster for
              commercial and industrial customers.
            </p>
            <p>
              Sunce Renewables is based in Noida and serves customers across
              India with a combination of field service, workshop repair,
              remote technical support and maintenance planning. Our team
              understands that a solar plant is not just an installation; it is a
              long term energy asset. That is why our solar O&M services are
              designed around uptime, safety, performance ratio, documentation
              and accountability. We support cleaning plans, electrical checks,
              inverter health, string monitoring, breakdown response, spare
              coordination and reporting for owners who want professional solar
              plant management.
            </p>
            <p>
              Customers choose Sunce because our service model combines
              technical skill with business awareness. We help reduce avoidable
              shutdowns, improve energy yield, keep maintenance predictable and
              support teams that need a single partner for solar inverter
              services, monitoring, design guidance and project execution. Our
              solutions are useful for rooftop solar plants, industrial solar
              projects, commercial buildings, institutional campuses and larger
              renewable energy portfolios that need reliable support after
              commissioning.
            </p>
            <p>
              A strong maintenance partner is especially important for sites
              where every hour of lost generation affects savings, operations
              and payback. Sunce works with customers to create service plans
              that match plant size, equipment age, usage pattern and risk
              level. For new projects, our team can support design review,
              installation coordination, commissioning checks and monitoring
              setup. For running projects, we can help with health audits,
              inverter fault history, cable and connector checks, earthing
              review, performance analysis and service documentation. This
              practical approach makes solar assets easier to manage for owners,
              facility teams and investors who want dependable renewable energy
              output without repeated surprises.
            </p>
            <p>
              If you are searching for solar inverter repair near Noida, solar
              inverter services in India, solar inverter AMC, SCADA monitoring,
              solar plant O&M or expert renewable energy service support, Sunce
              Renewables can help you keep your plant productive and your energy
              investment protected. Our goal is simple: faster diagnosis, honest
              service advice, better equipment life and cleaner solar performance
              for every customer we support.
            </p>
          </div>
          <aside className="seo-panel" aria-label="Solar service keywords">
            <h3>Service Focus</h3>
            <ul>
              {serviceAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
