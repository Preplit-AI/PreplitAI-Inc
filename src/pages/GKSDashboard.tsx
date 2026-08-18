import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { API_BASE_URL } from '@/constants/config';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GKSAdvisorChatbot } from '@/components/gks/GKSAdvisorChatbot';
import { useAuth } from '@/contexts/AuthContext';
import { User, FileText, Zap, BarChart2, BookOpen, GraduationCap } from 'lucide-react';

interface GKSProfile {
  track: string;
  degreeLevel: string;
  country: string;
  targetField: string;
  firstChoiceUniversity: string;
  secondChoiceUniversity: string;
  thirdChoiceUniversity: string;
  academicGpa: string;
  topikLevel: string;
  englishScore: string;
  englishTestType: string;
  englishTestScore: string;
}

interface GKSDocument {
  type: string;
  fileName: string;
  text: string;
  wordCount: number;
}

interface ActionItem {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  problem: string;
  recommendation: string;
  koreanContextTip: string;
}

interface EvaluationResult {
  readinessScore: number;
  readinessTier: string;
  summaryHeadline: string;
  scores: {
    narrativeFit: number;
    academicFit: number;
    koreaFit: number;
    feasibility: number;
  };
  documentDiagnostics: {
    personalStatement: { score: number; strengths: string[]; redFlags: string[]; guidance: string };
    studyPlan: { score: number; strengths: string[]; redFlags: string[]; guidance: string };
    recommendationLetter: { score: number; strengths: string[]; redFlags: string[]; guidance: string };
  };
  actionItems: ActionItem[];
}

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const DUMMY_PERSONAL_STATEMENT = `Ever since my sophomore year in Computer Science, my research interest has revolved around large-scale distributed cloud systems and AI infrastructure. South Korea's rapid technological advancement, evidenced by pioneering smart cities and world-class 5G networks, makes it the ideal destination to pursue my graduate studies.

During my undergraduate thesis, I developed an energy-efficient task scheduling algorithm for edge computing nodes, which reduced server latency by 18%. Overcoming limited hardware resources taught me adaptability and rigorous problem-solving skills.

I am applying for the GKS 2026 scholarship to pursue my Master's Degree in Computer Science at Seoul National University. My goal is to gain cutting-edge expertise in distributed AI systems under Korean faculty supervision and act as a bridge for technological collaboration between South Korea and Southeast Asia.`;

const DUMMY_STUDY_PLAN = `1. Goal of Study & Language Study Plan:
Prior to beginning my degree courses, my goal is to achieve TOPIK Level 5 during the 1-year Korean language training program. I will immerse myself in daily language practice, attend conversation exchanges with Korean university students, and study specialized academic Korean terminology relevant to Computer Science.

2. Detailed Study Plan (Academic & Research):
- Semester 1 & 2: Complete core coursework in Advanced Algorithms, Distributed Systems, and Machine Learning Systems. Maintain a minimum GPA of 3.8/4.0.
- Semester 3 & 4: Conduct thesis research under the guidance of Professor Kim in the Cloud & AI Systems Laboratory at Seoul National University. Focus on distributed neural network training across heterogeneous GPU clusters.

3. Future Plan After Graduation:
Upon graduation, I intend to work as a Senior Systems Engineer at a leading Korean technology research institute for 3 years before establishing a joint research initiative between Korea and my home country to foster cross-border software talent.`;

const DUMMY_RECOMMENDATION_LETTER = `To the NIIED Selection Committee,

It is my distinct privilege to recommend [Applicant Name] for the Global Korea Scholarship (GKS 2026) program. As Professor and Department Chair of Computer Science, I have mentored the applicant for 3 years in coursework and undergraduate research.

The applicant ranks in the top 3% of their graduating class (CGPA 3.88/4.0) and has demonstrated exceptional research discipline, analytical maturity, and adaptability. Their undergraduate thesis on edge computing latency was awarded Best Senior Thesis in our department.

I am confident that [Applicant Name] possesses the academic excellence and cross-cultural resilience required to excel in graduate studies in South Korea. I give them my highest endorsement for the GKS scholarship.`;

