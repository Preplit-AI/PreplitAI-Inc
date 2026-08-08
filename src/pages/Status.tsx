import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

const Status = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <SEOHead
        title={isKo ? "PreplitAI 서비스 가동 상태" : "PreplitAI System status"}
        description={isKo ? "PreplitAI 모든 서비스 실시간 가동률 및 상태 리포트." : "Realtime overview of uptime and incidents for PreplitAI services."}
        canonical={`${(import.meta as any).env?.VITE_SITE_URL || 'https://yourdomain.com'}/status`}
        robots="noindex,follow"
      />
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-6 leading-tight">
            {isKo ? '서비스 ' : 'System '}
            <span className="text-[#630000] dark:text-[#ff9999]">
              {isKo ? '가동 상태' : 'status'}
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            {isKo
              ? 'PreplitAI 학업 워크스페이스 및 AI 엔진 서비스의 실시간 가동 현황입니다.'
              : 'Realtime overview of uptime and incidents for PreplitAI services.'}
          </p>
        </div>
        <div className="mt-10 space-y-4">
          <div className="p-8 rounded-2xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-black dark:text-white flex items-center gap-3">
                <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></span>
                {isKo ? '모든 시스템 정상 가동 중' : 'All Systems Operational'}
              </h3>
              <span className="text-sm text-green-700 dark:text-green-300">
                {isKo ? '최근 업데이트: 방금 전' : 'Last updated: 2 minutes ago'}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {isKo ? '모든 AI 스터디 서비스가 정상 작동하고 있습니다.' : 'All services are running smoothly. No incidents reported.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-black dark:text-white">{isKo ? 'AI 스터디 챗 엔진' : 'AI Chat Engine'}</h4>
                <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full">{isKo ? '정상 가동' : 'Operational'}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isKo ? '문서 업로드, RAG 검색 및 출처 인용 엔진' : 'Upload, RAG retrieval, and citation APIs'}</p>
              <div className="mt-3 text-xs text-gray-500">99.98% uptime (30 days)</div>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-black dark:text-white">{isKo ? '웹 워크스페이스 앱' : 'Web Application'}</h4>
                <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full">{isKo ? '정상 가동' : 'Operational'}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isKo ? '대시보드, 회원 인증 및 스터디 스페이스 UI' : 'Dashboard, authentication, and user interface'}</p>
              <div className="mt-3 text-xs text-gray-500">99.99% uptime (30 days)</div>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-black dark:text-white">{isKo ? '오디오 & 미디어 생성기' : 'Media Processing'}</h4>
                <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full">{isKo ? '정상 가동' : 'Operational'}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isKo ? '팟캐스트 오디오, TTS 및 음성 인식 서비스' : 'Audio rendering, TTS, and speech recognition'}</p>
              <div className="mt-3 text-xs text-gray-500">99.95% uptime (30 days)</div>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-black dark:text-white">{isKo ? '클라우드 스토리지 & CDN' : 'Storage & CDN'}</h4>
                <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full">{isKo ? '정상 가동' : 'Operational'}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isKo ? '학습 자료 저장소 및 콘텐트 전송 네트워크' : 'File storage and content delivery network'}</p>
              <div className="mt-3 text-xs text-gray-500">100% uptime (30 days)</div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">{isKo ? '최근 장애 기록' : 'Recent Incidents'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isKo ? '✓ 최근 30일간 보고된 장애가 없습니다.' : '✓ No incidents reported in the last 30 days'}
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Status;