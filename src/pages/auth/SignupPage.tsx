import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { Form, Input, Button, Alert, Checkbox, Card, Flex, Typography } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { AuthLayout } from '@/app/layouts';
import { TradeEdgeLogo } from '@/shared/components/branding/TradeEdgeLogo';

const { Title, Paragraph } = Typography;

interface SignupPageProps {
  onNavigateLogin: () => void;
  onNavigateTerms: () => void;
  onNavigatePrivacy: () => void;
  onNavigateHome: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateLogin,
  onNavigateTerms,
  onNavigatePrivacy,
  onNavigateHome
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!values.agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.signup(values.email, values.password, values.displayName);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err?.message || 'Signup failed.');
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
            Create Your Account
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
            Get instant access to live NSE/BSE options ratio spread matrix and real-time scanner.
          </p>
        </div>

        <Card className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-xl">
          {error && (
            <Alert
              title={error}
              type="error"
              showIcon
              className="font-mono text-xs mb-4"
            />
          )}

          {successMsg ? (
            <Flex vertical align="center" gap={16} className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                <CheckCircleOutlined />
              </div>
              <div>
                <Title level={4} className="!text-base !font-bold !text-slate-900 dark:!text-white !mb-1">
                  Check Your Email
                </Title>
                <Paragraph className="!text-xs !text-slate-600 dark:!text-slate-400 leading-relaxed font-mono !mb-0">
                  {successMsg}
                </Paragraph>
              </div>
              <Button
                type="primary"
                onClick={onNavigateLogin}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold"
              >
                Go To Login
              </Button>
            </Flex>
          ) : (
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={handleFinish}
              autoComplete="off"
            >
              <div className="space-y-1.5 mb-3.5">
                <label htmlFor="displayName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                  Full Name / Trader Handle
                </label>
                <Form.Item
                  name="displayName"
                  rules={[{ required: true, message: 'Please input your name' }]}
                  className="!mb-0"
                >
                  <Input
                    id="displayName"
                    prefix={<UserOutlined className="text-slate-400 mr-2 text-sm" />}
                    placeholder="e.g. Rahul Sharma"
                    className="font-sans text-sm rounded-xl h-11"
                  />
                </Form.Item>
              </div>

              <div className="space-y-1.5 mb-3.5">
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

              <div className="space-y-1.5 mb-3.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                  Password
                </label>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                  className="!mb-0"
                >
                  <Input.Password
                    id="password"
                    prefix={<LockOutlined className="text-slate-400 mr-2 text-sm" />}
                    placeholder="At least 6 characters"
                    className="font-sans text-sm rounded-xl h-11"
                  />
                </Form.Item>
              </div>

              <div className="space-y-1.5 mb-4">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                  Confirm Password
                </label>
                <Form.Item
                  name="confirmPassword"
                  rules={[{ required: true, message: 'Please confirm your password' }]}
                  className="!mb-0"
                >
                  <Input.Password
                    id="confirmPassword"
                    prefix={<LockOutlined className="text-slate-400 mr-2 text-sm" />}
                    placeholder="Re-enter password"
                    className="font-sans text-sm rounded-xl h-11"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="agreeTerms"
                valuePropName="checked"
                className="!mb-5"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error('You must accept the terms'))
                  }
                ]}
              >
                <Checkbox className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={onNavigateTerms}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={onNavigatePrivacy}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </Checkbox>
              </Form.Item>

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
                Create Account
              </Button>
            </Form>
          )}

          {/* Login Link inside Card */}
          <div className="flex justify-center items-center gap-1.5 font-sans text-xs text-slate-600 dark:text-slate-400 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <span>Already have an account?</span>
            <button onClick={onNavigateLogin} className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">
              Sign in
            </button>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
