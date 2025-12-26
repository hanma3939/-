
import React from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip
} from 'recharts';
import { VocalAnalysis } from '../types';

interface AnalysisDashboardProps {
  analysis: VocalAnalysis;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const radarData = [
    { subject: '声の通り', A: analysis.technicalMetrics.clarity, fullMark: 100 },
    { subject: '声の響き', A: analysis.technicalMetrics.resonance, fullMark: 100 },
    { subject: '発声の安定', A: analysis.technicalMetrics.stability, fullMark: 100 },
    { subject: '言葉のキレ', A: analysis.technicalMetrics.diction, fullMark: 100 },
  ];

  const pieData = [
    { name: '男性', value: analysis.genderRatio.masculine },
    { name: '女性', value: analysis.genderRatio.feminine },
  ];

  const COLORS = ['#3b82f6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/60 p-8 rounded-3xl border border-gray-700 shadow-xl text-center">
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">Total Score</p>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            {analysis.score}
          </div>
          <div className="mt-4 text-[10px] text-gray-500 font-medium">Vocal Performance Grade</div>
        </div>
        
        <div className="bg-gray-800/60 p-8 rounded-3xl border border-gray-700 shadow-xl text-center">
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">Estimated Age</p>
          <div className="text-5xl font-bold text-emerald-400">{analysis.estimatedAge}</div>
          <div className="mt-4 text-[10px] text-gray-500 font-medium">Timbre Analysis</div>
        </div>

        <div className="bg-gray-800/60 p-4 rounded-3xl border border-gray-700 shadow-xl flex flex-col items-center">
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">Gender Perception</p>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 text-sm font-bold">
            <span className="text-blue-400">♂ {analysis.genderRatio.masculine}%</span>
            <span className="text-pink-400">♀ {analysis.genderRatio.feminine}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            技術分析メトリクス
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Radar
                  name="Vocalist"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-900/10 p-8 rounded-3xl border border-blue-500/20 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
              ボイストレーナーの評価
            </h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">{analysis.vocalExpertFeedback.summary}</p>
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">生理学的分析</p>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{analysis.vocalExpertFeedback.physiology}</p>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">改善アドバイス</p>
              <ul className="space-y-2">
                {analysis.vocalExpertFeedback.improvementPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-blue-500">•</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-purple-900/10 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-purple-200 mb-4 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              演出家・演技指導者の評価
            </h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">{analysis.actingExpertFeedback.summary}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">表現力</p>
                <p className="text-xs text-gray-400">{analysis.actingExpertFeedback.expression}</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">キャラクター性</p>
                <p className="text-xs text-gray-400">{analysis.actingExpertFeedback.characterization}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
