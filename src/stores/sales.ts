import { defineStore } from 'pinia'
import { ref } from 'vue'
import { salesApi } from '@/services/api'
import { Product } from './products'

export interface CartItem {
  product: Product
  quantity: number
}

export interface Sale {
  id: string
  totalAmount: number
  paymentMethod: 'CASH'
  cashReceived: number
  changeGiven: number
  status: 'COMPLETED' | 'CANCELLED'
  createdAt: string
  items: SaleItem[]
}

export interface SaleItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export const useSalesStore = defineStore('sales', () => {
  const cart = ref<CartItem[]>([])
  const sales = ref<Sale[]>([])
  const loading = ref(false)

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.value.find(item => item.product.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.value.push({ product, quantity })
    }
  }

  const removeFromCart = (productId: string) => {
    cart.value = cart.value.filter(item => item.product.id !== productId)
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = cart.value.find(item => item.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  const getCartTotal = () => {
    return cart.value.reduce((total, item) => {
      const price = item.product.sellingPrice || item.product.price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const processSale = async (cashReceived: number) => {
    try {
      const saleData = {
        items: cart.value.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice || item.product.price || 0
        })),
        cashReceived
      }

      const sale = await salesApi.create(saleData)
      sales.value.unshift(sale)
      clearCart()
      return { success: true, sale }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Failed to process sale' }
    }
  }

  const fetchSales = async () => {
    loading.value = true
    try {
      const response = await salesApi.getAll()
      sales.value = response
    } catch (error) {
      console.error('Failed to fetch sales:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    cart,
    sales,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    processSale,
    fetchSales
  }
})