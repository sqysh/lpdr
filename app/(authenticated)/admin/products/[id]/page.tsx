import { getProductById } from 'lib/actions/admin/product/getProductById'
import ProductForm from '../_components/ProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getProductById(id)
  return <ProductForm product={result.data} />
}
