"use client";

import React from "react";
import Link from "next/link";


export default function Footer() {
  return (
    <>
      <footer className="ft-wrap">
        <div className="ft-grid">
          {/* Brand */}
          <div className="ft-col">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <img src="/logo.jpg" alt="Sunce" style={{ width: 44, height: 44, borderRadius: 8 }} />
              <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.02em" }}>SUNCE</div>
            </div>
            <p className="ft-text">
              Sunce Renewable offers professional and tailored solutions designed to address your specific requirements. Our team of certified technicians is armed with the most advanced tools and expertise to manage a wide range of tasks.
            </p>
          </div>

          {/* Quick Links */}
          <div className="ft-col">
            <h4>Quick Links</h4>
            <ul className="ft-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/terms-conditions">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="ft-col">
            <h4>Services</h4>
            <ul className="ft-links">
              <li><Link href="/management">Management</Link></li>
              <li><Link href="/career">Careers</Link></li>
              <li><Link href="/products/snet-portable-string-monitoring-device">Products</Link></li>
              <li><Link href="/login">Solar Inverter Services</Link></li>
              <li>
                <Link href="/Brochure-Sunce-Product.pdf" target="_blank">
                  Brochure
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="ft-col">
            <h4>Contact Us</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                B-203, Sector 63A, Noida Uttar Pradesh<br />India 201307
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                +91-9540263987, 9354299513
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                info@suncerenewable.com,<br />
                ajeet.mishra@suncerenewable.com
              </div>
            </div>
          </div>
        </div>

        <div className="ft-bottom">
          <div className="ft-copy">
            &copy; Copyright 2025 by Sunce Renewable
          </div>
          <div className="ft-socials">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </footer>
    </>
  );
}
