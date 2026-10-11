export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'optimization';

export type SubsystemCategory = 
  | 'firmware' 
  | 'protocol' 
  | 'receiver' 
  | 'backend' 
  | 'frontend' 
  | 'validation' 
  | 'hardware';

export interface CodeReviewFinding {
  id: string;
  title: string;
  subsystem: SubsystemCategory;
  subsystemName: string;
  severity: SeverityLevel;
  file: string;
  lineRange: string;
  problemSummary: string;
  technicalImpact: string;
  realWorldScenario: string;
  problemCode: string;
  solutionCode: string;
  tags: string[];
}

export interface SystemMetric {
  category: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'needs-attention';
  summary: string;
}

export interface FSMScenario {
  id: string;
  name: string;
  description: string;
  durationMs: number;
  expectedResult: 'CONFIRMED' | 'REJECTED_MOVEMENT' | 'REJECTED_NO_IMPACT' | 'SKID' | 'DIRECT_IMPACT' | 'NO_ALERT';
  samples: FSMSample[];
}

export interface FSMSample {
  timeMs: number;
  aMag: number;
  ay: number;
  gx: number;
  roll: number;
  pitch: number;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  role: string;
  hardware: string;
  protocolIn: string;
  protocolOut: string;
  latency: string;
  criticalRisks: string[];
  keyFiles: string[];
}
