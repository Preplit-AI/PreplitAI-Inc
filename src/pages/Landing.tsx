import { Link } from "react-router-dom";
import { Bee } from "@/brand/Bee";
import { HexNumeral } from "@/brand/Comb";
import { JunbeeMessage } from "@/brand/JunbeeMessage";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/cn";
import { siteCopy } from "@/site/copy";
import { ExampleNote } from "@/site/ExampleNote";
import { ReviewDemo } from "@/site/ReviewDemo";
import { SitePage } from "@/site/SitePage";

export default function Landing() {
  const { lang } = useLang();
  const t = siteCopy[lang];
  const reading = lang === "ko" ? "font-kr" : "font-serif";

  return (
    <SitePage title={t.meta.title} description={t.meta.description} path="/">
      {/* Hero */}
      <section className="page grid gap-12 pb-20 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="lg:col-span-7 lg:pt-6">
          <h1 className="display text-[2.4rem] leading-[1.15] sm:text-5xl sm:leading-[1.12] lg:text-[3.6rem]">
            <span className="block">{t.hero.title[0]}</span>
            <span className="block">{t.hero.title[1]}</span>
          </h1>
          <p className={cn("mt-6 max-w-[34rem] text-lg leading-relaxed text-ink/80", reading)}>{t.hero.body}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/signup" className="btn-primary min-h-[52px] px-7 text-base">
              {t.hero.cta}
            </Link>
            <a href="#learn" className="btn-text">
              {t.hero.secondary}
            </a>
          </div>
          <p className="mt-6 text-sm text-slate">{t.hero.pilotNote}</p>
        </div>
        <div className="lg:col-span-5">
          <ExampleNote t={t.example} className="mx-auto max-w-[30rem] lg:ml-auto" />
        </div>
      </section>

      {/* Belief */}
      <section className="border-t border-rule">
        <div className="page grid gap-6 py-16 sm:py-20 lg:grid-cols-12">
          <h2 className="display text-[1.9rem] leading-tight sm:text-3xl lg:col-span-5">{t.belief.title}</h2>
          <p className={cn("max-w-read text-lg leading-relaxed text-ink/80 lg:col-span-6 lg:col-start-7", reading)}>
            {t.belief.body}
          </p>
        </div>
      </section>

      {/* Learn */}
      <section id="learn" className="scroll-mt-20 border-t border-rule">
        <div className="page py-16 sm:py-24">
          <MovementName name={t.learn.name} />
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{t.learn.line}</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
            {t.learn.steps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <HexNumeral n={i + 1} className="shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className={cn("mt-2 max-w-[30rem] text-base leading-relaxed text-ink/75", reading)}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Remember */}
      <section id="remember" className="scroll-mt-20 border-t border-rule">
        <div className="page grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <MovementName name={t.remember.name} />
            <h2 className="display mt-3 text-[2rem] sm:text-4xl">{t.remember.line}</h2>
            <div className="mt-12 flex gap-5">
              <HexNumeral n={3} className="shrink-0" />
              <div>
                <h3 className="text-xl font-semibold">{t.remember.stepTitle}</h3>
                <p className={cn("mt-2 max-w-[30rem] text-base leading-relaxed text-ink/75", reading)}>{t.remember.body}</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <ReviewDemo t={t.remember.demo} />
          </div>
        </div>
      </section>

      {/* Junbee */}
      <section className="bg-ink text-bone">
        <div className="page grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bone">
              <Bee className="h-12 w-auto" />
            </div>
            <h2 className="display mt-8 text-[2rem] leading-tight text-bone sm:text-4xl">{t.junbee.title}</h2>
            <p className={cn("mt-5 max-w-[30rem] text-lg leading-relaxed text-bone/75", reading)}>{t.junbee.body}</p>
          </div>
          <ul className="flex flex-col gap-7 lg:col-span-6 lg:col-start-7 lg:pt-4">
            {t.junbee.messages.map((m) => (
              <li key={m.when}>
                <p className="mb-2.5 text-sm text-bone/60">{m.when}</p>
                <JunbeeMessage text={m.text} className="border-transparent" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Promise */}
      <section>
        <div className="page py-16 sm:py-24">
          <h2 className="display max-w-[40rem] text-[2rem] leading-tight sm:text-4xl">{t.promise.line}</h2>
          <dl className="mt-12 grid gap-x-12 sm:grid-cols-2">
            {t.promise.items.map((item) => (
              <div key={item.title} className="border-t border-rule py-6">
                <dt className="text-lg font-semibold">{item.title}</dt>
                <dd className={cn("mt-2 max-w-[32rem] leading-relaxed text-ink/75", reading)}>{item.body}</dd>
              </div>
            ))}
          </dl>
          <Link to="/privacy" className="btn-text mt-4">
            {t.promise.privacyLink}
          </Link>
        </div>
      </section>

      {/* Start */}
      <section className="border-t border-rule">
        <div className="page flex flex-col items-start gap-6 py-16 sm:py-24 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="display text-[2.6rem] sm:text-5xl">{t.final.title}</h2>
            <p className={cn("mt-4 text-lg text-ink/75", reading)}>{t.final.body}</p>
          </div>
          <Link to="/signup" className="btn-primary min-h-[52px] px-7 text-base">
            {t.final.cta}
          </Link>
        </div>
      </section>
    </SitePage>
  );
}

/** The movement this section belongs to, matching the app's navigation. */
function MovementName({ name }: { name: string }) {
  return (
    <p className="flex items-center gap-2 text-base font-semibold text-ink">
      <svg viewBox="0 0 20 23" aria-hidden="true" className="h-4 w-auto">
        <polygon points="10,1 19,6.25 19,16.75 10,22 1,16.75 1,6.25" className="fill-honey" />
      </svg>
      {name}
    </p>
  );
}
