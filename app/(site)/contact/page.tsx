"use client";

import { useEffect, useState } from "react";

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


export default function ContactPage() {
  useReveal();
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });

  const handleSend = () => {
    const text = `Hi Sunce Renewables!\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nSubject: ${form.subject}\nMessage: ${form.message}`;
    window.open(`https://wa.me/916361991349?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <main>

      {/* Hero */}
      <section style={{
        minHeight: "40vh", background: "#1a1c23",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "120px 6vw 60px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ zIndex: 2 }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 10px" }}>
            Contact
          </h1>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a> / Contact
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "96px 6vw", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 80 }}>
          
          {/* Left Column */}
          <div className="rv">
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--navy)", marginBottom: 24 }}>Office Address</h2>
            <div style={{ width: 60, height: 2, background: "#ccc", marginBottom: 24 }} />
            
            <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.7, marginBottom: 24 }}>
              B-203, Sector 63A, Noida (U.P.) 201307
            </p>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#444", marginBottom: 8 }}>Phone:</div>
              <div style={{ fontSize: "0.95rem", color: "#666" }}>+91-9540263987, +91-9354299513</div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#444", marginBottom: 8 }}>Email:</div>
              <div style={{ fontSize: "0.95rem", color: "#666" }}>info@suncerenewable.com,</div>
              <div style={{ fontSize: "0.95rem", color: "#666" }}>ajeet.mishra@suncerenewable.com</div>
            </div>

            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #eee", height: 300 }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.48227653545!2d77.3879783!3d28.6153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a53697e871%3A0x6b77c1d7f6b0f0a0!2sNoida%2C%20Uttar%20Pradesh%20201307!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Right Column */}
          <div className="rv">
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--navy)", marginBottom: 32 }}>Get A Free Quote</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <input type="text" placeholder="Your Name" className="contact-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input type="text" placeholder="Your Number" className="contact-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <input type="email" placeholder="Your email" className="contact-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <input type="text" placeholder="Subject" className="contact-input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
              <textarea placeholder="Message" className="contact-input" style={{ height: 160, resize: "none" }} value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
              <div style={{ marginTop: 8 }}>
                <button className="contact-btn" onClick={handleSend}>Send Message</button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
