import { create } from 'zustand'
import { alertSvc } from '@/services/alertService'

const useAlertStore = create((set) => ({
  alerts: [],
  loading: false,

  fetchAlerts: async () => {
    set({ loading: true })
    try {
      const alerts = await alertSvc.getAll()
      set({ alerts })
    } finally {
      set({ loading: false })
    }
  },

  addAlert: async (data) => {
    const alert = await alertSvc.create({ ...data, active: true })
    set((s) => ({ alerts: [alert, ...s.alerts] }))
    return alert
  },

  toggleAlert: async (id, active) => {
    const updated = await alertSvc.update(id, { active })
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? updated : a)) }))
  },

  deleteAlert: async (id) => {
    await alertSvc.delete(id)
    set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) }))
  },
}))

export default useAlertStore
