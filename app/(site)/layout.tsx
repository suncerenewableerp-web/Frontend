import RootClientLayout from "../components/RootClientLayout";
import SeoContent from "../components/SeoContent";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootClientLayout beforeFooter={<SeoContent />}>{children}</RootClientLayout>;
}
