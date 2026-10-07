import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { Form, Input, Button, Alert, Card, Flex, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/app/layouts';
import { TradeEdgeLogo } from '@/shared/components/branding/TradeEdgeLogo';

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
            Reset Password
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
            Enter your email to receive password reset instructions.
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
              <div className="space-y-1.5 mb-6">
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

              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<SendOutlined />}
                iconPlacement="end"
                block
                size="large"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold font-sans tracking-wide h-11 rounded-xl border-0 shadow-xs text-sm"
              >
                Send Reset Instructions
              </Button>
            </Form>
          )}

          {/* Back to Login Link inside Card */}
          <div className="flex justify-center items-center font-sans text-xs pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onNavigateLogin}
              className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer font-semibold"
            >
              <ArrowLeftOutlined className="text-[10px]" />
              <span>Back to login</span>
            </button>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
