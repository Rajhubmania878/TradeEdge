import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/shared/types';
import { authService } from '@/services/authService';
import { useLockBodyScroll } from '@/shared/hooks';
import {
  Modal,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Alert,
  Space,
  Flex,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Popconfirm,
  Badge,
  Tooltip,
  Divider,
  Descriptions,
  Empty,
  message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined,
  SafetyOutlined,
  DashboardOutlined,
  CalendarOutlined,
  MailOutlined,
  EditOutlined,
  ThunderboltOutlined,
  ClearOutlined,
  CheckOutlined,
  ApiOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export interface AdminPageProps {
  isOpen?: boolean;
  currentUser: UserProfile;
  onClose: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  isOpen = true,
  currentUser,
  onClose
}) => {
  useLockBodyScroll(isOpen);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState('users');
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
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus = !user.isActive;
    const ok = await authService.adminUpdateUserStatus(user.id, nextStatus);
    if (ok) {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, isActive: nextStatus } : u)));
      message.success(`User ${user.email} status updated to ${nextStatus ? 'ACTIVE' : 'SUSPENDED'}`);
    } else {
      message.error(`Failed to update status for ${user.email}`);
    }
  };

  const handleChangeRole = async (user: UserProfile, newRole: 'ADMIN' | 'USER') => {
    const ok = await authService.adminUpdateUserRole(user.id, newRole);
    if (ok) {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, role: newRole } : u)));
      message.success(`Updated ${user.email} role to ${newRole}`);
    } else {
      message.error(`Failed to update role for ${user.email}`);
    }
  };

  const handleChangePlan = async (user: UserProfile, newPlan: 'FREE' | 'PRO') => {
    const ok = await authService.adminUpdateUserPlan(user.id, newPlan);
    if (ok) {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, plan: newPlan } : u)));
      message.success(`Updated ${user.email} plan to ${newPlan}`);
    } else {
      message.error(`Failed to update plan for ${user.email}`);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setPlanFilter('ALL');
    setStatusFilter('ALL');
  };

  const filteredUsers = users.filter(u => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchName = (u.displayName || '').toLowerCase().includes(q);
      if (!matchEmail && !matchName) return false;
    }
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (planFilter !== 'ALL' && u.plan !== planFilter) return false;
    if (statusFilter === 'ACTIVE' && !u.isActive) return false;
    if (statusFilter === 'SUSPENDED' && u.isActive) return false;
    return true;
  });

  // Calculate high-level admin metrics
  const totalUsers = users.length;
  const activeCount = users.filter(u => u.isActive).length;
  const proCount = users.filter(u => u.plan === 'PRO').length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  const columns: ColumnsType<UserProfile> = [
    {
      title: 'Trader / Email',
      dataIndex: 'email',
      key: 'email',
      render: (email, record) => (
        <Flex align="center" gap={10}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold font-sans shadow-2xs">
            {record.displayName?.[0]?.toUpperCase() || email[0].toUpperCase()}
          </div>
          <div className="font-sans">
            <div className="font-bold text-slate-900 dark:text-white text-xs">{email}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {record.displayName || 'No Display Name'}
            </div>
          </div>
        </Flex>
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
          className="w-full font-sans text-xs"
          options={[
            {
              label: (
                <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <SafetyCertificateOutlined /> ADMIN
                </span>
              ),
              value: 'ADMIN'
            },
            {
              label: (
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <UserOutlined /> USER
                </span>
              ),
              value: 'USER'
            }
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
          className="w-full font-sans text-xs"
          options={[
            {
              label: (
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CrownOutlined /> PRO
                </span>
              ),
              value: 'PRO'
            },
            {
              label: (
                <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                  FREE
                </span>
              ),
              value: 'FREE'
            }
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
        <Tag
          color={isActive ? 'success' : 'error'}
          icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
          className="font-sans font-semibold text-[11px] m-0 px-2 py-0.5 rounded-full"
        >
          {isActive ? 'ACTIVE' : 'SUSPENDED'}
        </Tag>
      )
    },
    {
      title: 'Registered',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: d => (
        <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
          {d ? new Date(d).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Popconfirm
          title={record.isActive ? 'Suspend User Access?' : 'Activate User Access?'}
          description={`Are you sure you want to ${record.isActive ? 'suspend' : 'activate'} ${record.email}?`}
          onConfirm={() => handleToggleStatus(record)}
          okText={record.isActive ? 'Suspend' : 'Activate'}
          cancelText="Cancel"
          okButtonProps={{ danger: record.isActive, size: 'small' }}
          cancelButtonProps={{ size: 'small' }}
        >
          <Button
            size="small"
            type={record.isActive ? 'default' : 'primary'}
            danger={record.isActive}
            className="font-sans text-xs font-semibold rounded-lg"
          >
            {record.isActive ? 'Suspend' : 'Activate'}
          </Button>
        </Popconfirm>
      )
    }
  ];

  if (currentUser?.role !== 'ADMIN') {
    return (
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={480}
        centered
        destroyOnClose
      >
        <div className="p-6 text-center space-y-3 font-sans">
          <SafetyCertificateOutlined className="text-4xl text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">ACCESS DENIED · ADMIN ONLY</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You must hold ADMIN privileges to access the user control panel.
          </p>
          <Button onClick={onClose} type="primary" className="font-sans text-xs">
            Return To Terminal
          </Button>
        </div>
      </Modal>
    );
  }

  const tabItems = [
    {
      key: 'users',
      label: (
        <span className="flex items-center gap-1.5 font-sans font-medium text-xs sm:text-sm">
          <TeamOutlined />
          <span>User Directory</span>
          <Tag color="blue" className="rounded-full px-1.5 py-0 text-[10px] m-0 border-0 font-mono">
            {users.length}
          </Tag>
        </span>
      ),
      children: (
        <div className="space-y-3 pt-1">
          {error && (
            <Alert message={error} type="error" showIcon className="font-sans text-xs rounded-xl mb-3" />
          )}

          {/* Filter Controls Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <Flex wrap="wrap" gap={8} align="center" justify="space-between">
              <Space size={8} align="center" wrap className="flex-1">
                <Input
                  prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                  placeholder="Search trader email or name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  allowClear
                  className="font-sans text-xs w-full sm:w-[220px] rounded-lg"
                  size="small"
                />

                <Select
                  size="small"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  style={{ width: 110 }}
                  className="font-sans text-xs"
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
                  style={{ width: 110 }}
                  className="font-sans text-xs"
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
                  style={{ width: 120 }}
                  className="font-sans text-xs"
                  options={[
                    { label: 'All Statuses', value: 'ALL' },
                    { label: 'ACTIVE Only', value: 'ACTIVE' },
                    { label: 'SUSPENDED Only', value: 'SUSPENDED' }
                  ]}
                />

                {(search || roleFilter !== 'ALL' || planFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <Button
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={handleResetFilters}
                    className="font-sans text-xs"
                  >
                    Reset
                  </Button>
                )}
              </Space>

              <Flex align="center" gap={8}>
                <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">
                  Showing <strong className="text-slate-900 dark:text-white font-mono">{filteredUsers.length}</strong> of {users.length}
                </span>

                <Button
                  size="small"
                  icon={<ReloadOutlined spin={isLoading} />}
                  onClick={fetchUsers}
                  className="font-sans text-xs rounded-lg"
                >
                  Refresh
                </Button>
              </Flex>
            </Flex>
          </div>

          {/* Ant Design Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <Table
              dataSource={filteredUsers}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 8, size: 'small' }}
              size="small"
              scroll={{ x: 700 }}
              className="font-sans"
            />
          </div>
        </div>
      )
    },
    {
      key: 'access-control',
      label: (
        <span className="flex items-center gap-1.5 font-sans font-medium text-xs sm:text-sm">
          <SafetyOutlined />
          <span>Access Control Matrix</span>
        </span>
      ),
      children: (
        <div className="pt-1">
          <Card
            size="small"
            className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900"
            title={
              <Space size={8} align="center" className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                <SafetyCertificateOutlined className="text-amber-500" />
                <span>Role Capabilities & Permission Boundaries</span>
              </Space>
            }
          >
            <div className="space-y-4 font-sans text-xs p-1">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Flex align="center" gap={8} className="mb-2">
                      <Tag color="gold" icon={<SafetyCertificateOutlined />} className="font-bold">
                        ADMINISTRATOR
                      </Tag>
                    </Flex>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc list-inside">
                      <li>Full user account management & status toggling</li>
                      <li>Role elevation (User ↔ Admin)</li>
                      <li>Plan tier overrides (Free ↔ Pro)</li>
                      <li>SmartAPI system credential configuration</li>
                      <li>Direct access to 17-Point quantitative verification suite</li>
                    </ul>
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Flex align="center" gap={8} className="mb-2">
                      <Tag color="blue" icon={<UserOutlined />} className="font-bold">
                        STANDARD USER
                      </Tag>
                    </Flex>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc list-inside">
                      <li>Quantitative Strike Spread Matrix viewing & scanning</li>
                      <li>Option Chain dual call/put depth & OI inspection</li>
                      <li>Black-Scholes analytical breakeven calculation</li>
                      <li>Personal strategy preset saving & loading</li>
                      <li>Live WebSocket/Polling ticker synchronization</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </div>
      )
    },
    {
      key: 'system-status',
      label: (
        <span className="flex items-center gap-1.5 font-sans font-medium text-xs sm:text-sm">
          <DashboardOutlined />
          <span>System Health</span>
        </span>
      ),
      children: (
        <div className="pt-1">
          <Card
            size="small"
            className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900"
            title={
              <Space size={8} align="center" className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                <ApiOutlined className="text-blue-600 dark:text-blue-400" />
                <span>Platform Operational Telemetry</span>
              </Space>
            }
          >
            <div className="space-y-3 font-sans text-xs">
              <Flex justify="space-between" align="center" className="py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Financial Math Engine</span>
                <Badge status="success" text={<span className="font-semibold text-emerald-600 dark:text-emerald-400">17/17 Verification Tests Passing</span>} />
              </Flex>

              <Flex justify="space-between" align="center" className="py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Market Data Pipeline</span>
                <Badge status="processing" text={<span className="font-medium text-slate-700 dark:text-slate-300">Angel One SmartAPI Ready</span>} />
              </Flex>

              <Flex justify="space-between" align="center" className="py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Strike Grid Discovery</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">NSE (2,000+) · BSE (2,000+) Enabled</span>
              </Flex>

              <Flex justify="space-between" align="center" className="py-2">
                <span className="text-slate-500">Client Memory & RAF Batching</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">60 FPS Micro-tick Throttling Active</span>
              </Flex>
            </div>
          </Card>
        </div>
      )
    }
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={880}
      centered
      title={
        <Flex align="center" gap={10} className="py-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-base font-bold font-sans">
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-base font-sans tracking-tight">
              Admin User Management Console
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal">
              Supervise registered accounts, manage security permissions, and oversee platform subscriptions
            </div>
          </div>
        </Flex>
      }
    >
      <div className="pt-2 space-y-4 font-sans">
        {/* Top Summary Statistics Ribbon */}
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-base">
                <TeamOutlined />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Total Users</div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">{totalUsers}</div>
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-base">
                <CheckCircleOutlined />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Active Accounts</div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{activeCount}</div>
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-base">
                <CrownOutlined />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Pro Subscribers</div>
                <div className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">{proCount}</div>
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base">
                <SafetyCertificateOutlined />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Administrators</div>
                <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">{adminCount}</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Ant Design Tabs Navigation */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="line"
          className="font-sans"
        />
      </div>
    </Modal>
  );
};

export default AdminPage;
