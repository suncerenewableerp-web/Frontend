"use client";

import { useEffect } from "react";

function useReveal() {
  useEffect(() => {
    const observed = new WeakSet<Element>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).dataset.rv = "in";
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll<HTMLElement>(".rv").forEach((el) => {
      if (!observed.has(el)) { observed.add(el); obs.observe(el); }
    });
    return () => obs.disconnect();
  }, []);
}

export default function PrivacyPolicyPage() {
  useReveal();

  return (
    <main>
      {/* Hero */}
      <section style={{
        minHeight: "40vh", background: "#1a1c23",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "120px 6vw 60px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ zIndex: 2 }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 10px" }}>
            Privacy Policy & Terms
          </h1>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a> / Privacy Policy
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "80px 6vw", background: "#fff" }}>
        <div className="rv" style={{ maxWidth: 900, margin: "0 auto", color: "#444", lineHeight: 1.8 }}>
          <p style={{ marginBottom: "2rem", fontSize: "1.05rem" }}>
            This page states the Terms Of Service under which you purchase and use solar services, IoT monitoring solutions, and maintenance contracts through <strong>Sunce Renewables Pvt. Ltd.</strong> Please read this page carefully, as it constitutes a legally binding agreement between you and Sunce Renewables (the “Company”). In consideration of the Company’s agreement to provide you services, you agree to be bound by these Terms and Conditions.
          </p>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>1. YOUR REPRESENTATIONS AND WARRANTIES.</h2>
            <p>You hereby represent and warrant that:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li>a. You are at least eighteen (18) years of age;</li>
              <li>b. You understand and acknowledge that Sunce Renewables services are intended to be used solely for industrial and residential solar energy management purposes;</li>
              <li>c. You will not use the Company&apos;s resources (1) for any unlawful or illegal purpose; (2) in violation of any applicable law or regulation, (3) in a manner that will infringe the copyright, trademark, or intellectual property rights of others.</li>
            </ul>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>2. RESPONSIBILITY FOR SERVICES.</h2>
            <p>
              You shall be solely responsible for, and the Company shall have no liability whatsoever for, any loss or damage arising from your use of any solar monitoring data or hardware purchased by you, regardless of whether such use was authorized by you. You will defend, indemnify and hold harmless the Company, its directors, partners, officers, employees and agents against any and all claims, liability, loss, damage, or harm arising from or in connection with your purchase or use of Sunce products.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>3. NO WARRANTIES.</h2>
            <p>
              You acknowledge that the services and products are provided to you “as is”, “with all faults” and “as available”. The company makes no warranties, express or implied, contractual or statutory, including but not limited to the implied warranties of merchantability and fitness for a particular purpose, with respect to the solar monitoring systems or any aspect thereof.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>4. INFORMATION & ACCURACY.</h2>
            <p>
              You acknowledge that the service configurations are made based upon the information you provide to the Company at the time of your order. You are solely responsible for ensuring that all such information is provided to the Company in a complete, accurate and legible form. The Company shall have no obligation to contact you to verify the accuracy of any information provided.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>5. REFUNDS.</h2>
            <p>
              All fees received for services ordered by you become non-refundable once the Company has commenced the project or service; provided, however, that the Company will evaluate refund requests in connection with defective hardware if notice is received in writing via electronic mail within a reasonable timeframe as specified in the service contract.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>6. SHIPPING & LOGISTICS.</h2>
            <p>
              All physical hardware will be shipped to you via the shipping method chosen at the time of purchase. Tracking numbers will be sent at the Company’s discretion. The Company shall have no liability for any damage suffered by you or any third party as a result of delays in the shipping.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>7. LIMITATION ON LIABILITY.</h2>
            <p>
              The liability of the Company for any losses or damage arising out of these Terms Of Service or your purchase of any solar monitoring system, including without limitation any cause of action sounding in contract, tort or strict liability, shall be limited to actual, direct damages incurred but in no event shall exceed the fees paid by you to the Company.
            </p>
          </div>

          <div style={{ marginTop: "4rem", padding: "30px", background: "var(--cream)", borderRadius: "16px", border: "1px solid var(--border-site)" }}>
            <p style={{ fontWeight: 700, color: "var(--brown)", marginBottom: "10px" }}>Need Support?</p>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>Don’t let a faulty solar inverter disrupt your energy savings! Contact us for fast, reliable repair services for solar inverters.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
