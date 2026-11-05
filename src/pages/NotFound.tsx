import { Link } from "react-router-dom";
import { useLang } from "@/lib/lang";
import { SitePage } from "@/site/SitePage";

export default function NotFound() {
  const { lang } = useLang();
  const ko = lang === "ko";
  return (
    <SitePage title={ko ? "없는 페이지 · Junbee" : "Page not found · Junbee"} noindex>
      <section className="page py-24 sm:py-32">
        <h1 className="display text-4xl">{ko ? "없는 페이지예요." : "This page does not exist."}</h1>
        <p className="mt-4 text-lg text-ink/75">
          {ko ? "주소를 확인하거나 처음으로 돌아가세요." : "Check the address, or go back to the start."}
        </p>
        <Link to="/" className="btn-ink mt-8">
          {ko ? "처음으로" : "Go to the start"}
        </Link>
      </section>
    </SitePage>
  );
}
