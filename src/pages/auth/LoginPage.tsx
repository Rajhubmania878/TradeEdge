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
import { TradeEdgeLogo } from '@/shared/components/branding/TradeEdgeLogo';

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
    <AuthLayout onNavigateHome={onNavigateHome}>
      <div className="w-full max-w-md">
        {/* Header with spacious vertical axis */}
        <div className="text-center mb-7 sm:mb-8">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2.5 cursor-pointer bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60"
          >
            <TradeEdgeLogo size={14} />
            <span className="font-semibold uppercase tracking-wider">TRADE EDGE TERMINAL</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2.5 font-sans">
            Log In To Your Account
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
            Enter your credentials to access the institutional options ratio spread terminal.
          </p>
        </div>

        {/* Form Card */}
        <Card className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-xl">
          {sessionExpiredNotice && (
            <Alert
              title="Session Expired"
              description={sessionExpiredNotice}
              type="warning"
              showIcon
              closable
              className="font-sans text-xs mb-4"
            />
          )}

          {error && (
            <Alert
              title={error}
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
            {/* Email Field */}
            <div className="space-y-1.5 mb-4">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                Email Address
              </label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email address' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
                className="!mb-0"
              >
                <Input
                  id="email"
                  prefix={<MailOutlined className="text-slate-400 mr-2 text-sm" />}
                  placeholder="name@example.com"
                  className="font-sans text-sm rounded-xl h-11"
                />
              </Form.Item>
            </div>

            {/* Password Field with Decoupled Header */}
            <div className="space-y-1.5 mb-6">
              <div className="flex items-center justify-between w-full">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password' }]}
                className="!mb-0"
              >
                <Input.Password
                  id="password"
                  prefix={<LockOutlined className="text-slate-400 mr-2 text-sm" />}
                  placeholder="••••••••"
                  className="font-sans text-sm rounded-xl h-11"
                />
              </Form.Item>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
              block
              size="large"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold font-sans tracking-wide h-11 rounded-xl border-0 shadow-xs text-sm"
            >
              Log In To Terminal
            </Button>
          </Form>

          {/* Quick Demo Accounts */}
          <Divider className="!border-slate-200 dark:!border-slate-800 !text-slate-400 !text-[11px] !font-sans !font-semibold !uppercase !my-5">
            Quick Demo Accounts
          </Divider>

          <div className="grid grid-cols-3 gap-2">
            <Button
              size="middle"
              onClick={() => handleDemoLogin('admin@ratiospread.com', 'Admin123!')}
              className="font-sans text-xs font-semibold rounded-xl"
            >
              Admin User
            </Button>
            <Button
              size="middle"
              onClick={() => handleDemoLogin('pro@ratiospread.com', 'Pro123!')}
              className="font-sans text-xs font-semibold rounded-xl"
            >
              Pro User
            </Button>
            <Button
              size="middle"
              onClick={() => handleDemoLogin('demo@ratiospread.com', 'User123!')}
              className="font-sans text-xs font-semibold rounded-xl"
            >
              Free User
            </Button>
          </div>

          {/* Signup Link inside Card */}
          <div className="flex justify-center items-center gap-1.5 font-sans text-xs text-slate-600 dark:text-slate-400 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <span>Don't have an account?</span>
            <button onClick={onNavigateSignup} className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">
              Create account
            </button>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
