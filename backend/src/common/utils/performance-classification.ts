// backend/src/common/utils/performance-classification.ts
import { PERFORMANCE_STRENGTH_THRESHOLD, PERFORMANCE_AT_RISK_THRESHOLD } from '../constants';

export interface PerformanceClassification {
  strengths: string[];
  needsImprovement: string[];
  atRisk: string[];
}

/** Same fixed-threshold rule used everywhere scores get judged — one place, so the bar never quietly drifts between features. */
export function classifyPerformance(scores: Record<string, number>): PerformanceClassification {
  const result: PerformanceClassification = { strengths: [], needsImprovement: [], atRisk: [] };
  for (const [subject, score] of Object.entries(scores)) {
    if (score >= PERFORMANCE_STRENGTH_THRESHOLD) result.strengths.push(subject);
    else if (score >= PERFORMANCE_AT_RISK_THRESHOLD) result.needsImprovement.push(subject);
    else result.atRisk.push(subject);
  }
  return result;
}