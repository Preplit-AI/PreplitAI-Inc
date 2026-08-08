import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TalkToSales = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white">
          {isKo ? '영업팀 문의' : 'Talk to Sales'}
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          {isKo
            ? '대학 학과, 연구실 또는 기관 솔루션에 대해 문의해 주세요. 영업 담당자가 1 영업일 이내에 답변해 드립니다.'
            : 'Tell us about your team and goals. A PreplitAI specialist will reach out within 1 business day.'}
        </p>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{isKo ? '성함' : 'Full name'}</Label>
                <Input id="name" required placeholder={isKo ? "홍길동" : "Jane Doe"} className="mt-2 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
              </div>
              <div>
                <Label htmlFor="email">{isKo ? '업무 이메일' : 'Work email'}</Label>
                <Input id="email" type="email" required placeholder={isKo ? "name@univ.ac.kr" : "jane@company.com"} className="mt-2 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">{isKo ? '소속 기관 / 대학교 / 기업' : 'Institution / Company'}</Label>
                <Input id="company" required placeholder={isKo ? "서울대학교 공과대학" : "Acme Inc."} className="mt-2 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
              </div>
              <div>
                <Label>{isKo ? '예상 이용 인원' : 'Team size'}</Label>
                <Select>
                  <SelectTrigger className="mt-2 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder={isKo ? "선택하세요" : "Select"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10명</SelectItem>
                    <SelectItem value="11-50">11-50명</SelectItem>
                    <SelectItem value="51-200">51-200명</SelectItem>
                    <SelectItem value="201-1000">201-1000명</SelectItem>
                    <SelectItem value=">1000">1000명 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">{isKo ? '연락처 (선택)' : 'Phone (optional)'}</Label>
                <Input id="phone" placeholder="010-0000-0000" className="mt-2 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
              </div>
              <div>
                <Label>{isKo ? '도입 예상 시기' : 'Timeline'}</Label>
                <Select>
                  <SelectTrigger className="mt-2 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder={isKo ? "선택하세요" : "Choose"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">{isKo ? '즉시 도입' : 'Immediately'}</SelectItem>
                    <SelectItem value="1-3">{isKo ? '1-3개월 이내' : '1-3 months'}</SelectItem>
                    <SelectItem value="3-6">{isKo ? '3-6개월 이내' : '3-6 months'}</SelectItem>
                    <SelectItem value=">6">{isKo ? '6개월 이후' : '6+ months'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="use">{isKo ? '주요 도입 목적' : 'Primary use case'}</Label>
              <Input id="use" placeholder={isKo ? "예: 학과 단위 AI 스터디 지원, 족보 분석, 대량 라이선스" : "e.g. AI lectures, enterprise search, agents"} className="mt-2 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
            </div>

            <div>
              <Label htmlFor="msg">{isKo ? '추가 문의 사항' : 'Anything else?'}</Label>
              <Textarea id="msg" placeholder={isKo ? "학업 요구사항 및 구체적인 전달 사항을 입력해 주세요." : "Goals, workflow, requirements…"} className="mt-2 min-h-[140px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
            </div>

            <Button type="submit" className="h-11 px-8 rounded-xl bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold">
              {isKo ? '문의 제출하기' : 'Submit'}
            </Button>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-black dark:text-white">{isKo ? '담당자 연락처' : 'Contact information'}</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li><span className="font-medium">{isKo ? '영업 문의:' : 'Sales:'}</span> preplitai@gmail.com</li>
              <li><span className="font-medium">{isKo ? '고객 지원:' : 'Support:'}</span> preplitai@gmail.com</li>
              <li><span className="font-medium">{isKo ? '운영 시간:' : 'Hours:'}</span> 월–금, 9am–6pm KST</li>
              <li><span className="font-medium">{isKo ? '위치:' : 'Address:'}</span> 대한민국 서울 (Seoul, South Korea)</li>
              <li className="text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-800">
                {isKo ? '대학 및 연구기관 전용 보안 검토 및 SLA 지원 가능.' : 'Enterprise SLAs and security reviews available.'}
              </li>
            </ul>
          </div>
        </aside>
      </section>

      <Footer />
    </div>
  );
};

export default TalkToSales;
