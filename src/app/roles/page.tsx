"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Navbar } from '@/components/ui';
import { roleApi } from '@/lib/api';
import type { 
  Role, 
  Permission, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  PermissionsResponse 
} from '@/types/employee';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    permissionIds: []
  });
  const [editFormData, setEditFormData] = useState<UpdateRoleRequest>({});
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchRoles();
    fetchPermissions();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const userTypeData = localStorage.getItem('userType');
    
    if (!token) {
      router.push('/login');
      return false;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (userTypeData) {
      setUserType(userTypeData);
    }
    return true;
  };

  const fetchRoles = async () => {
    try {
      const response = await roleApi.getAll();
      setRoles(response.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response: PermissionsResponse = await roleApi.getPermissions();
      setPermissions(response.permissions || {});
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setPermissions({}); // Set empty object as fallback
    }
  };

  const handleCreateRole = async () => {
    try {
      await roleApi.create(createFormData);
      await fetchRoles();
      setShowCreateForm(false);
      setCreateFormData({
        name: '',
        description: '',
        permissionIds: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditFormData({
      name: role.name,
      description: role.description,
      permissionIds: role.permissions.map(p => p.permission.id),
    });
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      await roleApi.update(editingRole.id, editFormData);
      await fetchRoles();
      setEditingRole(null);
      setEditFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await roleApi.delete(id);
      await fetchRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

  const handlePermissionToggle = (permissionId: string, isCreate: boolean) => {
    if (isCreate) {
      const currentPermissions = createFormData.permissionIds || [];
      if (currentPermissions.includes(permissionId)) {
        setCreateFormData({
          ...createFormData,
          permissionIds: currentPermissions.filter(id => id !== permissionId)
        });
      } else {
        setCreateFormData({
          ...createFormData,
          permissionIds: [...currentPermissions, permissionId]
        });
      }
    } else {
      const currentPermissions = editFormData.permissionIds || [];
      if (currentPermissions.includes(permissionId)) {
        setEditFormData({
          ...editFormData,
          permissionIds: currentPermissions.filter(id => id !== permissionId)
        });
      } else {
        setEditFormData({
          ...editFormData,
          permissionIds: [...currentPermissions, permissionId]
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType={userType} />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Role
                  </Button>
                </div>
              </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {roles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No roles found.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                  <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Permissions ({role.permissions.length})
                      </h4>
                      <div className="space-y-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <div key={permission.permission.id} className="flex items-center">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {permission.permission.category}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              {permission.permission.name}
                            </span>
                          </div>
                        ))}
                        {role.permissions.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{role.permissions.length - 3} more permissions
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Role Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={() => setShowCreateForm(false)}
              ></div>

              <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full z-10">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Create New Role
                      </h3>
                      
                      <div className="space-y-4">
                        <Input
                          label="Role Name"
                          value={createFormData.name}
                          onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                          placeholder="Enter role name"
                          required
                        />
                        
                        <Input
                          label="Description"
                          value={createFormData.description}
                          onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                          placeholder="Enter role description"
                          required
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permissions
                          </label>
                          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-4">
                            {permissions && Object.entries(permissions).map(([category, categoryPermissions]) => (
                              <div key={category} className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                                <div className="space-y-2">
                                  {categoryPermissions.map((permission) => (
                                    <label key={permission.id} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={(createFormData.permissionIds || []).includes(permission.id)}
                                        onChange={() => handlePermissionToggle(permission.id, true)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                      />
                                      <div className="ml-2">
                                        <span className="text-sm font-medium text-gray-900">
                                          {permission.name}
                                        </span>
                                        <p className="text-xs text-gray-500">
                                          {permission.description}
                                        </p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={handleCreateRole}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Role
                  </Button>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {editingRole && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={() => setEditingRole(null)}
              ></div>

              <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full z-10">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit Role
                      </h3>
                      
                      <div className="space-y-4">
                        <Input
                          label="Role Name"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          placeholder="Enter role name"
                        />
                        
                        <Input
                          label="Description"
                          value={editFormData.description || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          placeholder="Enter role description"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permissions
                          </label>
                          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-4">
                            {permissions && Object.entries(permissions).map(([category, categoryPermissions]) => (
                              <div key={category} className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                                <div className="space-y-2">
                                  {categoryPermissions.map((permission) => (
                                    <label key={permission.id} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={(editFormData.permissionIds || []).includes(permission.id)}
                                        onChange={() => handlePermissionToggle(permission.id, false)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                      />
                                      <div className="ml-2">
                                        <span className="text-sm font-medium text-gray-900">
                                          {permission.name}
                                        </span>
                                        <p className="text-xs text-gray-500">
                                          {permission.description}
                                        </p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={handleUpdateRole}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update Role
                  </Button>
                  <Button
                    onClick={() => setEditingRole(null)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}