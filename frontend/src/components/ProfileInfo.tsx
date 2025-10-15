import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../types/User';
import { Shield, User, CheckCircle, XCircle } from 'lucide-react';

export function ProfileInfo() {
  const { user, isAdmin, getUserPermissions } = usePermissions();

  if (!user) return null;

  const userPermissions = getUserPermissions();
  const categories = ['cadastros', 'processos', 'relatorios', 'configuracoes', 'financeiro'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center space-x-3 mb-6">
        {isAdmin() ? (
          <Shield className="h-8 w-8 text-red-600" />
        ) : (
          <User className="h-8 w-8 text-blue-600" />
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {user.name}
          </h2>
          <p className={`text-sm ${
            isAdmin() ? 'text-red-600' : 'text-blue-600'
          }`}>
            {isAdmin() ? 'Administrador' : 'Funcionário'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Permissões por Categoria
          </h3>
          
          {categories.map(category => {
            const categoryPermissions = PERMISSIONS.filter(p => p.category === category);
            
            return (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2 capitalize">
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryPermissions.map(permission => {
                    const hasPermission = user.permissions.includes(permission.id);
                    return (
                      <div
                        key={permission.id}
                        className={`flex items-center space-x-2 p-2 rounded ${
                          hasPermission 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {hasPermission ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-gray-400" />
                        )}
                        <span className="text-sm">{permission.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total de permissões:</span>
            <span className="font-medium text-gray-800">
              {userPermissions.length} / {PERMISSIONS.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
