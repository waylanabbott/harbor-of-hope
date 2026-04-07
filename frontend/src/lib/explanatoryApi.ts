import { apiFetch } from './api';

export interface ExplanatoryFeature {
  name: string;
  coefficient: number;
  pValue: number;
  direction: string;
  interpretation: string;
  isSignificant: boolean;
}

export interface ExplanatoryPipeline {
  pipelineId: number;
  pipelineName: string;
  targetVariable: string;
  modelType: string;
  rSquared: number;
  adjRSquared: number;
  sampleSize: number;
  keyInsight: string;
  recommendations: string[];
  topFeatures: ExplanatoryFeature[];
}

export function fetchExplanatoryInsights(): Promise<ExplanatoryPipeline[]> {
  return apiFetch<ExplanatoryPipeline[]>('/explanatoryinsights');
}
