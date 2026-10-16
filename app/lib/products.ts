export type SiteProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  features: string[];
};

export const PRODUCTS: SiteProduct[] = [
  {
    slug: "snet-portable-string-monitoring-device",
    name: "SNet Portable String Monitoring Device",
    tagline: "Efficiently Monitor and Optimize Your Solar Power Plant",
    description:
      "A PV string monitoring system that precisely detects abnormal conditions in a solar power plant. It monitors all strings inside a combiner box without disrupting power generation, with 4G communication and easy retrofit installation.",
    image: "/1.png",
    features: [
      "Seamless 4G Internet Communication",
      "Easy Retrofit Installation",
      "Compact Design with Integrated Power Supply",
      "Safe and Effortless Current Measurement",
      "Seamless Integration with Modbus/RTU Communication",
    ],
  },
  {
    slug: "snet-lora",
    name: "SNet – LoRa",
    tagline: "Reliable Wireless Data Acquisition and Transmission",
    description:
      "LoRa based wireless data acquisition for solar and industrial plants. Supports wireless sensors and RS485 serial data conversion with up to 12 km open-area communication, Modbus TCP/RTU support and secure encryption.",
    image: "/2.png",
    features: [
      "Advanced LoRa wireless data acquisition",
      "Supports 5-12VDC power supply",
      "Modbus TCP and Modbus RTU compatible",
      "Up to 250 device collecting points",
      "Secure data encryption during transmission",
      "Communication distance up to 12 km in open areas",
    ],
  },
  {
    slug: "snet-string-monitoring-box",
    name: "SNet String Monitoring Box",
    tagline: "Indian-Made String Monitoring with LoRa Technology",
    description:
      "An Indian manufactured string monitoring box with a proprietary monitoring card and LoRa data communication. Maximises energy production, reduces downtime and enables remote access to solar installation health.",
    image: "/SNet String Monitoring Box.webp",
    features: [
      "Maximize Energy Production",
      "Reduce Downtime with instant fault detection",
      "Cost-Efficiency and better system ROI",
      "Remote Access from anywhere",
      "Proven Reliability designed by solar experts",
    ],
  },
  {
    slug: "snet-rs485-to-ethernet-convertor",
    name: "SNet RS485 to Ethernet Convertor",
    tagline: "High Performance Industrial Protocol Conversion",
    description:
      "Industrial MODBUS TCP/RTU protocol converter that bridges RS485 devices to Ethernet networks. Supports up to ten TCP masters, configurable baud rates and optional RS485/RS232 isolation.",
    image: "/2.png",
    features: [
      "Acts as MODBUS TCP Slave and MODBUS RTU Master",
      "Supports standard MODBUS commands",
      "Embedded HTTP configuration module",
      "Up to ten TCP masters can connect",
      "Optional RS485/RS232 Isolation",
      "Configurable Baud rate (1200-230400)",
    ],
  },
  {
    slug: "snet-iot-gateway",
    name: "SNet IoT Gateway",
    tagline: "Unlock the Power of Real-Time Information",
    description:
      "An industrial IoT gateway for solar plant remote monitoring and control with digital inputs/outputs, RS232 and RS485 ports, MQTT/HTTP/TCP-IP/FTP support, programmable automation logic and wide temperature operation.",
    image: "/3.png",
    features: [
      "Digital Inputs for remote monitoring",
      "Digital Outputs for remote controls",
      "RS232 and RS485 Ports for data acquisition",
      "Supports HTTP, TCP/IP, FTP, and MQTT",
      "Programmable Automation Logic",
      "Built-In Real-Time Clock (RTC)",
      "Ultra-low consumption energy-efficient design",
      "Wide Operating Temperature: -40~+85°C",
    ],
  },
];

export function getProduct(slug: string): SiteProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productUrl(slug: string): string {
  return `/products/${slug}`;
}
