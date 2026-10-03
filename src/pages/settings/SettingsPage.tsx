import React, { useState, useEffect } from 'react';
import { UserProfile, UserSavedStrategy } from '@/shared/types';
import { authService } from '@/services/authService';
import {
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
  message
} from 'antd';
import {
  UserOutlined,
  KeyOutlined,
  LogoutOutlined,
  DeleteOutlined,
  SaveOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SettingsPageProps {
  user: UserProfile;
  onLogout: () => void;
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onLogout,
  onClose
}) => {
  const [form] = Form.useForm();
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [savedStrategies, setSavedStrategies] = useState<UserSavedStrategy[]>([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);

  useEffect(() => {
    let mounted = true;
    authService.getSavedStrategies().then(list => {
      if (mounted) {
        setSavedStrategies(list);
        setIsLoadingStrategies(false);
      }
    }).catch(() => {
      if (mounted) setIsLoadingStrategies(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    setIsChangingPass(true);
    setPasswordMsg(null);
    setPasswordError(null);

    try {
      await authService.changePassword(values.currentPassword, values.newPassword);
      setPasswordMsg('Password changed successfully.');
      message.success('Password updated successfully');
      form.resetFields();
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    const ok = await authService.deleteSavedStrategy(id);
    if (ok) {
      setSavedStrategies(prev => prev.filter(s => s.id !== id));
      message.success('Strategy preset removed');
    }
  };

  const profileDescriptions = [
    {
      key: '1',
      label: <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold">Email Address</span>,
      children: <span className="text-slate-900 dark:text-slate-100 font-mono font-bold text-xs">{user.email}</span>,
      span: 3
    },
    {
      key: '2',
      label: <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold">Display Name</span>,
      children: <span className="text-slate-800 dark:text-slate-200 font-mono text-xs">{user.displayName}</span>,
      span: 3
    },
    {
      key: '3',
      label: <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold">System Role</span>,
      children: (
        <Tag color={user.role === 'ADMIN' ? 'gold' : 'blue'} className="font-mono font-bold m-0">
          {user.role}
        </Tag>
      ),
      span: 3
    },
    {
      key: '4',
      label: <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold">Account Tier</span>,
      children: (
        <Tag color={user.plan === 'PRO' ? 'green' : 'default'} className="font-mono font-bold m-0">
          {user.plan}
        </Tag>
      ),
      span: 3
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={12} className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <Flex align="center" gap={12}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg font-bold font-mono">
              <UserOutlined />
            </div>
            <div>
              <Title level={4} className="!text-lg !font-extrabold !text-slate-900 dark:!text-white !mb-0 !font-mono !tracking-tight">
                Account Settings & Security
              </Title>
              <Text className="!text-xs !text-slate-500 dark:!text-slate-400">
                Manage your credentials, trading profile, and saved strategy presets.
              </Text>
            </div>
          </Flex>

          <Space size={8} align="center">
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={onLogout}
              className="font-mono text-xs font-semibold"
            >
              Log Out
            </Button>
            <Button
              onClick={onClose}
              className="font-mono text-xs font-semibold"
            >
              Close
            </Button>
          </Space>
        </Flex>

        {/* Two Columns: Profile + Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: User Profile Details using Ant Design Card & Descriptions */}
          <Card
            className="!bg-white dark:!bg-slate-950 !border-slate-200 dark:!border-slate-800 !rounded-2xl font-mono text-xs shadow-xs"
            title={
              <Space size={8} align="center" className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider">
                <UserOutlined className="text-emerald-600 dark:text-emerald-400" />
                <span>Trading Profile</span>
              </Space>
            }
          >
            <Descriptions
              bordered
              size="small"
              items={profileDescriptions}
              column={3}
              className="font-mono"
            />
          </Card>

          {/* Section 2: Security & Password Update using Ant Design Form */}
          <Card
            className="!bg-white dark:!bg-slate-950 !border-slate-200 dark:!border-slate-800 !rounded-2xl font-mono text-xs shadow-xs"
            title={
              <Space size={8} align="center" className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider">
                <KeyOutlined className="text-amber-500" />
                <span>Change Password</span>
              </Space>
            }
          >
            {passwordMsg && (
              <Alert message={passwordMsg} type="success" showIcon className="text-xs font-mono mb-3" />
            )}

            {passwordErr && (
              <Alert message={passwordErr} type="error" showIcon className="text-xs font-mono mb-3" />
            )}

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={handleChangePassword}
              autoComplete="off"
            >
              <Form.Item
                label={<span className="text-slate-600 dark:text-slate-400 text-[11px] uppercase font-semibold font-mono">Current Password</span>}
                name="currentPassword"
                rules={[{ required: true, message: 'Please input your current password' }]}
                className="!mb-3"
              >
                <Input.Password
                  placeholder="••••••••"
                  className="font-mono"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-slate-600 dark:text-slate-400 text-[11px] uppercase font-semibold font-mono">New Password</span>}
                name="newPassword"
                rules={[{ required: true, message: 'Please input your new password' }]}
                className="!mb-4"
              >
                <Input.Password
                  placeholder="••••••••"
                  className="font-mono"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isChangingPass}
                className="bg-emerald-600 border-emerald-600 font-semibold w-full font-mono"
              >
                Update Password
              </Button>
            </Form>
          </Card>
        </div>

        {/* Section 3: Saved Strategy Presets using Ant Design List */}
        <Card
          className="!bg-white dark:!bg-slate-950 !border-slate-200 dark:!border-slate-800 !rounded-2xl font-mono text-xs shadow-xs"
          title={
            <Space size={8} align="center" className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider">
              <SaveOutlined className="text-emerald-600 dark:text-emerald-400" />
              <span>Saved Strategy Presets ({savedStrategies.length})</span>
            </Space>
          }
        >
          {isLoadingStrategies ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Spin indicator={<LoadingOutlined className="text-xl text-blue-600 dark:text-blue-400" spin />} />
              <span className="text-xs text-slate-500 font-mono">Loading saved presets...</span>
            </div>
          ) : savedStrategies.length === 0 ? (
            <div className="py-6 text-center text-slate-500">No saved strategy presets found.</div>
          ) : (
            <List
              dataSource={savedStrategies}
              renderItem={s => (
                <List.Item
                  key={s.id}
                  className="!border-b !border-slate-200 dark:!border-slate-800 !py-3"
                  actions={[
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteStrategy(s.id)}
                      key="delete"
                      className="font-mono"
                    >
                      Delete
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={<span className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</span>}
                    description={
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {s.underlying} · {s.ratioLong}:{s.ratioShort} · {s.optionType} · Expiry: {s.expiry} · Gap: ₹{s.gap}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};