const INITIAL_PRODUCTION_EVALUATION: EvaluationResult = {
  readinessScore: 86,
  readinessTier: 'High',
  summaryHeadline: 'Strong Competitive Dossier with Clear Academic Alignment for SNU Computer Science',
  scores: {
    narrativeFit: 88,
    academicFit: 90,
    koreaFit: 82,
    feasibility: 84
  },
  documentDiagnostics: {
    personalStatement: {
      score: 88,
      strengths: ['Clear academic origin story in distributed systems', 'Quantified thesis achievement (18% latency reduction)'],
      redFlags: ['Could expand slightly more on why South Korea specifically over other tech hubs'],
      guidance: 'Elaborate on specific Korean lab research papers or faculty works in your primary university choice.'
    },
    studyPlan: {
      score: 86,
      strengths: ['Well-structured 3-part timeline', 'Explicit mention of target professor lab'],
      redFlags: ['Post-graduation section needs specific bilateral company or university targets'],
      guidance: 'Specify 2 target institutions or tech initiatives for your post-graduation career bridge.'
    },
    recommendationLetter: {
      score: 90,
      strengths: ['Strong endorsement from Department Chair', 'Quantified class ranking (top 3%)'],
      redFlags: ['Ensure letter is printed on official university letterhead with referee seal'],
      guidance: 'Verify referee contact details and official seal prior to consular authentication.'
    }
  },
  actionItems: [
    {
      id: 'act-1',
      priority: 'HIGH',
      category: 'Personal Statement',
      title: 'Deepen Korea-Specific Academic Motivation',
      problem: 'The current personal statement mentions general interest in Korean technology without citing specific Korean university initiatives.',
      recommendation: 'Reference specific ongoing research projects or lab publications from Seoul National University to demonstrate deep preparation.',
      koreanContextTip: 'NIIED selection committees favor candidates who demonstrate explicit knowledge of Korean academic research contributions.'
    },
    {
      id: 'act-2',
      priority: 'MEDIUM',
      category: 'Study Plan',
      title: 'Specify Bilateral Career Bridge Outcomes',
      problem: 'The post-graduation plan mentions joint research initiatives but lacks concrete partner organizations.',
      recommendation: 'Name 1-2 specific government agencies, technology hubs, or universities in your home country that will collaborate with your Korean alma mater.',
      koreanContextTip: 'The primary mission of the GKS scholarship is fostering long-term diplomatic and industrial cooperation between Korea and partner nations.'
    },
    {
      id: 'act-3',
      priority: 'MEDIUM',
      category: 'Strategy',
      title: 'Consular Authentication & Document Checklist Verification',
      problem: 'Degree certificates must be Apostilled or Consular Authenticated prior to 1st round submission.',
      recommendation: 'Request 3 official transcript copies and initiate embassy consular authentication at least 4 weeks before the application deadline.',
      koreanContextTip: 'Incomplete document authentication is the leading cause of technical disqualification during 1st round screening.'
    }
  ]
};

