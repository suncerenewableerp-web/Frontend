import type { Metadata } from "next";
import JsonLd from "../../../components/JsonLd";
import { getProduct } from "../../../lib/products";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "../../../lib/seo";
import ProductContent from "./ProductContent";

const product = getProduct("snet-portable-string-monitoring-device")!;

export const metadata: Metadata = pageMetadata({
  title: `${product.name} | ${product.tagline}`,
  description: product.description,
  path: `/products/${product.slug}`,
  keywords: [
    "portable string monitoring device",
    "solar string monitoring 4G",
    "PV combiner box monitoring India",
    "solar plant string monitor",
  ],
  image: product.image,
  imageAlt: product.name,
});

export default function ProductPage() {
  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
      <ProductContent />
    </>
  );
}
