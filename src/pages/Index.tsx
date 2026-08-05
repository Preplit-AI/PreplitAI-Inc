import { Hero } from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import { WorkspaceTeaserSection } from "@/components/home/WorkspaceTeaserSection";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://yourdomain.com";
  const canonical = `${siteUrl}/`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PreplitAI",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: [
        "https://twitter.com/preplitai",
        "https://www.linkedin.com/company/preplitai"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PreplitAI",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description: "AI Study Companion workspace with grounded chat, quizzes, flashcards, summaries & predicted exams.",
      url: siteUrl
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] overflow-x-hidden">
      <SEOHead
        title="PreplitAI — AI Study Companion & Workspace"
        description="Transform course materials into grounded AI study spaces. Grounded Chat, Quizzes, Flashcards, Summaries, Podcasts, and Predicted Exams."
        keywords={["AI study companion", "grounded RAG chat", "AI flashcards", "AI quiz generator", "predicted exam generator"]}
        url={canonical}
        canonical={canonical}
        schemaMarkup={schema}
      />
      <Hero onGetStarted={() => { window.location.href = '/preplitai-chat'; }} />
      <HowItWorks />
      <Features />
      <WorkspaceTeaserSection />

      {/* Bottom CTA Section */}
      <section className="bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 py-28 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Start studying smarter
            <br />
            <span className="text-[#c84040]">in minutes, not hours.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of students who use PreplitAI to master their course materials faster with grounded AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild
              className="text-[15px] px-8 py-3 h-12 bg-white hover:bg-gray-100 text-black rounded-full font-medium transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              <a href="/preplitai-chat" className="flex items-center gap-2">
                <span>Launch Workspace Free</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="text-[15px] px-8 py-3 h-12 rounded-full font-medium border border-white/20 bg-transparent text-white hover:bg-white/10 transition-all duration-200"
            >
              <a href="/pricing">View Subscription Plans</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
