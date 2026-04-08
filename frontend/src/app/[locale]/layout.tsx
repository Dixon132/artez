import Navbar from "@/components/layout/Navbar";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Navbar locale={locale} />
      {children}
    </>
  );
}
