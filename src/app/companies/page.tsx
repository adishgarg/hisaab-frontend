"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Navbar } from '@/components/ui';
import { companyApi } from '@/lib/api';
import type { CompanyResponse, UpdateCompanyRequest } from '@/types/company';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCompany, setEditingCompany] = useState<CompanyResponse | null>(null);
  const [formData, setFormData] = useState<UpdateCompanyRequest>({});
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchCompanies();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const userTypeData = localStorage.getItem('userType');
    
    if (!token || userTypeData !== 'company') {
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

  const fetchCompanies = async () => {
    try {
      const response = await companyApi.getAll();
      setCompanies(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: CompanyResponse) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      address: company.address,
      phone: company.phone.toString(),
      email: company.email,
      GST: company.GST,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingCompany) return;

    try {
      await companyApi.update(editingCompany.id, formData);
      await fetchCompanies();
      setIsEditing(false);
      setEditingCompany(null);
      setFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      await companyApi.delete(id);
      await fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingCompany(null);
    setFormData({});
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
                <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
              </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {companies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No companies found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GST
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {company.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {company.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{company.email}</div>
                          <div className="text-sm text-gray-500">{company.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.GST}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(company)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
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

        {isEditing && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={handleCancel}
              ></div>

              <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full z-10">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit Company
                      </h3>
                      
                      <div className="space-y-4">
                        <Input
                          label="Company Name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter company name"
                        />
                        
                        <Input
                          label="Address"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Enter address"
                        />
                        
                        <Input
                          label="Phone"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                        
                        <Input
                          label="Email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email"
                        />
                        
                        <Input
                          label="GST Number"
                          value={formData.GST || ''}
                          onChange={(e) => setFormData({ ...formData, GST: e.target.value })}
                          placeholder="Enter GST number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={handleSave}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
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