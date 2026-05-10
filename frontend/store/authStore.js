import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          // Use fetch directly to avoid circular dependency with api.js
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            }
          )
          const data = await res.json()
          if (!res.ok) {
            set({ isLoading: false })
            return { success: false, error: data.error || 'Login fail ho gaya' }
          }
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, error: 'Network error - server se connect nahi ho pa raha' }
        }
      },

      logout: async () => {
        try {
          const { refreshToken, accessToken } = get()
          if (accessToken) {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/logout`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ refreshToken }),
              }
            ).catch(() => {})
          }
        } catch {}
        set({ user: null, accessToken: null, refreshToken: null })
      },

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      isAuthenticated: () => !!(get().user && get().accessToken),
      isAdmin: () => get().user?.role === 'admin',
      isApproved: () => get().user?.isApproved === true,
    }),
    {
      name: 'farewell-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated()
      },
    }
  )
)

export default useAuthStore
