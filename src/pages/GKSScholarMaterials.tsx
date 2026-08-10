import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { API_BASE_URL } from '@/constants/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ScholarMaterial {
  id: string;
  title: string;
  type: string;
  scholarYear: string;
  degree: string;
  university: string;
  summary: string;
  previewText: string;
}

export default function GKSScholarMaterials() {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const [materials, setMaterials] = useState<ScholarMaterial[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<ScholarMaterial | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gks/scholar-materials`);
        if (res.ok) {
          const data = await res.json();
          setMaterials(data.materials || []);
        }
      } catch (err) {
        console.warn('Failed to load scholar materials:', err);
      }
    };
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter(m => {
    const matchesType = filterType === 'ALL' || m.type.includes(filterType);
    const matchesSearch = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.university.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pt-16 sm:pt-20 transition-colors duration-300">
      <SEOHead
        title={isKo ? "GKS 합격자 샘플 서류 자료실 | GKS2026 Prep" : "Previous GKS Scholars Material Library | GKS2026 Prep"}
        description={isKo ? "서울대, KAIST, 고려대 등 역대 GKS 장학생들의 합격 자기소개서, 학업계획서, 추천서 실물 데이터베이스." : "Browse verified high-scoring GKS Personal Statements, Study Plans, and Recommendation letters from past scholars."}
        keywords={["GKS sample essay", "GKS personal statement sample", "GKS study plan sample", "GKS scholar materials"]}
        url="https://preplitai.com/gks/scholar-materials"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-12 space-y-6">
        
        {/* COMPACT TOP HEADER & SEARCH ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {isKo ? 'GKS 합격자 우수 서류 자료실' : 'Previous GKS Scholars Material Library'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isKo ? '서울대, KAIST, 고려대 등 장학생 합격 서류 샘플' : 'Sample Personal Statements, Study Plans & Recommendation Letters'}
            </p>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isKo ? '대학명 또는 키워드 검색...' : 'Search university or keyword...'}
              className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-xs rounded-xl w-48 h-9"
            />
            {[
              { key: 'ALL', label: isKo ? '전체' : 'All' },
              { key: 'Form 2', label: 'Form 2' },
              { key: 'Form 3', label: 'Form 3' },
              { key: 'Form 4', label: 'Form 4' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === tab.key
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* MATERIALS GRID */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredMaterials.map(mat => (
            <div key={mat.id} className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-[#630000] dark:text-[#c84040]">
                    {mat.type}
                  </span>
                  <span className="text-xs font-medium text-gray-500">{mat.scholarYear} · {mat.university}</span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{mat.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{mat.summary}</p>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                <Button
                  onClick={() => setSelectedMaterial(mat)}
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-semibold px-4 py-1 rounded-full h-8"
                >
                  <span>{isKo ? '샘플 서류 읽기' : 'Read Sample Document'}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* DETAIL MODAL */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full p-5 max-h-[85vh] flex flex-col shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-[#630000] dark:text-[#c84040] block">{selectedMaterial.type}</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{selectedMaterial.title}</h3>
              </div>
              <button onClick={() => setSelectedMaterial(null)} className="text-xs text-gray-500 hover:text-gray-900">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs font-mono leading-relaxed text-gray-800 dark:text-gray-200">
              <p>{selectedMaterial.previewText}</p>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-center">
              <Button onClick={() => setSelectedMaterial(null)} size="sm" className="bg-black text-white dark:bg-white dark:text-black text-xs rounded-full px-6">Close</Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
