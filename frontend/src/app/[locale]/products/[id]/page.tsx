import { getProduct } from "@/services/api";
import ProductDetail from "@/components/product/ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const product = await getProduct(id, locale);

  return <ProductDetail product={product} />;
}