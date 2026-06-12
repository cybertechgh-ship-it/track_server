import api from './api';
import type { ApiResponse } from '../types';

export interface OrganizationUnit {
  id: number;
  name: string;
  type: 'headquarters' | 'region' | 'depot' | 'branch' | 'team';
  parentId: number | null;
  managerId: number | null;
  status: 'active' | 'inactive';
  code: string | null;
  location: string | null;
  children?: OrganizationUnit[];
}

export const organizationService = {
  async getAll(): Promise<OrganizationUnit[]> {
    const r = await api.get<ApiResponse<OrganizationUnit[]>>('/organization');
    return r.data.data || [];
  },
  async getTree(): Promise<OrganizationUnit[]> {
    const r = await api.get<ApiResponse<OrganizationUnit[]>>('/organization/tree');
    return r.data.data || [];
  },
  async getById(id: number): Promise<OrganizationUnit> {
    const r = await api.get<ApiResponse<OrganizationUnit>>(`/organization/${id}`);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to fetch');
  },
  async create(data: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
    const r = await api.post<ApiResponse<OrganizationUnit>>('/organization', data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to create');
  },
  async update(id: number, data: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
    const r = await api.put<ApiResponse<OrganizationUnit>>(`/organization/${id}`, data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to update');
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/organization/${id}`);
  },
};
