import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { Form, Input, Button, Alert, Card, Flex, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/app/layouts';

const { Title, Paragraph } = Typography;

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateHome
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: { email: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword(values.email);
      setMsg(response);
    } catch (err: any) {
      setError(err?.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6">
        <Flex vertical align="center" gap={4} className="text-center">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 font-mono text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-1 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold">Ratio Spread Terminal</span>
          </button>
          <Title level={2} className="!text-2xl !font-extrabold !text-slate-900 dark:!text-white !mb-0 !tracking-tight">
            Reset Password
          </Title>
          <Paragraph className="!text-xs !text-slate-500 dark:!text-slate-400 !mb-0 max-w-sm">
            Enter your email to receive password reset instructions.
          </Paragraph>
        </Flex>

        <Card className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-xl">
          {error && (
            <Alert
              title={error}
              type="error"
              showIcon
              className="font-mono text-xs mb-4"
            />
          )}

          {msg ? (
            <Flex vertical align="center" gap={16} className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                <CheckCircleOutlined />
              </div>
              <Paragraph className="!text-xs !text-slate-700 dark:!text-slate-300 font-mono leading-relaxed !mb-0">
                {msg}
              </Paragraph>
              <Button
                type="primary"
                onClick={onNavigateLogin}
                block
                size="large"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono"
              >
                Back To Login
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
                    Email Address
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: 'Please input your email address' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
                className="!mb-6"
              >
                <Input
                  prefix={<MailOutlined className="text-slate-400 mr-1" />}
                  placeholder="name@example.com"
                  className="font-mono"
                  size="large"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<SendOutlined />}
                iconPlacement="end"
                block
                size="large"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono tracking-wider h-11 border-0"
              >
                SEND RESET INSTRUCTIONS
              </Button>
            </Form>
          )}
        </Card>

        <Flex justify="center" align="center" gap={4} className="font-mono text-xs">
          <button
            onClick={onNavigateLogin}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold"
          >
            <ArrowLeftOutlined className="text-[10px]" />
            <span>Back to login</span>
          </button>
        </Flex>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
