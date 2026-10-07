import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { marketDataFeed } from '@/services/marketDataFeed';
import { UserProfile } from '@/shared/types';
import { Form, Input, Button, Alert, Divider, Flex, Typography, Card } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { AuthLayout } from '@/app/layouts';

const { Title, Paragraph } = Typography;

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateSignup: () => void;
  onNavigateForgotPassword: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateSignup,
  onNavigateForgotPassword,
  onNavigateHome
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiredNotice] = useState<string | null>(() => {
    try {
      const msg = sessionStorage.getItem('ratio_spread_session_expired');
      if (msg) {
        sessionStorage.removeItem('ratio_spread_session_expired');
        return msg;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const handleFinish = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user } = await authService.login(values.email, values.password);
      marketDataFeed.resetSessionExpired();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    form.setFieldsValue({ email: demoEmail, password: demoPass });
    setIsLoading(true);
    setError(null);

    try {
      const { user } = await authService.login(demoEmail, demoPass);
      marketDataFeed.resetSessionExpired();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6">
        {/* Header with shared vertical visual axis */}
        <Flex vertical align="center" gap={4} className="text-center">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 font-mono text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-1 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold">Ratio Spread Terminal</span>
          </button>
          <Title level={2} className="!text-2xl !font-extrabold !text-slate-900 dark:!text-white !mb-0 !tracking-tight">
            Log In To Your Account
          </Title>
          <Paragraph className="!text-xs !text-slate-500 dark:!text-slate-400 !mb-0 max-w-sm">
            Enter your credentials to access the institutional options ratio spread terminal.
          </Paragraph>
        </Flex>

        {/* Form Card */}
        <Card className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-xl">
          {sessionExpiredNotice && (
            <Alert
              message="Session Expired"
              description={sessionExpiredNotice}
              type="warning"
              showIcon
              closable
              className="font-sans text-xs mb-4"
            />
          )}

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="font-mono text-xs mb-4"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleFinish}
            autoComplete="off"
          >
            <Form.Item
              label={
                <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Email Address
                </span>
              }
              name="email"
              rules={[
                { required: true, message: 'Please input your email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              className="!mb-4"
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 mr-1" />}
                placeholder="name@example.com"
                className="font-mono"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={
                <Flex justify="space-between" align="center" className="w-full">
                  <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Password
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateForgotPassword}
                    className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </Flex>
              }
              name="password"
              rules={[{ required: true, message: 'Please input your password' }]}
              className="!mb-6"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="••••••••"
                className="font-mono"
                size="large"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
              block
              size="large"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono tracking-wider h-11 border-0"
            >
              LOG IN TO TERMINAL
            </Button>
          </Form>

          {/* Quick Demo Accounts */}
          <Divider className="!border-slate-200 dark:!border-slate-800 !text-slate-400 !text-[10px] !font-mono !uppercase !my-4">
            QUICK DEMO ACCESSIBLE ACCOUNTS
          </Divider>

          <div className="grid grid-cols-3 gap-2">
            <Button
              size="small"
              onClick={() => handleDemoLogin('admin@ratiospread.com', 'Admin123!')}
              className="font-mono text-[11px] font-medium"
            >
              Admin User
            </Button>
            <Button
              size="small"
              onClick={() => handleDemoLogin('pro@ratiospread.com', 'Pro123!')}
              className="font-mono text-[11px] font-medium"
            >
              Pro User
            </Button>
            <Button
              size="small"
              onClick={() => handleDemoLogin('demo@ratiospread.com', 'User123!')}
              className="font-mono text-[11px] font-medium"
            >
              Free User
            </Button>
          </div>
        </Card>

        {/* Signup Link */}
        <Flex justify="center" align="center" gap={4} className="font-mono text-xs text-slate-600 dark:text-slate-400">
          <span>Don't have an account?</span>
          <button onClick={onNavigateSignup} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
            Create account
          </button>
        </Flex>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
