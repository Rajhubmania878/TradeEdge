import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/shared/types';
import { authService } from '@/services/authService';
import { Input, Select, Button, Table, Tag, Alert, Space, Flex, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface AdminPageProps {
  currentUser: UserProfile;
  onClose: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser, onClose }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'FREE' | 'PRO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await authService.adminGetUsers();
      setUsers(list);
    } catch (err: any) {
      setError(err?.message || 'Admin authorization failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus = !user.isActive;
    const ok = await authService.adminUpdateUserStatus(user.id, nextStatus);
    if (ok) {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, isActive: nextStatus } : u)));
      message.success(`User ${user.email} status updated`);
    }
  };

  const handleChangeRole = async (user: UserProfile, newRole: 'ADMIN' | 'USER') => {
    const ok = await authService.adminUpdateUserRole(user.id, newRole);
    if (ok) {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, role: newRole } : u)));
      message.success(`User role updated to ${newRole}`);
    }
  };

  const handleChangePlan = async (user: UserProfile, newPlan: 'FREE' | 'PRO') => {
    const ok = await authService.adminUpdateUserPlan(user.id, newPlan);
    if (ok) {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, plan: newPlan } : u)));
      message.success(`User plan updated to ${newPlan}`);
    }
  };

  const filteredUsers = users.filter(u => {
    if (
      search &&
      !u.email.toLowerCase().includes(search.toLowerCase()) &&
      !u.displayName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (planFilter !== 'ALL' && u.plan !== planFilter) return false;
    if (statusFilter === 'ACTIVE' && !u.isActive) return false;
    if (statusFilter === 'SUSPENDED' && u.isActive) return false;
    return true;
  });

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-8 text-center space-y-3 font-mono">
        <SafetyCertificateOutlined className="text-4xl text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">ACCESS DENIED · ADMIN ONLY</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          You must hold ADMIN role privileges to access the user control panel.
        </p>
        <Button onClick={onClose} type="primary">
          Return To App
        </Button>
      </div>
    );
  }

  const columns: ColumnsType<UserProfile> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email, record) => (
        <div className="font-mono">
          <div className="font-bold text-slate-900 dark:text-white text-xs">{email}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">{record.displayName}</div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (role, record) => (
        <Select
          size="small"
          value={role}
          onChange={newRole => handleChangeRole(record, newRole)}
          className="w-full font-mono text-xs"
          options={[
            { label: 'ADMIN', value: 'ADMIN' },
            { label: 'USER', value: 'USER' }
          ]}
        />
      )
    },
    {
      title: 'Plan Tier',
      dataIndex: 'plan',
      key: 'plan',
      width: 120,
      render: (plan, record) => (
        <Select
          size="small"
          value={plan}
          onChange={newPlan => handleChangePlan(record, newPlan)}
          className="w-full font-mono text-xs"
          options={[
            { label: 'FREE', value: 'FREE' },
            { label: 'PRO', value: 'PRO' }
          ]}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: isActive => (
        <Tag color={isActive ? 'success' : 'error'} className="font-mono font-bold text-xs m-0">
          {isActive ? 'ACTIVE' : 'SUSPENDED'}
        </Tag>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: d => (
        <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
          {new Date(d).toLocaleDateString()}
        </span>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 130,
      render: (_, record) => (
        <Button
          size="small"
          type={record.isActive ? 'default' : 'primary'}
          danger={record.isActive}
          onClick={() => handleToggleStatus(record)}
          className="font-mono text-xs font-semibold"
        >
          {record.isActive ? 'Suspend' : 'Activate'}
        </Button>
      )
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={12} className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <Flex align="center" gap={12}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-lg font-bold font-mono">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <Title level={4} className="!text-lg !font-extrabold !text-slate-900 dark:!text-white !mb-0 !font-mono !tracking-tight">
                Admin User Management Control Panel
              </Title>
              <Text className="!text-xs !text-slate-500 dark:!text-slate-400">
                Manage all registered terminal users, adjust security roles, and update account subscriptions.
              </Text>
            </div>
          </Flex>

          <Space size={8} align="center">
            <Button
              icon={<ReloadOutlined spin={isLoading} />}
              onClick={fetchUsers}
              className="font-mono text-xs"
            >
              Refresh
            </Button>
            <Button
              onClick={onClose}
              type="primary"
              className="font-mono text-xs font-semibold"
            >
              Close Admin
            </Button>
          </Space>
        </Flex>

        {error && (
          <Alert message={error} type="error" showIcon className="font-mono text-xs" />
        )}

        {/* Filter Controls Bar */}
        <Flex wrap="wrap" gap={12} align="center" justify="space-between" className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <Space size={12} align="center" wrap className="flex-1">
            <Input
              prefix={<SearchOutlined className="text-slate-400 mr-1" />}
              placeholder="Search user email or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              className="font-mono text-xs w-full sm:w-[240px]"
              size="small"
            />

            <Select
              size="small"
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 120 }}
              options={[
                { label: 'All Roles', value: 'ALL' },
                { label: 'ADMIN Only', value: 'ADMIN' },
                { label: 'USER Only', value: 'USER' }
              ]}
            />

            <Select
              size="small"
              value={planFilter}
              onChange={setPlanFilter}
              style={{ width: 120 }}
              options={[
                { label: 'All Plans', value: 'ALL' },
                { label: 'FREE Plan', value: 'FREE' },
                { label: 'PRO Plan', value: 'PRO' }
              ]}
            />

            <Select
              size="small"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 130 }}
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'ACTIVE Only', value: 'ACTIVE' },
                { label: 'SUSPENDED Only', value: 'SUSPENDED' }
              ]}
            />
          </Space>

          <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
            Showing <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> of {users.length} users
          </span>
        </Flex>

        {/* Ant Design Table */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <Table
            dataSource={filteredUsers}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10, size: 'small' }}
            size="small"
            scroll={{ x: 800 }}
          />
        </div>
      </div>
    </div>
  );
};
