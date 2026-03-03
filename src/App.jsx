import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Applications from '@/pages/Applications'
import Interviews from '@/pages/Interviews'
import Companies from '@/pages/Companies'
import Insights from '@/pages/Insights'
import Alerts from '@/pages/Alerts'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="companies" element={<Companies />} />
          <Route path="insights" element={<Insights />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
