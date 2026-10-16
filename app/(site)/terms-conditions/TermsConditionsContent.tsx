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

export default function TermsConditionsPage() {
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
            Terms & Conditions
          </h1>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a> / Terms & Conditions
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "80px 6vw", background: "#fff" }}>
        <div className="rv" style={{ maxWidth: 900, margin: "0 auto", color: "#444", lineHeight: 1.8 }}>
          <p style={{ marginBottom: "2rem", fontSize: "1.05rem" }}>
            This page states the Terms Of Service under which you purchase and use solar inverter services, IoT monitoring solutions, and project management services through <strong>Sunce Renewables Pvt. Ltd.</strong> Please read this page carefully, as it constitutes a legally binding agreement between you and Sunce Renewables (the “Company”). In consideration of the Company’s agreement to provide you services, you agree to be bound by these Terms and Conditions.
          </p>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>1. YOUR REPRESENTATIONS AND WARRANTIES.</h2>
            <p>You hereby represent and warrant that:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li>a. You are at least eighteen (18) years of age;</li>
              <li>b. You understand and acknowledge that the services provided by Sunce Renewables are intended for professional solar energy management and industrial maintenance;</li>
              <li>c. You will not use the Company&apos;s services (1) for any unlawful or illegal purpose or in connection with or in furtherance of any unlawful or illegal activity; (2) in violation of any applicable law or regulation.</li>
            </ul>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>2. RESPONSIBILITY FOR SERVICES & EQUIPMENT.</h2>
            <p>
              You shall be solely responsible for, and the Company shall have no liability whatsoever for, any loss or damage arising from your use of Sunce Renewables hardware or software. You will defend, indemnify and hold harmless the Company, its directors, partners, officers, employees and agents against any and all claims, liability, loss, damage, or harm arising from or in connection with your use of the provided documents or services.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>3. NO WARRANTIES.</h2>
            <p>
              You acknowledge that the services are provided to you “as is”, “with all faults” and “as available”. The company makes no warranties, express or implied, including but not limited to the implied warranties of merchantability and fitness for a particular purpose.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>4. INFORMATION.</h2>
            <p>
              You acknowledge that service orders are processed based upon the information you provide to the Company at the time of your order. You are solely responsible for ensuring that all such information is provided to the Company in a complete, accurate and legible form.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>5. REFUNDS.</h2>
            <p>
              All fees received for services become non-refundable once the Company has commenced production or service execution; however, the Company will evaluable refund requests in connection with nonconforming hardware if reported within 24 hours of receipt.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>6. SHIPPING.</h2>
            <p>
              All equipment will be shipped to you via the method chosen at purchase. The Company does not warrant that equipment will be delivered within any specific time frame. Tracking numbers are sent at the Company&apos;s discretion.
            </p>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>7. LIMITATION ON LIABILITY.</h2>
            <p>
              The liability of the Company for any losses or damage arising out of these Terms Of Service shall be limited to actual, direct damages incurred but in no event shall exceed the fees paid by you to the Company for the service in connection with which such liability arose.
            </p>
          </div>

          <div style={{ padding: "40px", background: "var(--cream)", borderRadius: "16px", border: "1px solid var(--border-site)", marginTop: "40px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brown)", marginBottom: "25px", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "10px" }}>GENERAL</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "8px" }}>A. SEVERABILITY</p>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  Any provision or portion of these Terms Of Service held or determined by a court of competent jurisdiction to be illegal, invalid, or unenforceable shall be deemed separate, distinct and independent, and shall be ineffective to the extent of such holding without invalidating the remaining provisions.
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "8px" }}>B. GOVERNING LAW</p>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  These Terms Of Service and the Parties’ respective performances hereunder, shall be construed and regulated in accordance with the laws of India.
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "8px" }}>C. FORCE MAJEURE</p>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  Any delay or non-performance of any provision of these Terms Of Service caused by conditions beyond the reasonable control of the performing Party shall not constitute a breach, and the time for performance shall be extended for a period equal to the duration of the conditions.
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "8px" }}>D. ASSIGNMENT</p>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  You may not assign any portion of these Terms Of Service, voluntarily or involuntarily, including without limitation by operation of law or by merger, except with the express consent of the Company. Any attempt to do so shall be null and void.
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "8px" }}>E. ENTIRE AGREEMENT</p>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  These Terms Of Service constitute the entire agreement and understanding of the Parties with respect to the subject matter hereof, superseding all prior or contemporaneous agreements, representations, promises and understandings, whether written or oral.
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "8px" }}>F. BINDING AGREEMENT</p>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  These Terms Of Service shall be binding upon and insure to the benefit of the Parties and their respective legatees, distributees, legal representatives, successors and permitted assigns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