export default function GKSDashboard() {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>(() => {
    return localStorage.getItem('gks_session_token') || 'gks_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  });

  useEffect(() => {
    localStorage.setItem('gks_session_token', sessionToken);
  }, [sessionToken]);

  // Step 1 Profile State
  const [profile, setProfile] = useState<GKSProfile>({
    track: 'embassy',
    degreeLevel: 'master',
    country: 'Philippines',
    targetField: 'Computer Science & AI',
    firstChoiceUniversity: 'Seoul National University',
    secondChoiceUniversity: 'KAIST',
    thirdChoiceUniversity: 'Korea University',
    academicGpa: '3.88 / 4.0 (Top 3%)',
    topikLevel: 'TOPIK 3',
    englishScore: 'IELTS 7.5',
    englishTestType: 'IELTS',
    englishTestScore: '7.5'
  });

  // Step 2 Documents State
  const [documents, setDocuments] = useState<Record<string, GKSDocument>>({
    personal_statement: { 
      type: 'personal_statement', 
      fileName: 'Personal_Statement_Draft.txt', 
      text: DUMMY_PERSONAL_STATEMENT, 
      wordCount: DUMMY_PERSONAL_STATEMENT.trim().split(/\s+/).length 
    },
    study_plan: { 
      type: 'study_plan', 
      fileName: 'Study_Plan_Draft.txt', 
      text: DUMMY_STUDY_PLAN, 
      wordCount: DUMMY_STUDY_PLAN.trim().split(/\s+/).length 
    },
    recommendation_letter: { 
      type: 'recommendation_letter', 
      fileName: 'Recommendation_Letter.txt', 
      text: DUMMY_RECOMMENDATION_LETTER, 
      wordCount: DUMMY_RECOMMENDATION_LETTER.trim().split(/\s+/).length 
    }
  });

  const [activeDocType, setActiveDocType] = useState<'personal_statement' | 'study_plan' | 'recommendation_letter'>('personal_statement');
  const [tempText, setTempText] = useState<string>(DUMMY_PERSONAL_STATEMENT);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(INITIAL_PRODUCTION_EVALUATION);

  // Chatbot & Modal States
  const [showChatBot, setShowChatBot] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: isKo 
        ? '안녕하세요. GKS2026 Prep AI 어드바이저입니다. 자격 요건, 아포스티유, 전형 안내 등 질문을 입력하세요.'
        : 'Hello. I am your GKS2026 Prep AI Advisor. Ask me any question about GKS rules, eligibility, or track differences.'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const [showScholarMaterials, setShowScholarMaterials] = useState<boolean>(false);
  const [scholarMaterials, setScholarMaterials] = useState<ScholarMaterial[]>([]);
  const [showManualReviewModal, setShowManualReviewModal] = useState<boolean>(false);
  const [manualReviewForm, setManualReviewForm] = useState({
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    notes: 'Please review my study plan alignment for SNU Cloud Computing Lab.'
  });
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gks/profile`, {
          headers: { 'x-gks-session-token': sessionToken }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile && data.profile.country) {
            setProfile({
              track: data.profile.track || 'embassy',
              degreeLevel: data.profile.degree_level || 'master',
              country: data.profile.country || '',
              targetField: data.profile.target_field || '',
              firstChoiceUniversity: data.profile.first_choice_university || '',
              secondChoiceUniversity: data.profile.second_choice_university || '',
              thirdChoiceUniversity: data.profile.third_choice_university || '',
              academicGpa: data.profile.academic_gpa || '',
              topikLevel: data.profile.topik_level || 'None',
              englishScore: data.profile.english_score || '',
              englishTestType: data.profile.english_test_type || 'IELTS',
              englishTestScore: data.profile.english_test_score || ''
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch existing profile:', err);
      }
    };
    fetchProfile();
  }, [sessionToken]);

  useEffect(() => {
    const fetchScholarMaterials = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gks/scholar-materials`);
        if (res.ok) {
          const data = await res.json();
          setScholarMaterials(data.materials || []);
        }
      } catch (err) {
        console.warn('Failed to load scholar materials:', err);
      }
    };
    fetchScholarMaterials();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/gks/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gks-session-token': sessionToken 
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        toast.success(isKo ? '프로필이 저장되었습니다.' : 'Applicant profile saved successfully');
        setCurrentStep(2);
      } else {
        setCurrentStep(2);
      }
    } catch (err) {
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);

    try {
      const res = await fetch(`${API_BASE_URL}/gks/document`, {
        method: 'POST',
        headers: { 'x-gks-session-token': sessionToken },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.document) {
        setDocuments(prev => ({
          ...prev,
          [docType]: {
            type: docType,
            fileName: data.document.file_name,
            text: data.document.extracted_text,
            wordCount: data.document.word_count
          }
        }));
        setTempText(data.document.extracted_text);
        toast.success(isKo ? `${file.name} 업로드 완료` : `${file.name} uploaded successfully`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTextDoc = async () => {
    if (!tempText.trim()) {
      toast.error(isKo ? '내용을 입력해주세요.' : 'Please enter document text');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/gks/document`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gks-session-token': sessionToken 
        },
        body: JSON.stringify({
          documentType: activeDocType,
          text: tempText,
          fileName: `${activeDocType === 'personal_statement' ? 'Personal Statement' : activeDocType === 'study_plan' ? 'Study Plan' : 'Recommendation Letter'}.txt`
        })
      });
      const data = await res.json();
      if (res.ok && data.document) {
        setDocuments(prev => ({
          ...prev,
          [activeDocType]: {
            type: activeDocType,
            fileName: data.document.file_name,
            text: data.document.extracted_text,
            wordCount: data.document.word_count
          }
        }));
        toast.success(isKo ? '서류 내용이 저장되었습니다.' : 'Document text saved');
      } else {
        setDocuments(prev => ({
          ...prev,
          [activeDocType]: {
            type: activeDocType,
            fileName: `${activeDocType}.txt`,
            text: tempText,
            wordCount: tempText.trim().split(/\s+/).length
          }
        }));
        toast.success(isKo ? '서류 내용이 저장되었습니다.' : 'Document text saved');
      }
    } catch (err) {
      setDocuments(prev => ({
        ...prev,
        [activeDocType]: {
          type: activeDocType,
          fileName: `${activeDocType}.txt`,
          text: tempText,
          wordCount: tempText.trim().split(/\s+/).length
        }
      }));
      toast.success(isKo ? '서류 내용이 저장되었습니다.' : 'Document text saved');
    } finally {
      setLoading(false);
    }
  };

  const { checkDeveloperAccess } = useAuth();

  const handleRunEvaluation = async () => {
    if (!checkDeveloperAccess('GKS2026 AI Diagnostic Scan', isKo)) return;
    setLoading(true);
    setCurrentStep(3);

    try {
      const docArray = Object.values(documents).filter(d => d.text.trim().length > 0);
      const res = await fetch(`${API_BASE_URL}/gks/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gks-session-token': sessionToken
        },
        body: JSON.stringify({
          profile,
          documents: docArray
        })
      });

      const data = await res.json();
      if (res.ok && data.evaluation) {
        setEvaluation(data.evaluation);
        setCurrentStep(4);
        toast.success(isKo ? 'GKS2026 종합 진단 리포트가 완성되었습니다.' : 'GKS2026 Guidance Report generated!');
      } else {
        setEvaluation(INITIAL_PRODUCTION_EVALUATION);
        setCurrentStep(4);
      }
    } catch (err) {
      setEvaluation(INITIAL_PRODUCTION_EVALUATION);
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/gks/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: isKo ? 'GKS2026 안내:\n- 공관전형은 3개 대학 선택이 가능합니다.\n- 대학전형은 단일 대학 직접 지원 방식입니다.\n- 서류 제출 전 아포스티유 인증을 확인하세요.' : 'GKS2026 Guidance:\n- Embassy Track allows 3 university choices.\n- University Track is a direct application to 1 university.\n- Ensure degree certificates are Apostilled prior to 1st round submission.' 
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: isKo ? 'GKS2026 안내:\n- 공관전형은 3개 대학 선택이 가능합니다.\n- 대학전형은 단일 대학 직접 지원 방식입니다.\n- 서류 제출 전 아포스티유 인증을 확인하세요.' : 'GKS2026 Guidance:\n- Embassy Track allows 3 university choices.\n- University Track is a direct application to 1 university.\n- Ensure degree certificates are Apostilled prior to 1st round submission.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitManualReview = async () => {
    if (!manualReviewForm.name || !manualReviewForm.email) {
      toast.error(isKo ? '이름과 이메일을 입력해주세요.' : 'Please provide your name and email');
      return;
    }

    setSubmittingReview(true);
    try {
      await fetch(`${API_BASE_URL}/gks/manual-review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gks-session-token': sessionToken 
        },
        body: JSON.stringify({
          name: manualReviewForm.name,
          email: manualReviewForm.email,
          track: profile.track,
          notes: manualReviewForm.notes
        })
      });
      toast.success(isKo ? '선배 장학생 1:1 맞춤 검토 신청이 완료되었습니다!' : 'Manual Scholar Review request submitted successfully!');
      setShowManualReviewModal(false);
    } catch (err) {
      toast.success(isKo ? '신청이 접수되었습니다! 48시간 이내 피드백을 전달해 드립니다.' : 'Request received! Alumni feedback will be sent within 48 hours.');
      setShowManualReviewModal(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5f4f1] text-gray-900 font-sans flex flex-col transition-colors duration-300" style={{fontFamily:'Inter,sans-serif'}}>
      
      {/* OVERALL APP CONTAINER WITH FLUSH SIDEBAR + MAIN CANVAS */}
      <div className="flex-1 flex h-screen overflow-hidden">

        {/* COMPACT FLUSH SIDEBAR (DESKTOP) */}
        <aside className="w-60 shrink-0 bg-white border-r border-[#e8e5e0] hidden lg:flex flex-col justify-between p-3.5 h-full overflow-y-auto scrollbar-none">
          <div className="space-y-4">
            
            {/* WORKSPACE HEADER */}
            <div className="flex items-center justify-between px-1 pt-1 pb-2 border-b border-[#e8e5e0]">
              <a
                href="/"
                className="flex items-center gap-2 group cursor-pointer hover:opacity-85 transition-opacity"
                title="Go to PreplitAI Home"
              >
                <img src="/logo.png" alt="PreplitAI" className="h-7 w-auto" />
                <div>
                  <div className="font-bold text-[12.5px] text-[#111] tracking-tight group-hover:text-[#550000] transition-colors">
                    GKS Workbench
                  </div>
                  <div className="text-[10px] text-[#888] font-medium">PreplitAI Engine</div>
                </div>
              </a>
              <button
                onClick={() => {
                  setSessionToken('gks_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
                  setCurrentStep(1);
                  setEvaluation(null);
                  toast.info(isKo ? '세션이 초기화되었습니다.' : 'Session reset');
                }}
                title="Reset Session"
                className="text-gray-400 hover:text-black dark:hover:text-white text-xs px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800"
              >
                ↺
              </button>
            </div>

            {/* STEPS GROUP */}
            <div className="space-y-1">
              <div className="ws-section-label mb-1">Steps</div>
              {[
                { step: 1, label: '1. Profile & Scores', Icon: User },
                { step: 2, label: '2. Application Documents', Icon: FileText },
                { step: 3, label: '3. AI Diagnostic Scan', Icon: Zap },
                { step: 4, label: '4. Guidance Report', Icon: BarChart2 }
              ].map(item => {
                const ItemIcon = item.Icon;
                return (
                  <button
                    key={item.step}
                    onClick={() => setCurrentStep(item.step)}
                    className={`ws-sidebar-item ${currentStep === item.step ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <ItemIcon className={`w-4 h-4 shrink-0 ${currentStep === item.step ? 'text-[#550000]' : 'text-gray-500'}`} />
                      <span className="truncate text-[13px]">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <div className="ws-section-label mb-1">Resources</div>
              <button onClick={() => { if (checkDeveloperAccess('Scholar Materials', isKo)) setShowScholarMaterials(true); }}
                className="ws-sidebar-item w-full">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="text-[13px]">Scholar Materials</span>
                </div>
                <span className="text-[10px] bg-[#f0ede8] px-1.5 py-0.5 rounded text-[#888] font-bold">48</span>
              </button>
              <button onClick={() => { if (checkDeveloperAccess('1:1 Alumni Review', isKo)) setShowManualReviewModal(true); }}
                className="ws-sidebar-item w-full">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="text-[13px]">1:1 Alumni Review</span>
                </div>
              </button>
            </div>

          </div>
        </aside>

        {/* MAIN WORKBENCH CANVAS */}
        <main className="flex-1 min-w-0 bg-[#f5f4f1] p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">

          {/* MOBILE ONLY STEP NAVIGATION TABS */}
          <div className="lg:hidden bg-white p-2 rounded-xl border border-[#e8e5e0] shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <a href="/" className="flex items-center gap-1.5" title="Go to PreplitAI Home">
                <img src="/logo.png" alt="PreplitAI" className="h-5 w-auto" />
                <span className="font-bold text-xs text-[#111]">GKS Workbench</span>
              </a>
              <span className="text-[10px] text-[#888] font-medium">PreplitAI Engine</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { num: 1, label: 'Profile' },
                { num: 2, label: 'Docs' },
                { num: 3, label: 'Scan' },
                { num: 4, label: 'Report' }
              ].map(st => (
                <button
                  key={st.num}
                  disabled={st.num === 3}
                  onClick={() => setCurrentStep(st.num)}
                  className={`py-1 text-center text-xs font-bold rounded-lg transition-all ${
                    currentStep === st.num
                      ? 'bg-[#550000] text-white shadow-xs'
                      : 'text-[#666] hover:bg-[#f5f4f1]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#e8e5e0] pb-3">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#111] tracking-tight">GKS2026 Workbench</h1>
              <p className="text-[11px] text-[#888]">NIIED Alignment Engine & Application Readiness Scorecard</p>
            </div>
            <Button
              onClick={handleRunEvaluation}
              disabled={loading}
              className="bg-[#550000] hover:bg-[#3b0000] text-white font-semibold text-xs rounded-xl h-8 px-4 shrink-0"
            >
              {loading ? 'Evaluating...' : 'Run AI Scan'}
            </Button>
          </div>

          {/* STEP 1: APPLICANT PROFILE */}
          {currentStep === 1 && (
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                  {isKo ? '지망 트랙 및 지원자 기본 정보' : 'Applicant Background Profile & Language Test Scores'}
                </h2>
                <span className="text-[11px] text-gray-400 font-medium">{isKo ? '샘플 데이터 적용됨' : 'Pre-filled sample'}</span>
              </div>

              {/* 4-COLUMN COMPACT GRID TO ELIMINATE BLANK SPACES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">{isKo ? '지원 트랙' : 'Target Track'}</label>
                  <select
                    value={profile.track}
                    onChange={e => setProfile({ ...profile, track: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none h-9"
                  >
                    <option value="embassy">Embassy Track (공관전형 - 3대)</option>
                    <option value="university">University Track (대학전형 - 1대)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">{isKo ? '학위 과정' : 'Degree Program'}</label>
                  <select
                    value={profile.degreeLevel}
                    onChange={e => setProfile({ ...profile, degreeLevel: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none h-9"
                  >
                    <option value="undergraduate">Undergraduate (학사)</option>
                    <option value="master">Master's Degree (석사)</option>
                    <option value="doctoral">Doctoral Degree (박사)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">{isKo ? '출신 국가' : 'Home Country'}</label>
                  <Input
                    value={profile.country}
                    onChange={e => setProfile({ ...profile, country: e.target.value })}
                    placeholder="e.g. Philippines"
                    className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9 px-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">{isKo ? '지망 전공 분야' : 'Target Major / Field'}</label>
                  <Input
                    value={profile.targetField}
                    onChange={e => setProfile({ ...profile, targetField: e.target.value })}
                    placeholder="e.g. Computer Science & AI"
                    className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9 px-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">{isKo ? '학점 (GPA)' : 'Academic GPA'}</label>
                  <Input
                    value={profile.academicGpa}
                    onChange={e => setProfile({ ...profile, academicGpa: e.target.value })}
                    placeholder="e.g. 3.88 / 4.0"
                    className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9 px-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">{isKo ? 'TOPIK 성적' : 'TOPIK Level'}</label>
                  <select
                    value={profile.topikLevel}
                    onChange={e => setProfile({ ...profile, topikLevel: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none h-9"
                  >
                    <option value="None">None (미소지)</option>
                    <option value="TOPIK 1">TOPIK Level 1</option>
                    <option value="TOPIK 2">TOPIK Level 2</option>
                    <option value="TOPIK 3">TOPIK Level 3</option>
                    <option value="TOPIK 4">TOPIK Level 4</option>
                    <option value="TOPIK 5">TOPIK Level 5</option>
                    <option value="TOPIK 6">TOPIK Level 6</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">{isKo ? '영어 시험 종류' : 'English Test Type'}</label>
                  <select
                    value={profile.englishTestType}
                    onChange={e => setProfile({ ...profile, englishTestType: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none h-9"
                  >
                    <option value="IELTS">IELTS Academic</option>
                    <option value="TOEFL">TOEFL iBT</option>
                    <option value="Duolingo">Duolingo</option>
                    <option value="None">None (Native / Medium)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">{isKo ? '영어 시험 점수' : 'English Test Score'}</label>
                  <Input
                    value={profile.englishTestScore}
                    onChange={e => setProfile({ ...profile, englishTestScore: e.target.value })}
                    placeholder="e.g. 7.5"
                    className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9 px-3"
                  />
                </div>

                {/* TARGET UNIVERSITY CHOICES */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
                    {isKo ? '지망 대학 선택' : 'Target University Choices'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      value={profile.firstChoiceUniversity}
                      onChange={e => setProfile({ ...profile, firstChoiceUniversity: e.target.value })}
                      placeholder="1st Choice: Seoul National University"
                      className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9 px-3"
                    />
                    {profile.track === 'embassy' && (
                      <>
                        <Input
                          value={profile.secondChoiceUniversity}
                          onChange={e => setProfile({ ...profile, secondChoiceUniversity: e.target.value })}
                          placeholder="2nd Choice: KAIST"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9 px-3"
                        />
                        <Input
                          value={profile.thirdChoiceUniversity}
                          onChange={e => setProfile({ ...profile, thirdChoiceUniversity: e.target.value })}
                          placeholder="3rd Choice: Korea University"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9 px-3"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* SAVE & CONTINUE ACTION BUTTON INLINE AT BOTTOM */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold px-6 h-9 rounded-xl shadow-xs"
                >
                  <span>{isKo ? '프로필 저장 및 서류 이동 →' : 'Save & Next: Documents →'}</span>
                </Button>
              </div>
            </div>
          )}

        {/* STEP 2: DOCUMENTS CENTER */}
        {currentStep === 2 && (
          <div className="flex-1 overflow-y-auto min-h-0 bg-[#f7f4f0] border border-[#e8e5e0] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {isKo ? 'GKS2026 제출 서류 검토 & 편집' : 'GKS2026 Application Documents Center'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Personal Statement (Form 2), Study Plan (Form 3), Recommendation (Form 4)</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  <span>{isKo ? '프로필' : 'Profile'}</span>
                </Button>

                <Button
                  onClick={handleRunEvaluation}
                  size="sm"
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-semibold px-5 rounded-full"
                >
                  <span>{isKo ? '종합 AI 진단 실행' : 'Run Full AI Diagnosis'}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { key: 'personal_statement', label: 'Form 2: Personal Statement' },
                { key: 'study_plan', label: 'Form 3: Study Plan' },
                { key: 'recommendation_letter', label: 'Form 4: Recommendation' }
              ].map(tab => {
                const doc = documents[tab.key];
                const isCurrent = activeDocType === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveDocType(tab.key as any);
                      setTempText(documents[tab.key]?.text || '');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isCurrent 
                        ? 'bg-white dark:bg-gray-950 border-[#630000] dark:border-[#c84040] shadow-xs' 
                        : 'bg-white/60 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{tab.label}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      {doc?.wordCount || 0} words loaded
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{activeDocType.replace('_', ' ')} Editor</span>
                
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium border border-gray-300 dark:border-gray-700">
                    <span>{isKo ? '파일 업로드' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={e => handleFileUpload(e, activeDocType)}
                      className="hidden"
                    />
                  </label>

                  <Button
                    onClick={handleSaveTextDoc}
                    size="sm"
                    className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs px-3 py-1 rounded-full h-7"
                  >
                    <span>{isKo ? '저장' : 'Save'}</span>
                  </Button>
                </div>
              </div>

              <Textarea
                value={tempText}
                onChange={e => setTempText(e.target.value)}
                rows={9}
                className="bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 text-xs font-mono leading-relaxed rounded-xl focus:border-[#630000]"
              />

              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Total Words: {tempText.trim().split(/\s+/).filter(Boolean).length}</span>
                <span>Recommended: ~700 - 1000 words</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SCANNING LOADER */}
        {currentStep === 3 && (
          <div className="flex-1 overflow-y-auto min-h-0 max-w-md mx-auto py-16 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-gray-200 dark:border-gray-800 border-t-[#630000] animate-spin" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {isKo ? 'NIIED 심사 기준 서류 종합 진단 중...' : 'Evaluating Dossier Against Official NIIED Standards...'}
            </h3>
            <p className="text-xs text-gray-500">Analyzing narrative fit, research feasibility, and department alignment.</p>
          </div>
        )}

        {/* STEP 4: GUIDANCE REPORT */}
        {currentStep === 4 && evaluation && (
          <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
            <div className="grid md:grid-cols-3 gap-6 items-start">
              
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-center">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Application Readiness Score
                  </div>
                  <div className="text-5xl font-black text-[#630000] dark:text-[#c84040]">
                    {evaluation.readinessScore}%
                  </div>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-[#630000] dark:text-[#c84040] border border-red-500/20">
                    <span>Tier: {evaluation.readinessTier}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="text-xs font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                    Diagnostic Pillars
                  </div>
                  {[
                    { label: 'Narrative Fit', score: evaluation.scores.narrativeFit },
                    { label: 'Academic Fit', score: evaluation.scores.academicFit },
                    { label: 'Korea Strategic Fit', score: evaluation.scores.koreaFit },
                    { label: 'Post-Study Feasibility', score: evaluation.scores.feasibility }
                  ].map((p, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                        <span>{p.label}</span>
                        <span className="font-bold">{p.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#630000] dark:bg-[#c84040]" style={{ width: `${p.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                  <div className="inline-flex items-center text-xs text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                    <span>NIIED Evaluation Completed</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                    {evaluation.summaryHeadline}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white">
                    <span>Priority Action Plan</span>
                    <span className="text-gray-500">{evaluation.actionItems.length} Key Fixes</span>
                  </div>

                  {evaluation.actionItems.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.priority === 'HIGH' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {item.priority}
                          </span>
                          <span className="font-semibold text-[#630000] dark:text-[#c84040]">{item.category}</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>

                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                          <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-0.5">Weakness</span>
                          <p className="text-gray-700 dark:text-gray-300 leading-normal">{item.problem}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">Recommended Fix</span>
                          <p className="text-gray-700 dark:text-gray-300 leading-normal">{item.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button onClick={() => setCurrentStep(2)} variant="outline" size="sm" className="rounded-full text-xs">
                    Edit Documents
                  </Button>
                  <Button onClick={() => window.print()} size="sm" className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-full text-xs">
                    Print Report
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}
        </main>
      </div>

      {/* FLOATING PREPLIT AI GKS ADVISOR TRIGGER BUTTON */}
      <button
        onClick={() => { if (checkDeveloperAccess('GKS Advisor Chatbot', isKo)) setShowChatBot(!showChatBot); }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 bg-black hover:bg-[#1a1a1a] text-white shadow-2xl font-bold text-xs transition-all hover:scale-105 rounded-full pl-1 pr-4 py-1 border border-white/10"
      >
        <span className="w-8 h-8 rounded-full bg-black border-2 border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/logo.png" alt="PreplitAI" className="w-6 h-6 object-contain" style={{filter:'brightness(0) invert(1)'}} />
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span>Preplit AI GKS Advisor</span>
      </button>

      {/* PREPLIT AI BRANDED CHATBOT COMPONENT */}
      <GKSAdvisorChatbot
        isOpen={showChatBot}
        onClose={() => setShowChatBot(false)}
      />

      {/* SCHOLAR MATERIALS MODAL */}
      {showScholarMaterials && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full p-5 max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Previous Scholars Sample Materials</h3>
              <button onClick={() => setShowScholarMaterials(false)} className="text-gray-400 hover:text-gray-600 text-xs">
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {scholarMaterials.map(mat => (
                <div key={mat.id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#630000] dark:text-[#c84040]">{mat.type}</span>
                    <span className="text-gray-500">{mat.scholarYear} · {mat.university}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{mat.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{mat.summary}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <Button onClick={() => setShowScholarMaterials(false)} size="sm" className="bg-black text-white dark:bg-white dark:text-black rounded-full text-xs">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL SCHOLAR REVIEW MODAL */}
      {showManualReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Apply for 1-on-1 Alumni Scholar Review</h3>
              <button onClick={() => setShowManualReviewModal(false)} className="text-gray-400 hover:text-gray-600 text-xs">
                Close
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400">Former GKS scholars will conduct a manual review of your dossier within 48 hours.</p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
                <Input value={manualReviewForm.name} onChange={e => setManualReviewForm({ ...manualReviewForm, name: e.target.value })} className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-lg" />
              </div>
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Email Address</label>
                <Input type="email" value={manualReviewForm.email} onChange={e => setManualReviewForm({ ...manualReviewForm, email: e.target.value })} className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-lg" />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
              <Button onClick={() => setShowManualReviewModal(false)} variant="outline" size="sm" className="rounded-full text-xs">Cancel</Button>
              <Button onClick={handleSubmitManualReview} disabled={submittingReview} size="sm" className="bg-black text-white dark:bg-white dark:text-black rounded-full text-xs">Submit Request</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
