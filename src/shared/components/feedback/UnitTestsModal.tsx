import React, { useState } from 'react';
import { runStrategyEngineTestSuite, TestCaseResult } from '@/engine/engineTests';
import { Modal, Button, Tag, Space, Collapse, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface UnitTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnitTestsModal: React.FC<UnitTestsModalProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>(() => runStrategyEngineTestSuite());
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runStrategyEngineTestSuite();
      setTestResults(results);
      setIsRunning(false);
    }, 200);
  };

  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;
  const allPassed = passedCount === totalCount;

  const collapseItems = testResults.map(test => ({
    key: test.id,
    label: (
      <div className="flex items-center justify-between w-full pr-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          {test.passed ? (
            <CheckCircleOutlined className="text-emerald-500 text-sm" />
          ) : (
            <CloseCircleOutlined className="text-rose-500 text-sm" />
          )}
          <span className="font-bold text-slate-800 dark:text-slate-100">{test.name}</span>
          <Tag className="m-0 text-[10px] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            {test.id}
          </Tag>
        </div>

        <Tag color={test.passed ? 'success' : 'error'} className="m-0 font-bold text-[10px]">
          {test.passed ? 'PASS' : 'FAIL'}
        </Tag>
      </div>
    ),
    children: (
      <div className="space-y-2 text-xs font-sans">
        <p className="text-slate-600 dark:text-slate-300 text-[11px] mb-2 leading-relaxed">
          {test.description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
          <div>
            <span className="text-slate-500 block">Expected Result:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{test.expected}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Actual Output:</span>
            <span className={`font-bold ${test.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {test.actual}
            </span>
          </div>
        </div>
      </div>
    )
  }));

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-sans">
          <ExperimentOutlined className="text-amber-500 text-lg" />
          <span>Strategy & Pricing Engine Verification Suite</span>
        </div>
      }
      footer={[
        <Button key="close" onClick={onClose} className="font-mono">
          Close
        </Button>,
        <Button
          key="run"
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={isRunning}
          onClick={handleRunTests}
          className="bg-emerald-600 border-emerald-600 font-semibold font-mono"
        >
          Re-run All Tests
        </Button>
      ]}
      width={680}
      style={{ maxWidth: 'calc(100vw - 24px)' }}
      centered
    >
      <div className="space-y-4 py-2 text-xs font-sans">
        {/* Results summary header */}
        <div className={`p-3.5 sm:p-4 rounded-xl border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 ${
          allPassed
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
        }`}>
          <Space size={12} align="center">
            {allPassed ? (
              <CheckCircleOutlined className="text-emerald-500 text-2xl" />
            ) : (
              <CloseCircleOutlined className="text-rose-500 text-2xl" />
            )}
            <div>
              <h4 className="font-bold text-sm font-mono m-0">
                {allPassed ? 'All 15 Strategy Verification Tests Passed' : `${totalCount - passedCount} Tests Failed`}
              </h4>
              <p className="text-[11px] opacity-80 m-0">
                Verifying Black-Scholes Greeks, payoff curves, net entry formulas, gap validation, and BSE multi-exchange logic.
              </p>
            </div>
          </Space>

          <Tag color={allPassed ? 'success' : 'error'} className="font-mono font-bold text-xs px-2.5 py-0.5">
            {passedCount} / {totalCount} PASSED
          </Tag>
        </div>

        {/* Collapsible Test Cases */}
        <Collapse
          items={collapseItems}
          defaultActiveKey={['BS-01', 'PAY-01']}
          size="small"
          className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
        />
      </div>
    </Modal>
  );
};
