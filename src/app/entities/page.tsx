"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "customer" | "business">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  
  const [createFormData, setCreateFormData] = useState<CreateEntityRequest>({
    name: '',
    type: 'customer',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    panNumber: '',
    contactPerson: '',
    creditLimit: 0,
    paymentTerms: '',
    notes: '',
    status: 'active'
  });
  
  const [editFormData, setEditFormData] = useState<UpdateEntityRequest>({});
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchEntities();
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

  const fetchEntities = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/entities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEntities(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch entities');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntity = async () => {
    try {
      setError('');
      
      // Clean up form data - remove empty strings for optional fields
      const cleanedFormData = {
        ...createFormData,
        email: createFormData.email || undefined,
        phone: createFormData.phone || undefined,
        address: createFormData.address || undefined,
        gstNumber: createFormData.gstNumber || undefined,
        panNumber: createFormData.panNumber || undefined,
        contactPerson: createFormData.contactPerson || undefined,
        paymentTerms: createFormData.paymentTerms || undefined,
        notes: createFormData.notes || undefined,
      };
      
      const response = await fetch('http://localhost:5000/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanedFormData)
      });

      if (response.ok) {
        await fetchEntities();
        setShowCreateForm(false);
        setCreateFormData({
          name: '',
          type: 'customer',
          email: '',
          phone: '',
          address: '',
          gstNumber: '',
          panNumber: '',
          contactPerson: '',
          creditLimit: 0,
          paymentTerms: '',
          notes: '',
          status: 'active'
        });
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create entity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    }
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setEditFormData({
      name: entity.name,
      type: entity.type,
      email: entity.email || '',
      phone: entity.phone || '',
      address: entity.address || '',
      gstNumber: entity.gstNumber || '',
      panNumber: entity.panNumber || '',
      contactPerson: entity.contactPerson || '',
      creditLimit: entity.creditLimit || 0,
      paymentTerms: entity.paymentTerms || '',
      notes: entity.notes || '',
      status: entity.status
    });
    setError('');
  };

  const handleUpdateEntity = async () => {
    if (!editingEntity) return;

    try {
      setError('');
      
      // Clean up form data - remove empty strings for optional fields
      const cleanedFormData = {
        ...editFormData,
        email: editFormData.email || undefined,
        phone: editFormData.phone || undefined,
        address: editFormData.address || undefined,
        gstNumber: editFormData.gstNumber || undefined,
        panNumber: editFormData.panNumber || undefined,
        contactPerson: editFormData.contactPerson || undefined,
        paymentTerms: editFormData.paymentTerms || undefined,
        notes: editFormData.notes || undefined,
      };
      
      const response = await fetch(`http://localhost:5000/entities/${editingEntity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanedFormData)
      });

      if (response.ok) {
        await fetchEntities();
        setEditingEntity(null);
        setEditFormData({});
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update entity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    }
  };

  const handleDeleteEntity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;

    try {
      setError('');
      const response = await fetch(`http://localhost:5000/entities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchEntities();
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete entity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    }
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.phone?.includes(searchTerm);
    const matchesType = filterType === "all" || entity.type === filterType;
    const matchesStatus = filterStatus === "all" || entity.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Entity Management</h1>
                  <p className="text-gray-600">Manage customers and business partners</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                  Add Entity
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as "all" | "customer" | "business")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Types</option>
                      <option value="customer">Customers</option>
                      <option value="business">Businesses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterType("all");
                        setFilterStatus("all");
                      }}
                      className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {filteredEntities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No entities found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type & Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credit Limit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEntities.map((entity) => (
                        <tr key={entity._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {entity.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {entity._id.slice(-6)}
                            </div>
                            {entity.type === 'business' && entity.gstNumber && (
                              <div className="text-sm text-gray-500">
                                GST: {entity.gstNumber}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{entity.email || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{entity.phone || 'N/A'}</div>
                            {entity.type === 'business' && entity.contactPerson && (
                              <div className="text-sm text-gray-500">
                                Contact: {entity.contactPerson}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entity.type === 'business' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {entity.type}
                            </span>
                            <br />
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                              entity.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {entity.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ₹{entity.creditLimit?.toLocaleString() || 0}
                            </div>
                            {entity.paymentTerms && (
                              <div className="text-sm text-gray-500">
                                {entity.paymentTerms}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditEntity(entity)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEntity(entity._id)}
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

          {/* Create Entity Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                <div 
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                  aria-hidden="true"
                  onClick={() => setShowCreateForm(false)}
                ></div>

                <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full z-10">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                          Create New Entity
                        </h3>
                        
                        {error && (
                          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <p>{error}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                              type="text"
                              required
                              value={createFormData.name}
                              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                              value={createFormData.type}
                              onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value as "customer" | "business" })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="customer">Customer</option>
                              <option value="business">Business</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={createFormData.email}
                              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter email"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={createFormData.phone}
                              onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter phone"
                            />
                          </div>
                          
                          {createFormData.type === "business" && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                <input
                                  type="text"
                                  value={createFormData.gstNumber}
                                  onChange={(e) => setCreateFormData({ ...createFormData, gstNumber: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Enter GST number"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                <input
                                  type="text"
                                  value={createFormData.contactPerson}
                                  onChange={(e) => setCreateFormData({ ...createFormData, contactPerson: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Enter contact person"
                                />
                              </div>
                            </>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={createFormData.creditLimit}
                              onChange={(e) => setCreateFormData({ ...createFormData, creditLimit: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter credit limit"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={createFormData.status}
                              onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value as "active" | "inactive" })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                              value={createFormData.address}
                              onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter address"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={handleCreateEntity}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Create Entity
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Entity Modal */}
          {editingEntity && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                <div 
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                  aria-hidden="true"
                  onClick={() => setEditingEntity(null)}
                ></div>

                <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full z-10">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                          Edit Entity
                        </h3>
                        
                        {error && (
                          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <p>{error}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={editFormData.name || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                              value={editFormData.type || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as "customer" | "business" })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="customer">Customer</option>
                              <option value="business">Business</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={editFormData.email || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter email"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={editFormData.phone || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter phone"
                            />
                          </div>
                          
                          {editFormData.type === "business" && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                <input
                                  type="text"
                                  value={editFormData.gstNumber || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Enter GST number"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                <input
                                  type="text"
                                  value={editFormData.contactPerson || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Enter contact person"
                                />
                              </div>
                            </>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editFormData.creditLimit || 0}
                              onChange={(e) => setEditFormData({ ...editFormData, creditLimit: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter credit limit"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={editFormData.status || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as "active" | "inactive" })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                              value={editFormData.address || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter address"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={handleUpdateEntity}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Update Entity
                    </button>
                    <button
                      onClick={() => setEditingEntity(null)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
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