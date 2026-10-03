# 12 — Testing & Quality Strategy

## 1. Engine Test Suite Verification (`src/engine/engineTests.ts`)

The project contains a built-in 17-test mathematical verification suite (`runStrategyEngineTestSuite()`) which verifies:

1. **TEST 01**: 1:1 Bull Call Spread (Bounded profit, bounded loss, single breakeven).
2. **TEST 02**: 1:2 Call Ratio Spread (Peak profit at short strike, upper unlimited loss slope, upper breakeven).
3. **TEST 03**: 1:3 Call Ratio Spread (Debit down-side loss, 2 breakevens, unlimited upside loss).
4. **TEST 04**: 2:5 Call Ratio Spread (Asymmetric leg weights 2:5, unlimited loss).
5. **TEST 05**: 1:3 Put Ratio Spread (Finite lower bound at Spot = 0).
6. **TEST 06**: Credit Ratio Spread (Guaranteed credit when OTM).
7. **TEST 07**: Net Debit Spread Behavior (Loss capped at debit).
8. **TEST 08**: Missing / Null Bid Safeguard (null representation over 0.00).
9. **TEST 09**: Missing / Null Ask Safeguard (null representation).
10. **TEST 10**: Exchange Strike Grid Integrity (Strictly sorted listed strikes).
11. **TEST 11**: Index-Based Strike Step Gap Mapping (Index-based array offset).
12. **TEST 12**: Black-Scholes ATM Call Greeks (Delta ~0.50, Gamma > 0, Theta < 0, Vega > 0).
13. **TEST 13**: Asymptotic Slope Unlimited Loss Guard.
14. **TEST 14**: Lot Size Contract Multiplication.
15. **TEST 15**: BSE Option Contract Discovery (Active BFO contracts, 200+ underlyings).
16. **TEST 16**: BSE Cash Universe vs BSE Options Universe Separation.
17. **TEST 17**: Exchange-Specific Token Isolation (NSE cash 2885 != BSE cash 500325).

---

## 2. Testing Execution Gate

During each migration phase:
1. Run `npx tsc --noEmit` to verify type safety.
2. In browser or test runner, verify all 17 tests in `runStrategyEngineTestSuite()` return `passed === true`.
3. Verify dev server builds cleanly without errors.
