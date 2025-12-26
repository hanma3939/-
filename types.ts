
export interface VocalAnalysis {
  score: number;
  genderRatio: {
    masculine: number;
    feminine: number;
  };
  estimatedAge: string;
  technicalMetrics: {
    clarity: number;     // 明瞭度
    resonance: number;   // 共鳴
    stability: number;   // 安定性
    diction: number;     // 滑舌
  };
  vocalExpertFeedback: {
    summary: string;
    physiology: string;  // 生理学的分析
    improvementPoints: string[];
  };
  actingExpertFeedback: {
    summary: string;
    expression: string;  // 演技的表現の分析
    characterization: string; // キャラクター造形
  };
}

export interface AudioState {
  isRecording: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
  isAnalyzing: boolean;
}
