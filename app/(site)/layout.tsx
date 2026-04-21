import RootClientLayout from "../components/RootClientLayout";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootClientLayout>{children}</RootClientLayout>;
}
