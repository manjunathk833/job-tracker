import { create } from 'zustand'
import * as svc from '@/services/interviewService'

const useInterviewStore = create((set) => ({
  interviews: [],
  loading: false,
  error: null,

  fetchInterviews: async () => {
    set({ loading: true, error: null })
    try {
      const interviews = await svc.getAll()
      set({ interviews, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  addInterview: async (data) => {
    const interview = await svc.create(data)
    set((s) => ({ interviews: [interview, ...s.interviews] }))
    return interview
  },

  updateInterview: async (id, data) => {
    const interview = await svc.update(id, data)
    set((s) => ({
      interviews: s.interviews.map((i) => (i.id === id ? interview : i)),
    }))
    return interview
  },

  deleteInterview: async (id) => {
    await svc.remove(id)
    set((s) => ({ interviews: s.interviews.filter((i) => i.id !== id) }))
  },
}))

export default useInterviewStore
