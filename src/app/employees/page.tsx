"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Navbar } from '@/components/ui';
import { employeeApi, roleApi } from '@/lib/api';
import type { 
  EmployeeResponse, 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest, 
  Role 
} from '@/types/employee';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateEmployeeRequest>({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    password: ''
  });
  const [editFormData, setEditFormData] = useState<UpdateEmployeeRequest>({});
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchEmployees();
    fetchRoles();
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

  const fetchEmployees = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userType = localStorage.getItem('userType');
      
      let response;
      if (userType === 'company') {
        // Company fetching their employees
        response = await employeeApi.getByCompany(user._id);
      } else {
        // Employee viewing other employees in their company
        response = await employeeApi.getByCompany(user.companyId);
      }
      
      setEmployees(response.employees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleApi.getAll();
      setRoles(response.roles);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      await employeeApi.create(createFormData);
      await fetchEmployees();
      setShowCreateForm(false);
      setCreateFormData({
        name: '',
        email: '',
        phone: '',
        roleId: '',
        password: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    }
  };

  const handleEditEmployee = (employee: EmployeeResponse) => {
    setEditingEmployee(employee);
    setEditFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      roleId: employee.roleId._id,
    });
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      await employeeApi.update(editingEmployee._id, editFormData);
      await fetchEmployees();
      setEditingEmployee(null);
      setEditFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeApi.delete(id);
      await fetchEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete employee');
    }
  };

  const handleUpdateRole = async (employeeId: string, roleId: string) => {
    try {
      await employeeApi.updateRole(employeeId, roleId);
      await fetchEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee role');
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
                <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Employee
                  </Button>
                </div>
              </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {employees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No employees found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {employee._id.slice(-6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.email}</div>
                          <div className="text-sm text-gray-500">{employee.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.roleId.name}</div>
                          <div className="text-sm text-gray-500">
                            {employee.roleId.permissions.length} permissions
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Employee Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={() => setShowCreateForm(false)}
              ></div>

              <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full z-10">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Create New Employee
                      </h3>
                      
                      <div className="space-y-4">
                        <Input
                          label="Full Name"
                          value={createFormData.name}
                          onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                          placeholder="Enter full name"
                          required
                        />
                        
                        <Input
                          label="Email"
                          type="email"
                          value={createFormData.email}
                          onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                          placeholder="Enter email"
                          required
                        />
                        
                        <Input
                          label="Phone"
                          value={createFormData.phone}
                          onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                          </label>
                          <select
                            value={createFormData.roleId}
                            onChange={(e) => setCreateFormData({ ...createFormData, roleId: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                              <option key={role._id} value={role._id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <Input
                          label="Password"
                          type="password"
                          value={createFormData.password}
                          onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={handleCreateEmployee}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Employee
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

        {/* Edit Employee Modal */}
        {editingEmployee && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={() => setEditingEmployee(null)}
              ></div>

              <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full z-10">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit Employee
                      </h3>
                      
                      <div className="space-y-4">
                        <Input
                          label="Full Name"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          placeholder="Enter full name"
                        />
                        
                        <Input
                          label="Email"
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          placeholder="Enter email"
                        />
                        
                        <Input
                          label="Phone"
                          value={editFormData.phone || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                          </label>
                          <select
                            value={editFormData.roleId || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, roleId: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                              <option key={role._id} value={role._id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={handleUpdateEmployee}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update Employee
                  </Button>
                  <Button
                    onClick={() => setEditingEmployee(null)}
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