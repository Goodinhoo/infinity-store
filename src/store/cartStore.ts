import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: number
  name: string
  price: number
  imageUrl: string | null
  quantity: number
  categoryId: number
}

export interface AppliedCoupon {
  id: number
  code: string
  discountPct: number
  applicableCategoryIds: number[]
  applicableProductIds: number[]
}

export interface AppliedCreatorCode {
  id: number
  code: string
  discountPercent: number
  rewardPercent: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  appliedCoupon: AppliedCoupon | null
  appliedCreatorCode: AppliedCreatorCode | null
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  applyCreatorCode: (code: AppliedCreatorCode) => void
  removeCreatorCode: () => void
  getSubtotal: () => number
  getDiscountAmount: () => number
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
      appliedCreatorCode: null,

      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find((item) => item.id === newItem.id)
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            isOpen: true
          }
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }], isOpen: true }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        ),
      })),

      clearCart: () => set({ items: [], appliedCoupon: null, appliedCreatorCode: null }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon, appliedCreatorCode: null }), // Remove o criador se usar cupão
      removeCoupon: () => set({ appliedCoupon: null }),
      
      applyCreatorCode: (code) => set({ appliedCreatorCode: code, appliedCoupon: null }), // Remove o cupão se usar criador
      removeCreatorCode: () => set({ appliedCreatorCode: null }),

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getDiscountAmount: () => {
        const { items, appliedCoupon, appliedCreatorCode } = get()
        let discount = 0

        if (appliedCoupon) {
          const catIds = appliedCoupon.applicableCategoryIds || []
          const prodIds = appliedCoupon.applicableProductIds || []
          const isGlobal = catIds.length === 0 && prodIds.length === 0

          items.forEach(item => {
            if (isGlobal || prodIds.includes(item.id) || catIds.includes(item.categoryId)) {
              discount += (item.price * item.quantity) * (appliedCoupon.discountPct / 100)
            }
          })
        }

        if (appliedCreatorCode) {
          items.forEach(item => {
            discount += (item.price * item.quantity) * (appliedCreatorCode.discountPercent / 100)
          })
        }

        return discount
      },

      getTotal: () => {
        const { getSubtotal, getDiscountAmount } = get()
        return getSubtotal() - getDiscountAmount()
      },
    }),
    {
      name: 'infinity-cart',
    }
  )
)
