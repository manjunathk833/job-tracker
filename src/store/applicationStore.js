import { create } from 'zustand'
import * as svc from '@/services/applicationService'

const useApplicationStore = create((set) => ({
  applications: [],
  loading: false,
  error: null,

  fetchApplications: async () => {
    set({ loading: true, error: null })
    try {
      const apps = await svc.getAll()
      set({ applications: apps, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  addApplication: async (data) => {
    const app = await svc.create(data)
    set((s) => ({ applications: [app, ...s.applications] }))
    return app
  },

  updateApplication: async (id, data) => {
    const app = await svc.update(id, data)
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? app : a)),
    }))
    return app
  },

  deleteApplication: async (id) => {
    await svc.remove(id)
    set((s) => ({ applications: s.applications.filter((a) => a.id !== id) }))
  },
}))

export default useApplicationStore
