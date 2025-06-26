import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productsApi } from '@/services/api'

export interface Product {
  id: string
  name: string
  description: string
  costPrice: number
  sellingPrice: number
  stockQuantity: number
  sku: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Backward compatibility
  price: number
}

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('Fetching products...')
      const response = await productsApi.getAll()
      console.log('Products fetched:', response)
      products.value = response || []
    } catch (err: any) {
      console.error('Failed to fetch products:', err)
      error.value = err.response?.data?.message || 'Failed to fetch products'
      products.value = []
    } finally {
      loading.value = false
    }
  }

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'price'>) => {
    try {
      console.log('Adding product:', productData)
      const newProduct = await productsApi.create(productData)
      console.log('Product added:', newProduct)
      products.value.push(newProduct)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to add product:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to add product' }
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      console.log('Updating product:', id, productData)
      const updatedProduct = await productsApi.update(id, productData)
      console.log('Product updated:', updatedProduct)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      return { success: true }
    } catch (error: any) {
      console.error('Failed to update product:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to update product' }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      console.log('Deleting product:', id)
      await productsApi.delete(id)
      products.value = products.value.filter(p => p.id !== id)
      console.log('Product deleted successfully')
      return { success: true }
    } catch (error: any) {
      console.error('Failed to delete product:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to delete product' }
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  }
})