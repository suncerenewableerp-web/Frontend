import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://suncerenewable.com"),
  title: {
    default: "Sunce Renewables | Solar Inverter Repair & Services in India",
    template: "%s | Sunce Renewables",
  },
  description:
    "Sunce Renewables provides solar inverter repair, solar inverter maintenance, AMC, SCADA monitoring, O&M, PCB repair, and project management services across India.",
  keywords: [
    "solar inverter repair",
    "solar inverter services India",
    "solar inverter maintenance",
    "solar inverter AMC",
    "solar inverter breakdown service",
    "PCB repair for solar inverter",
    "SCADA monitoring solar plant",
    "solar O&M services",
    "solar inverter repair Noida",
    "renewable energy services India",
  ],
  applicationName: "Sunce Renewables",
  authors: [{ name: "Sunce Renewables Pvt. Ltd." }],
  creator: "Sunce Renewables Pvt. Ltd.",
  publisher: "Sunce Renewables Pvt. Ltd.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Sunce Renewables",
    title: "Sunce Renewables | Solar Inverter Repair & Services in India",
    description:
      "Expert solar inverter repair, maintenance, AMC, SCADA monitoring, O&M, and solar project services from Noida to pan India.",
    images: [
      {
        url: "/hero.webp",
        width: 1200,
        height: 630,
        alt: "Sunce Renewables solar inverter service team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunce Renewables | Solar Inverter Repair & Services in India",
    description:
      "Solar inverter repair, AMC, O&M, SCADA monitoring, PCB repair, and clean energy service support across India.",
    images: ["/hero.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Solar Energy Services",
  other: {
    "geo.region": "IN-UP",
    "geo.placename": "Noida",
    "business:contact_data:locality": "Noida",
    "business:contact_data:country_name": "India",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sunce ERP" />
        <meta name="theme-color" content="#faf9f7" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
