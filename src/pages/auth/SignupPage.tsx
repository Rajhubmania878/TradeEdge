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
    <AuthLayout>
      <div className="w-full max-w-md space-y-6">
        {/* Header visual axis */}
        <Flex vertical align="center" gap={4} className="text-center">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 font-mono text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-1 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold">Ratio Spread Terminal</span>
          </button>
          <Title level={2} className="!text-2xl !font-extrabold !text-slate-900 dark:!text-white !mb-0 !tracking-tight">
            Create Your Account
          </Title>
          <Paragraph className="!text-xs !text-slate-500 dark:!text-slate-400 !mb-0 max-w-sm">
            Get instant access to live NSE/BSE options ratio spread matrix and real-time scanner.
          </Paragraph>
        </Flex>

        <Card className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-xl">
          {error && (
            <Alert
              message={error}
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
              <Form.Item
                label={
                  <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Full Name / Trader Handle
                  </span>
                }
                name="displayName"
                rules={[{ required: true, message: 'Please input your name' }]}
                className="!mb-4"
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400 mr-1" />}
                  placeholder="e.g. Rahul Sharma"
                  size="large"
                />
              </Form.Item>

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
                  <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Password
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: 'Please input your password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
                className="!mb-4"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400 mr-1" />}
                  placeholder="At least 6 characters"
                  className="font-mono"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Confirm Password
                  </span>
                }
                name="confirmPassword"
                rules={[{ required: true, message: 'Please confirm your password' }]}
                className="!mb-4"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400 mr-1" />}
                  placeholder="Re-enter password"
                  className="font-mono"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="agreeTerms"
                valuePropName="checked"
                className="!mb-6"
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
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={onNavigatePrivacy}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono tracking-wider h-11 border-0"
              >
                CREATE ACCOUNT
              </Button>
            </Form>
          )}
        </Card>

        {/* Login Link */}
        <Flex justify="center" align="center" gap={4} className="font-mono text-xs text-slate-600 dark:text-slate-400">
          <span>Already have an account?</span>
          <button onClick={onNavigateLogin} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
            Sign in
          </button>
        </Flex>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
