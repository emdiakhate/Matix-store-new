'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import {
  Database,
  FullUser,
  UserProfile,
  UserSettings,
  UserRole
} from '@/lib/types'
import { userService } from '@/lib/services'

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// ============================================================================
// HOOKS DE BASE
// ============================================================================

export function useSupabase() {
  const [supabase] = useState(() => createClient())
  return supabase
}

export function useUser() {
  const supabase = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading }
}

export function useSession() {
  const supabase = useSupabase()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { session, loading }
}

// ============================================================================
// HOOK D'AUTHENTIFICATION PRINCIPAL
// ============================================================================

export function useAuth() {
  const supabase = useSupabase()
  const { user, loading: userLoading } = useUser()

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { user: data.user, session: data.session, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { user: data.user, session: data.session, error }
  }

  const signInWithPhone = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone
    })
    return { data, error }
  }

  const verifyOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
    return { user: data.user, session: data.session, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  }

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { user: data.user, error }
  }

  return {
    user,
    loading: userLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithPhone,
    verifyOtp,
    signOut,
    resetPassword,
    updatePassword
  }
}

// ============================================================================
// HOOK UTILISATEUR MATIX COMPLET
// ============================================================================

interface MatixUserState {
  user: User | null
  matixUser: FullUser | null
  profile: UserProfile | null
  settings: UserSettings | null
  activeRole: UserRole
  loading: boolean
  error: Error | null
}

export function useMatixUser() {
  const supabase = useSupabase()
  const { user, loading: authLoading } = useUser()
  const [state, setState] = useState<MatixUserState>({
    user: null,
    matixUser: null,
    profile: null,
    settings: null,
    activeRole: 'producer',
    loading: true,
    error: null
  })

  // Charger le profil complet quand l'utilisateur se connecte
  useEffect(() => {
    const loadMatixUser = async () => {
      if (!user) {
        setState({
          user: null,
          matixUser: null,
          profile: null,
          settings: null,
          activeRole: 'producer',
          loading: false,
          error: null
        })
        return
      }

      try {
        const { data: matixUser, error } = await userService.getFullUser(user.id)

        if (error) {
          setState(prev => ({
            ...prev,
            user,
            loading: false,
            error: error as Error
          }))
          return
        }

        setState({
          user,
          matixUser,
          profile: matixUser?.profile || null,
          settings: matixUser?.settings || null,
          activeRole: matixUser?.active_role || 'producer',
          loading: false,
          error: null
        })
      } catch (err) {
        setState(prev => ({
          ...prev,
          user,
          loading: false,
          error: err as Error
        }))
      }
    }

    if (!authLoading) {
      loadMatixUser()
    }
  }, [user, authLoading])

  // Changer de rôle
  const switchRole = useCallback(async (newRole: UserRole) => {
    if (!user) return { error: new Error('Non connecté') }

    const { data, error } = await userService.switchRole(user.id, newRole)

    if (!error && data) {
      setState(prev => ({
        ...prev,
        matixUser: prev.matixUser ? { ...prev.matixUser, active_role: newRole } : null,
        activeRole: newRole
      }))
    }

    return { data, error }
  }, [user])

  // Mettre à jour le profil
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Non connecté') }

    const { data, error } = await userService.updateProfile(user.id, updates)

    if (!error && data) {
      setState(prev => ({
        ...prev,
        profile: data
      }))
    }

    return { data, error }
  }, [user])

  // Mettre à jour les paramètres
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) return { error: new Error('Non connecté') }

    const { data, error } = await userService.updateSettings(user.id, updates)

    if (!error && data) {
      setState(prev => ({
        ...prev,
        settings: data
      }))
    }

    return { data, error }
  }, [user])

  // Activer le rôle distributeur
  const enableDistributorRole = useCallback(async () => {
    if (!user) return { error: new Error('Non connecté') }

    const { data, error } = await userService.enableDistributorRole(user.id)

    if (!error && data) {
      setState(prev => ({
        ...prev,
        matixUser: prev.matixUser ? { ...prev.matixUser, is_distributor_enabled: true } : null
      }))
    }

    return { data, error }
  }, [user])

  // Recharger les données utilisateur
  const refresh = useCallback(async () => {
    if (!user) return

    setState(prev => ({ ...prev, loading: true }))

    const { data: matixUser, error } = await userService.getFullUser(user.id)

    setState({
      user,
      matixUser,
      profile: matixUser?.profile || null,
      settings: matixUser?.settings || null,
      activeRole: matixUser?.active_role || 'producer',
      loading: false,
      error: error as Error | null
    })
  }, [user])

  return {
    ...state,
    isAuthenticated: !!user,
    isProducer: state.activeRole === 'producer',
    isDistributor: state.activeRole === 'distributor',
    canSwitchToDistributor: state.matixUser?.is_distributor_enabled || false,
    switchRole,
    updateProfile,
    updateSettings,
    enableDistributorRole,
    refresh
  }
}

// ============================================================================
// HOOK POUR LES NOTIFICATIONS
// ============================================================================

export function useNotifications() {
  const supabase = useSupabase()
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Database['public']['Tables']['notifications']['Row'][]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Charger les notifications
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
      setLoading(false)
    }

    loadNotifications()

    // S'abonner aux nouvelles notifications
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Database['public']['Tables']['notifications']['Row']
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // Marquer comme lu
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return { error }
  }

  // Marquer tout comme lu
  const markAllAsRead = async () => {
    if (!user) return { error: new Error('Non connecté') }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }

    return { error }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  }
}

// ============================================================================
// HOOK POUR LE PANIER
// ============================================================================

interface CartItem {
  productId: string
  quantity: number
  unitPrice: number
  productName: string
  producerId: string
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  // Charger le panier depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('matix_cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
  }, [])

  // Sauvegarder le panier
  useEffect(() => {
    localStorage.setItem('matix_cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev =>
      prev.map(i => i.productId === productId ? { ...i, quantity } : i)
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Grouper par producteur
  const itemsByProducer = items.reduce((acc, item) => {
    if (!acc[item.producerId]) {
      acc[item.producerId] = []
    }
    acc[item.producerId].push(item)
    return acc
  }, {} as Record<string, CartItem[]>)

  return {
    items,
    itemsByProducer,
    total,
    itemCount,
    isEmpty: items.length === 0,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { CartItem }
