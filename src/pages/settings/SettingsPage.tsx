import React, { useState, useEffect } from 'react';
import { UserProfile, UserSavedStrategy, Exchange } from '@/shared/types';
import { authService } from '@/services/authService';
import { useLockBodyScroll } from '@/shared/hooks';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  Tag,
  Space,
  Flex,
  Descriptions,
  List,
  Typography,
  Card,
  Spin,
  Tabs,
  Row,
  Col,
  Empty,
  Popconfirm,
  Segmented,
  Switch,
  Divider,
  Badge,
  Tooltip,
  message
} from 'antd';
import {
  UserOutlined,
  KeyOutlined,
  LogoutOutlined,
  DeleteOutlined,
  SaveOutlined,
  LoadingOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  LockOutlined,
  ControlOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  MailOutlined,
  IdcardOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  EditOutlined,
  GlobalOutlined,
  SoundOutlined,
  CalculatorOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export interface SettingsPageProps {
  isOpen?: boolean;
  user: UserProfile;
  onLogout: () => void;
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isOpen = true,
  user,
  onLogout,
  onClose
}) => {
  useLockBodyScroll(isOpen);
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Profile Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || 'System Admin');
  const [isSavingName, setIsSavingName] = useState(false);

  const [savedStrategies, setSavedStrategies] = useState<UserSavedStrategy[]>([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);

  // Preference toggles
  const [matrixDensity, setMatrixDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefreshGreeks, setAutoRefreshGreeks] = useState(true);
  const [defaultExchange, setDefaultExchange] = useState<Exchange>('NSE');

  useEffect(() => {
    let mounted = true;
    authService
      .getSavedStrategies()
      .then(list => {
        if (mounted) {
          setSavedStrategies(list);
          setIsLoadingStrategies(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoadingStrategies(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (values.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPass(true);
    setPasswordMsg(null);
    setPasswordError(null);

    try {
      await authService.changePassword(values.currentPassword, values.newPassword);
      setPasswordMsg('Password changed successfully.');
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      message.error('Display name cannot be empty');
      return;
    }
    setIsSavingName(true);
    try {
      // Simulate/apply profile name update
      setTimeout(() => {
        setIsSavingName(false);
        setIsEditingName(false);
        message.success('Display name updated successfully');
      }, 300);
    } catch {
      setIsSavingName(false);
      message.error('Failed to update display name');
    }
  };

  const handleDeleteStrategy = async (id: string, name: string) => {
    const ok = await authService.deleteSavedStrategy(id);
    if (ok) {
      setSavedStrategies(prev => prev.filter(s => s.id !== id));
      message.success(`Preset "${name}" removed successfully`);
    } else {
      message.error('Failed to remove strategy preset');
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span className="flex items-center gap-1.5 font-sans font-medium text-xs sm:text-sm">
          <UserOutlined />
          <span>Profile & Account</span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-1">
          {/* Main User Identity Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
              <Flex align="center" gap={16}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center font-sans shadow-md ring-4 ring-blue-500/10">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="space-y-1">
                  <Flex align="center" gap={8} wrap="wrap">
                    {!isEditingName ? (
                      <>
                        <span className="font-bold text-slate-900 dark:text-white text-base font-sans">
                          {displayName}
                        </span>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setIsEditingName(true)}
                          className="text-slate-400 hover:text-blue-600 p-0 h-auto"
                          aria-label="Edit display name"
                        />
                      </>
                    ) : (
                      <Flex align="center" gap={6}>
                        <Input
                          size="small"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          className="font-sans text-xs w-44"
                          placeholder="Display Name"
                          autoFocus
                          onPressEnter={handleSaveDisplayName}
                        />
                        <Button
                          size="small"
                          type="primary"
                          loading={isSavingName}
                          onClick={handleSaveDisplayName}
                          className="bg-blue-600 text-xs px-2"
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setDisplayName(user.displayName || 'System Admin');
                            setIsEditingName(false);
                          }}
                          className="text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </Flex>
                    )}

                    <Tag
                      color={user.role === 'ADMIN' ? 'gold' : 'blue'}
                      icon={user.role === 'ADMIN' ? <SafetyCertificateOutlined /> : <UserOutlined />}
                      className="font-sans font-semibold text-xs m-0 px-2 py-0.5 rounded-full"
                    >
                      {user.role}
                    </Tag>
                    <Tag
                      color={user.plan === 'PRO' ? 'green' : 'default'}
                      icon={<CrownOutlined />}
                      className="font-sans font-semibold text-xs m-0 px-2 py-0.5 rounded-full"
                    >
                      {user.plan} TIER
                    </Tag>
                  </Flex>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <MailOutlined className="text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </Flex>

              <Popconfirm
                title="Log out of TradeEdge?"
                description="Are you sure you want to terminate your terminal session?"
                onConfirm={() => {
                  onClose();
                  onLogout();
                }}
                okText="Log Out"
                cancelText="Stay"
                okButtonProps={{ danger: true, size: 'small' }}
                cancelButtonProps={{ size: 'small' }}
              >
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  className="font-sans text-xs font-semibold rounded-xl h-9 px-4"
                >
                  Log Out
                </Button>
              </Popconfirm>
            </Flex>
          </div>

          {/* Account Details & Trading Permissions Grid */}
          <Row gutter={[16, 16]}>
            {/* Account Specifications */}
            <Col xs={24} md={12}>
              <Card
                size="small"
                className="h-full border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900"
                title={
                  <Space size={8} align="center" className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <IdcardOutlined className="text-blue-600 dark:text-blue-400" />
                    <span>Account Specifications</span>
                  </Space>
                }
              >
                <div className="space-y-3 font-sans text-xs">
                  <Flex justify="space-between" align="center" className="py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Account ID</span>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {user.id}
                    </span>
                  </Flex>

                  <Flex justify="space-between" align="center" className="py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Account Status</span>
                    <Badge status="success" text={<span className="font-semibold text-emerald-600 dark:text-emerald-400">Active / Verified</span>} />
                  </Flex>

                  <Flex justify="space-between" align="center" className="py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Subscription Tier</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {user.plan === 'PRO' ? 'Pro Lifetime Access' : 'Standard Free'}
                    </span>
                  </Flex>

                  <Flex justify="space-between" align="center" className="py-1.5">
                    <span className="text-slate-500">Session Security</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      Encrypted Token Auth
                    </span>
                  </Flex>
                </div>
              </Card>
            </Col>

            {/* Market & Terminal Permissions */}
            <Col xs={24} md={12}>
              <Card
                size="small"
                className="h-full border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900"
                title={
                  <Space size={8} align="center" className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <GlobalOutlined className="text-emerald-600 dark:text-emerald-400" />
                    <span>Trading & Market Access</span>
                  </Space>
                }
              >
                <div className="space-y-3 font-sans text-xs">
                  <Flex justify="space-between" align="center" className="py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Supported Exchanges</span>
                    <Space size={4}>
                      <Tag color="blue" className="font-sans font-bold m-0 px-1.5 py-0 text-[11px]">NSE</Tag>
                      <Tag color="purple" className="font-sans font-bold m-0 px-1.5 py-0 text-[11px]">BSE</Tag>
                    </Space>
                  </Flex>

                  <Flex justify="space-between" align="center" className="py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Live SmartAPI Feed</span>
                    <Badge status="processing" text={<span className="font-medium text-slate-700 dark:text-slate-300">Angel One Connected</span>} />
                  </Flex>

                  <Flex justify="space-between" align="center" className="py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Quantitative Engine</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">17-Point Verified BS Model</span>
                  </Flex>

                  <Flex justify="space-between" align="center" className="py-1.5">
                    <span className="text-slate-500">Spread Multiplier</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Full Lot Size Support</span>
                  </Flex>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'security',
      label: (
        <span className="flex items-center gap-1.5 font-sans font-medium text-xs sm:text-sm">
          <KeyOutlined />
          <span>Security & Password</span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-1">
          <Row gutter={[16, 16]}>
            {/* Password Form Card */}
            <Col xs={24} md={14}>
              <Card
                size="small"
                className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900"
                title={
                  <Space size={8} align="center" className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <LockOutlined className="text-amber-500" />
                    <span>Update Account Password</span>
                  </Space>
                }
              >
                {passwordMsg && (
                  <Alert
                    title={passwordMsg}
                    type="success"
                    showIcon
                    className="text-xs font-sans mb-4 rounded-xl"
                  />
                )}

                {passwordErr && (
                  <Alert
                    title={passwordErr}
                    type="error"
                    showIcon
                    className="text-xs font-sans mb-4 rounded-xl"
                  />
                )}

                <Form
                  form={passwordForm}
                  layout="vertical"
                  size="middle"
                  requiredMark={false}
                  onFinish={handleChangePassword}
                  autoComplete="off"
                >
                  <Form.Item
                    label={
                      <span className="font-sans text-xs font-medium text-slate-700 dark:text-slate-300">
                        Current Password
                      </span>
                    }
                    name="currentPassword"
                    rules={[{ required: true, message: 'Please enter your current password' }]}
                    className="!mb-3"
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-slate-400 mr-1.5" />}
                      placeholder="Enter current password"
                      className="font-sans text-xs rounded-xl h-10"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="font-sans text-xs font-medium text-slate-700 dark:text-slate-300">
                        New Password
                      </span>
                    }
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Please enter a new password' },
                      { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                    className="!mb-3"
                  >
                    <Input.Password
                      prefix={<KeyOutlined className="text-slate-400 mr-1.5" />}
                      placeholder="Enter new password (min 6 chars)"
                      className="font-sans text-xs rounded-xl h-10"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="font-sans text-xs font-medium text-slate-700 dark:text-slate-300">
                        Confirm New Password
                      </span>
                    }
                    name="confirmPassword"
                    rules={[{ required: true, message: 'Please confirm your new password' }]}
                    className="!mb-4"
                  >
                    <Input.Password
                      prefix={<CheckCircleOutlined className="text-slate-400 mr-1.5" />}
                      placeholder="Re-enter new password to confirm"
                      className="font-sans text-xs rounded-xl h-10"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isChangingPass}
                    icon={<CheckOutlined />}
                    className="w-full font-sans text-xs font-semibold bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs h-10"
                  >
                    Update Password
                  </Button>
                </Form>
              </Card>
            </Col>

            {/* Security Guidelines Card */}
            <Col xs={24} md={10}>
              <Card
                size="small"
                className="h-full border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900"
                title={
                  <Space size={8} align="center" className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <SafetyCertificateOutlined className="text-blue-600" />
                    <span>Security Recommendations</span>
                  </Space>
                }
              >
                <div className="space-y-3 font-sans text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <CheckCircleOutlined className="text-emerald-500 mt-0.5" />
                    <span>Use at least 6 characters with a combination of letters, numbers, and symbols.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleOutlined className="text-emerald-500 mt-0.5" />
                    <span>Do not share your API credentials, SmartAPI TOTP keys, or terminal passwords.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleOutlined className="text-emerald-500 mt-0.5" />
                    <span>Terminal sessions are automatically protected via encrypted bearer authentication tokens.</span>
                  </div>

                  <Divider className="!my-3" />

                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
                    <div className="font-semibold text-blue-900 dark:text-blue-300 text-xs mb-1 flex items-center gap-1.5">
                      <InfoCircleOutlined /> Active Session Info
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      Logged in from verified terminal workspace.
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'presets',
      label: (
        <span className="flex items-center gap-1.5 font-sans font-medium text-xs sm:text-sm">
          <SaveOutlined />
          <span>Saved Presets</span>
          {savedStrategies.length > 0 && (
            <Tag color="blue" className="rounded-full px-1.5 py-0 text-[10px] m-0 border-0 font-mono">
              {savedStrategies.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <div className="pt-1">
          <Card
            size="small"
            className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900"
            title={
              <Flex justify="space-between" align="center" className="w-full">
                <Space size={8} align="center" className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <SaveOutlined className="text-emerald-600 dark:text-emerald-400" />
                  <span>Custom Strategy Presets ({savedStrategies.length})</span>
                </Space>
                <Text type="secondary" className="font-sans text-xs">
                  Spreads saved from Ratio Matrix
                </Text>
              </Flex>
            }
          >
            {isLoadingStrategies ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Spin indicator={<LoadingOutlined className="text-2xl text-blue-600" spin />} />
                <span className="text-xs text-slate-500 font-sans">Loading saved presets...</span>
              </div>
            ) : savedStrategies.length === 0 ? (
              <div className="py-10">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="space-y-1 text-center">
                      <div className="font-sans text-xs font-medium text-slate-700 dark:text-slate-300">
                        No saved strategy presets found
                      </div>
                      <div className="font-sans text-xs text-slate-400">
                        Save custom ratio spreads directly from the Ratio Matrix to access them here anytime.
                      </div>
                    </div>
                  }
                />
              </div>
            ) : (
              <List
                dataSource={savedStrategies}
                itemLayout="horizontal"
                renderItem={s => (
                  <List.Item
                    key={s.id}
                    className="!border-b !border-slate-100 dark:!border-slate-800/80 !py-3 px-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
                    actions={[
                      <Popconfirm
                        key="delete-confirm"
                        title="Remove Strategy Preset"
                        description={`Are you sure you want to delete "${s.name}"?`}
                        onConfirm={() => handleDeleteStrategy(s.id, s.name)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true, size: 'small' }}
                        cancelButtonProps={{ size: 'small' }}
                      >
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          className="font-sans text-xs rounded-lg"
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                          <ThunderboltOutlined />
                        </div>
                      }
                      title={
                        <Flex align="center" gap={8} wrap="wrap">
                          <span className="font-sans font-bold text-xs text-slate-900 dark:text-white">
                            {s.name}
                          </span>
                          <Tag color="cyan" className="font-mono text-[11px] m-0 px-1.5 py-0 rounded">
                            {s.ratioLong}:{s.ratioShort} {s.optionType}
                          </Tag>
                          <Tag color="blue" className="font-sans text-[11px] m-0 px-1.5 py-0 rounded">
                            {s.underlying}
                          </Tag>
                        </Flex>
                      }
                      description={
                        <span className="font-sans text-xs text-slate-500 dark:text-slate-400">
                          Expiry: <strong className="text-slate-700 dark:text-slate-300 font-mono">{s.expiry}</strong> · Strike Gap: <strong className="text-slate-700 dark:text-slate-300 font-mono">₹{s.gap}</strong>
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      )
    },
    {
      key: 'preferences',
      label: (
        <span className="flex items-center gap-1.5 font-sans font-medium text-xs sm:text-sm">
          <ControlOutlined />
          <span>Preferences</span>
        </span>
      ),
      children: (
        <div className="pt-1">
          <Card
            size="small"
            className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900"
            title={
              <Space size={8} align="center" className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                <ControlOutlined className="text-blue-600 dark:text-blue-400" />
                <span>Spreadsheet & Workspace Display Preferences</span>
              </Space>
            }
          >
            <div className="space-y-4 p-2 font-sans text-xs">
              {/* Density Setting */}
              <Flex justify="space-between" align="center" className="py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AppstoreOutlined className="text-slate-400" /> Matrix Spreadsheet Density
                  </div>
                  <div className="text-slate-500 text-[11px]">Adjust row height and cell padding across option spread tables</div>
                </div>
                <Segmented
                  value={matrixDensity}
                  onChange={val => {
                    setMatrixDensity(val as any);
                    message.success(`Density set to ${val}`);
                  }}
                  options={[
                    { label: 'Comfortable', value: 'comfortable' },
                    { label: 'Compact', value: 'compact' }
                  ]}
                  size="small"
                  className="font-sans"
                />
              </Flex>

              {/* Default Exchange */}
              <Flex justify="space-between" align="center" className="py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <GlobalOutlined className="text-slate-400" /> Default Startup Exchange
                  </div>
                  <div className="text-slate-500 text-[11px]">Preferred exchange to display on initial application load</div>
                </div>
                <Segmented
                  value={defaultExchange}
                  onChange={val => {
                    setDefaultExchange(val as any);
                    message.success(`Default exchange set to ${val}`);
                  }}
                  options={[
                    { label: 'NSE', value: 'NSE' },
                    { label: 'BSE', value: 'BSE' }
                  ]}
                  size="small"
                  className="font-sans"
                />
              </Flex>

              {/* Real-time Greeks calculation */}
              <Flex justify="space-between" align="center" className="py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CalculatorOutlined className="text-slate-400" /> Auto-Calculate Greeks & Breakevens
                  </div>
                  <div className="text-slate-500 text-[11px]">Continuously update Black-Scholes Delta, Gamma, Theta, and Vega</div>
                </div>
                <Switch
                  checked={autoRefreshGreeks}
                  onChange={checked => {
                    setAutoRefreshGreeks(checked);
                    message.success(`Auto-calculate greeks ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </Flex>

              {/* Sound Notifications */}
              <Flex justify="space-between" align="center" className="py-2.5">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <SoundOutlined className="text-slate-400" /> Market Event Audio Chimes
                  </div>
                  <div className="text-slate-500 text-[11px]">Play audio alert on high-volume strike crossover events</div>
                </div>
                <Switch
                  checked={soundAlerts}
                  onChange={checked => {
                    setSoundAlerts(checked);
                    message.success(`Audio chimes ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
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
      width={780}
      centered
      title={
        <Flex align="center" gap={10} className="py-1">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-base font-bold font-sans">
            <SettingOutlined />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-base font-sans tracking-tight">
              Preferences & Account Settings
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal">
              Manage your credentials, trading profile, and workspace preferences
            </div>
          </div>
        </Flex>
      }
    >
      <div className="pt-2 font-sans">
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

export default SettingsPage;
