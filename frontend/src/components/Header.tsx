import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import { BuildingIcon, UserIcon, LogoutIcon, NotificationsIcon, InfoIcon, MenuIcon } from './icons'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const { isAdmin } = usePermissions()

  return (
    <div className="hidden">
      {/* Header removido conforme solicitado */}
    </div>
  )
}

