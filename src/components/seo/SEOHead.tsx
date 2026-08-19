import { Helmet } from "react-helmet-async";
import { SITE_NAME, DEFAULT_SITE_URL } from "@/constants/config";

export type SEOHeadProps = {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  image?: string;
  url?: string;
  robots?: string; // e.g., "index,follow" or "noindex,nofollow"
  canonical?: string;
  schemaMarkup?: Record<string, any> | Record<string, any>[];
  twitterCard?: "summary" | "summary_large_image";
};

const DEFAULT_IMAGE = `${DEFAULT_SITE_URL}/logo.png`;

export function SEOHead({
  title = "AI Study Companion & GKS Prep Workspace",
  description = "Transform lecture slides, PDFs, and textbooks into grounded study tools, adaptive quizzes, smart flashcards, and GKS scholarship preparation.",
  keywords = [
    "Preplit AI",
    "AI study companion",
    "GKS scholarship preparation",
    "GKS personal statement evaluation",
    "Korean university study tools",
    "grounded AI tutor",
    "active recall quiz generator",
    "predicted exam questions",
  ],
  image = DEFAULT_IMAGE,
  url,
  robots = "index,follow",
  canonical,
  schemaMarkup,
  twitterCard = "summary_large_image",
}: SEOHeadProps) {
  const resolvedUrl = url || (typeof window !== "undefined" ? window.location.href : DEFAULT_SITE_URL);
  const cleanCanonical = canonical || (resolvedUrl ? resolvedUrl.split("?")[0].split("#")[0] : DEFAULT_SITE_URL);
  const titleTag = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const keywordsStr = Array.isArray(keywords) ? keywords.join(", ") : keywords;
  const schemas = Array.isArray(schemaMarkup) ? schemaMarkup : schemaMarkup ? [schemaMarkup] : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{titleTag}</title>
      <meta name="description" content={description} />
      {keywordsStr && <meta name="keywords" content={keywordsStr} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={cleanCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={titleTag} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={cleanCanonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={titleTag} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
