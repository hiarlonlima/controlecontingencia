import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CadastroBM from './pages/CadastroBM.jsx'
import CadastroPerfil from './pages/CadastroPerfil.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import Dashboard from './pages/Dashboard.jsx'
import KanbanBMs from './pages/KanbanBMs.jsx'
import KanbanProfiles from './pages/KanbanProfiles.jsx'
import Login from './pages/Login.jsx'
import Relatorios from './pages/Relatorios.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="kanban/perfis" element={<KanbanProfiles />} />
        <Route path="kanban/bms" element={<KanbanBMs />} />
        <Route path="cadastro/perfil" element={<CadastroPerfil />} />
        <Route path="cadastro/bm" element={<CadastroBM />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
