import RootClientLayout from "../components/RootClientLayout";
import SeoContent from "../components/SeoContent";
import JsonLd from "../components/JsonLd";
import { ORG_JSON_LD } from "../lib/site";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootClientLayout beforeFooter={<SeoContent />}>
      <JsonLd data={ORG_JSON_LD} />
      {children}
    </RootClientLayout>
  );
}
