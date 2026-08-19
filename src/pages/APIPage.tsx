import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

const APIPage = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://preplitai.com";
  const canonical = `${siteUrl}/api-docs`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "API Documentation", item: canonical },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-black dark:text-white">
      <SEOHead
        title={isKo ? "Preplit AI 개발자 API 문서" : "Preplit AI API"}
        description={isKo ? "Preplit AI RAG 검색, 오디오 생성 및 문서 분석 API 개발 문서." : "Build AI lecture workflows, generate videos, and search knowledge from your apps."}
        url={canonical}
        canonical={canonical}
        schemaMarkup={breadcrumb}
      />
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <div className="relative z-10">
          <p className="text-sm font-semibold text-[#550000] dark:text-[#ffaaaa] mb-4">
            {isKo ? '개발자 센터' : 'Developers'}
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-6 leading-tight">
            Preplit AI <span className="text-[#550000] dark:text-[#ffaaaa]">API</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed mb-10">
            {isKo
              ? '자체 앱 및 학습 시스템에 Preplit AI RAG 지식 검색 및 오디오 생성 워크플로우를 연동하세요.'
              : 'Build AI lecture workflows, generate videos, and search knowledge from your apps.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="/sales">
              <Button className="px-6 py-5 h-auto text-sm font-semibold bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black">
                {isKo ? 'API 권한 신청하기' : 'Request access'}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6 pb-8">
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-semibold text-black dark:text-white">{isKo ? '문서 업로드' : 'Upload document'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">POST /api/upload</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isKo ? 'PDF/DOCX/TXT 파일을 수신하여 documentId를 반환합니다.' : 'Accepts PDF/DOCX/TXT and returns a documentId.'}
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-semibold text-black dark:text-white">{isKo ? '강의 요약 생성' : 'Generate lecture'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">POST /api/lecture/generate</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isKo ? 'documentId와 스타일을 제공해 구조화된 스크립트를 생성합니다.' : 'Provide documentId, mode, and style to get a structured script.'}
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-semibold text-black dark:text-white">{isKo ? '비디오/오디오 생성' : 'Generate video'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">POST /api/video/generate</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isKo ? '텍스트를 오디오 또는 비디오로 변환합니다.' : 'Turn text into a narrated video with optional avatar/voice.'}
          </p>
        </div>
      </section>

      {/* Examples */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-black dark:text-white">{isKo ? '연동 예시' : 'Examples'}</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-black dark:text-white">cURL</h3>
            <pre className="mt-3 text-xs whitespace-pre-wrap text-gray-800 dark:text-gray-200"><code>{`curl -X POST https://your-domain/api/lecture/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "documentId": "doc_123",
    "mode": "summary",
    "style": "professor"
  }'`}</code></pre>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-black dark:text-white">JavaScript</h3>
            <pre className="mt-3 text-xs whitespace-pre-wrap text-gray-800 dark:text-gray-200"><code>{`await fetch('https://your-domain/api/video/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello class', options: { ttsProvider: 'edge' } })
});`}</code></pre>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-500">
          {isKo ? '참고: API 키 발급 및 얼리 액세스는 위 상단 신청을 통해 가능합니다.' : 'Note: Authentication and API keys coming soon. Request early access above.'}
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default APIPage;