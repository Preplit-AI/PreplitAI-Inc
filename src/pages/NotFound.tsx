import { JunoFigure } from "@/brand/Juno";
import { useLang } from "@/lib/lang";
import { siteCopy } from "@/site/copy";
import { SitePage } from "@/site/SitePage";

export default function NotFound() {
  const { lang } = useLang();
  const ko = lang === "ko";
  return (
    <SitePage title={ko ? "없는 페이지 · Preplit AI" : "Page not found · Preplit AI"} noindex>
      <section className="page grid gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-6">
          <h1 className="display text-[2.75rem] leading-[1.1]">{ko ? "없는 페이지예요." : "This page does not exist."}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink">
            {ko ? "주소를 확인하거나 처음으로 돌아가세요." : "Check the address, or go back to the start."}
          </p>
          <a href={siteCopy[lang].home} className="btn-ink mt-8">
            {ko ? "처음으로" : "Go to the start"}
          </a>
        </div>
        <div className="glass glass-sky flex min-h-[16rem] items-center justify-center rounded-panel lg:col-span-6">
          <JunoFigure size={208} mood="work" />
        </div>
      </section>
    </SitePage>
  );
}
