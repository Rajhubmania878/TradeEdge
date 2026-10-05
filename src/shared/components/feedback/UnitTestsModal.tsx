import React, { useState, useEffect, useMemo } from 'react';
import { runStrategyEngineTestSuite, TestCaseResult } from '@/engine/engineTests';
import { useLockBodyScroll } from '@/shared/hooks';
import { Modal, Button, Tag, Space, Collapse, Typography, Flex, Spin } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ExperimentOutlined,
  LoadingOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface UnitTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnitTestsModal: React.FC<UnitTestsModalProps> = ({ isOpen, onClose }) => {
  useLockBodyScroll(isOpen);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isOpen && !testResults) {
      setTestResults(runStrategyEngineTestSuite());
    }
  }, [isOpen, testResults]);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runStrategyEngineTestSuite();
      setTestResults(results);
      setIsRunning(false);
    }, 150);
  };

  const currentResults = testResults || [];
  const passedCount = currentResults.filter(t => t.passed).length;
  const totalCount = currentResults.length;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  const collapseItems = useMemo(() => {
    return currentResults.map(test => ({
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
          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
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
  }, [currentResults]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <Flex align="center" gap={10} className="py-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-base font-bold font-sans shrink-0">
            <ExperimentOutlined />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-base font-sans tracking-tight">
              Strategy & Pricing Engine Verification Suite
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal">
              Automated testing for Black-Scholes Greeks, payoff formulas, and multi-exchange strike matrix
            </div>
          </div>
        </Flex>
      }
      footer={[
        <Button key="close" onClick={onClose} className="font-sans text-xs rounded-xl">
          Close
        </Button>,
        <Button
          key="run"
          type="primary"
          icon={<ReloadOutlined spin={isRunning} />}
          loading={isRunning}
          onClick={handleRunTests}
          className="bg-emerald-600 hover:bg-emerald-500 border-emerald-600 font-sans text-xs font-semibold rounded-xl h-9 px-4 shadow-xs"
        >
          Re-run All Tests
        </Button>
      ]}
      width={720}
      centered
    >
      <div className="space-y-4 pt-2 pb-1 text-xs font-sans">
        {/* Results summary header */}
        <div className={`p-3.5 rounded-2xl border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-2xs ${
          allPassed
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
            : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
        }`}>
          <Flex align="center" gap={12}>
            {allPassed ? (
              <CheckCircleOutlined className="text-emerald-500 text-2xl shrink-0" />
            ) : (
              <CloseCircleOutlined className="text-rose-500 text-2xl shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm font-sans">
                {allPassed ? 'All 17 Engine Verification Tests Passed' : `${totalCount - passedCount} Tests Failed`}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5 font-sans">
                Verifying Black-Scholes Greeks, payoff curves, net entry formulas, gap validation, and BSE multi-exchange logic.
              </div>
            </div>
          </Flex>

          <Tag color={allPassed ? 'success' : 'error'} className="font-mono font-bold text-xs px-2.5 py-1 rounded-full m-0">
            {passedCount} / {totalCount} PASSED
          </Tag>
        </div>

        {/* Collapsible Test Cases */}
        <Collapse
          items={collapseItems}
          defaultActiveKey={['BS-01', 'PAY-01']}
          size="small"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden"
        />
      </div>
    </Modal>
  );
};

export default UnitTestsModal;
