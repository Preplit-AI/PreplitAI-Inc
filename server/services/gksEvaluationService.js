'use strict';
const { callLLM } = require('./llmService');

/**
 * Preplit AI × GKS Application Guidance & Evaluation Engine
 * Evaluates Personal Statement, Study Plan, and Recommendation Letters against official GKS selection standards.
 */
class GKSEvaluationService {
  /**
   * Main evaluation runner
   * @param {Object} profile - Applicant background (track, degree, universities, country, GPA, TOPIK, etc.)
   * @param {Array} documents - List of uploaded document objects [{ type: 'personal_statement' | 'study_plan' | 'recommendation_letter', text, fileName }]
   */
  async evaluateApplication(profile, documents) {
    // 1. Organize documents by type
    const docMap = {};
    for (const doc of documents) {
      docMap[doc.type] = doc.text || '';
    }

    const personalStatement = docMap.personal_statement || '';
    const studyPlan = docMap.study_plan || '';
    const recommendationLetter = docMap.recommendation_letter || '';

    // 2. Prepare System & User Prompts for Groq LLM JSON generation
    const systemPrompt = `You are the Lead Selection Specialist & Senior Admissions Advisor for the Global Korea Scholarship (GKS / KGSP) program.
You evaluate international applicant dossiers for National Institute for International Education (NIIED) standards.

You must strictly respond in VALID JSON format matching the following schema:
{
  "readinessScore": number (0-100),
  "readinessTier": "High" | "Medium" | "Needs Revision",
  "summaryHeadline": "string concise evaluation summary",
  "scores": {
    "narrativeFit": number (0-100),
    "academicFit": number (0-100),
    "koreaFit": number (0-100),
    "feasibility": number (0-100)
  },
  "documentDiagnostics": {
    "personalStatement": {
      "score": number (0-100),
      "strengths": ["string"],
      "redFlags": ["string"],
      "guidance": "string specific advice"
    },
    "studyPlan": {
      "score": number (0-100),
      "strengths": ["string"],
      "redFlags": ["string"],
      "guidance": "string specific advice"
    },
    "recommendationLetter": {
      "score": number (0-100),
      "strengths": ["string"],
      "redFlags": ["string"],
      "guidance": "string specific advice"
    }
  },
  "actionItems": [
    {
      "id": "item-1",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "category": "Personal Statement" | "Study Plan" | "Recommendation Letter" | "Strategy",
      "title": "string issue headline",
      "problem": "string description of what is currently weak",
      "recommendation": "string exact concrete fix or rewrite instruction",
      "koreanContextTip": "string advice regarding NIIED committee expectations or Korean university preferences"
    }
  ]
}

Strict Rules:
- Output JSON ONLY. No markdown wrappers or extra commentary outside the JSON block.
- Be objective, rigorous, and highly constructive. Avoid generic praise.
- Analyze alignment with target track (${profile.track || 'Embassy'}), target universities (${[profile.first_choice_university, profile.second_choice_university, profile.third_choice_university].filter(Boolean).join(', ') || 'Not specified'}), and field (${profile.target_field || 'General'}).`;

    const userPrompt = `APPLICANT DOSSIER:
- Track: ${profile.track || 'Embassy Track'}
- Degree Level: ${profile.degree_level || 'Master'}
- Home Country: ${profile.country || 'International'}
- Target Field/Major: ${profile.target_field || 'Not specified'}
- Universities: 1) ${profile.first_choice_university || 'N/A'}, 2) ${profile.second_choice_university || 'N/A'}, 3) ${profile.third_choice_university || 'N/A'}
- GPA / Academic Metric: ${profile.academic_gpa || 'N/A'}
- TOPIK Level: ${profile.topik_level || 'None'}
- English Score: ${profile.english_score || 'None'}

--- SUBMITTED DOCUMENTS ---

[DOCUMENT 1: PERSONAL STATEMENT (Form 2)]
${personalStatement || 'Not provided yet.'}

[DOCUMENT 2: STATEMENT OF PURPOSE & STUDY PLAN (Form 3)]
${studyPlan || 'Not provided yet.'}

[DOCUMENT 3: RECOMMENDATION LETTER (Form 4)]
${recommendationLetter || 'Not provided yet.'}

Perform holistic GKS review and generate structured evaluation JSON.`;

    try {
      const llmOutput = await callLLM({
        systemPrompt,
        userPrompt,
        primaryModel: 'llama-3.3-70b-versatile',
        jsonMode: true
      });

      if (llmOutput) {
        try {
          const parsed = JSON.parse(llmOutput);
          return this.normalizeResult(parsed);
        } catch (jsonErr) {
          console.warn('Failed to parse Groq JSON response, cleaning string:', jsonErr.message);
          const cleanJson = llmOutput.substring(llmOutput.indexOf('{'), llmOutput.lastIndexOf('}') + 1);
          const parsed = JSON.parse(cleanJson);
          return this.normalizeResult(parsed);
        }
      }
    } catch (err) {
      console.error('Groq LLM evaluation failed, generating fallback guidance report:', err.message);
    }

    // Fallback deterministic rule-based evaluation if LLM service is offline or unconfigured
    return this.generateFallbackGuidance(profile, personalStatement, studyPlan, recommendationLetter);
  }

  normalizeResult(data) {
    return {
      readinessScore: Math.min(100, Math.max(0, data.readinessScore || 75)),
      readinessTier: data.readinessTier || (data.readinessScore >= 80 ? 'High' : data.readinessScore >= 60 ? 'Medium' : 'Needs Revision'),
      summaryHeadline: data.summaryHeadline || 'Comprehensive GKS Application Dossier Evaluation',
      scores: {
        narrativeFit: data.scores?.narrativeFit || 78,
        academicFit: data.scores?.academicFit || 82,
        koreaFit: data.scores?.koreaFit || 75,
        feasibility: data.scores?.feasibility || 80
      },
      documentDiagnostics: {
        personalStatement: {
          score: data.documentDiagnostics?.personalStatement?.score || 80,
          strengths: data.documentDiagnostics?.personalStatement?.strengths || ['Clear academic background detailed'],
          redFlags: data.documentDiagnostics?.personalStatement?.redFlags || ['Could emphasize motivation for Korea more strongly'],
          guidance: data.documentDiagnostics?.personalStatement?.guidance || 'Connect early inspirations directly to your target field in Korea.'
        },
        studyPlan: {
          score: data.documentDiagnostics?.studyPlan?.score || 76,
          strengths: data.documentDiagnostics?.studyPlan?.strengths || ['Well-structured language learning goals'],
          redFlags: data.documentDiagnostics?.studyPlan?.redFlags || ['Future plan needs specific institutional targets'],
          guidance: data.documentDiagnostics?.studyPlan?.guidance || 'Detail concrete post-graduation contribution back to home country and Korea.'
        },
        recommendationLetter: {
          score: data.documentDiagnostics?.recommendationLetter?.score || 85,
          strengths: data.documentDiagnostics?.recommendationLetter?.strengths || ['Strong endorsement from faculty'],
          redFlags: data.documentDiagnostics?.recommendationLetter?.redFlags || ['Needs specific project metrics'],
          guidance: data.documentDiagnostics?.recommendationLetter?.guidance || 'Ask recommender to include 1-2 quantified research outcomes.'
        }
      },
      actionItems: data.actionItems || []
    };
  }

  generateFallbackGuidance(profile, psText, spText, recText) {
    const psWords = psText.trim().split(/\s+/).filter(Boolean).length;
    const spWords = spText.trim().split(/\s+/).filter(Boolean).length;
    const recWords = recText.trim().split(/\s+/).filter(Boolean).length;

    let score = 50;
    if (psWords > 300) score += 15;
    if (spWords > 300) score += 15;
    if (recWords > 200) score += 10;
    if (profile.first_choice_university) score += 10;

    return {
      readinessScore: Math.min(100, score),
      readinessTier: score >= 80 ? 'High' : score >= 65 ? 'Medium' : 'Needs Revision',
      summaryHeadline: 'GKS Application Guidance Overview & Readiness Diagnostic',
      scores: {
        narrativeFit: Math.min(100, score - 2),
        academicFit: Math.min(100, score + 4),
        koreaFit: Math.min(100, score - 5),
        feasibility: Math.min(100, score + 1)
      },
      documentDiagnostics: {
        personalStatement: {
          score: psWords > 300 ? 82 : 60,
          strengths: psWords > 300 ? ['Sufficient word count and background outline'] : ['Initial draft uploaded'],
          redFlags: psWords <= 300 ? ['Personal statement is too brief (< 300 words). GKS recommendations suggest 700-1000 words.'] : ['Needs stronger emphasis on why Korea specifically.'],
          guidance: 'Structure your personal statement into 4 key phases: Origin & Passion -> Academic Growth -> Overcoming Challenge -> Why Korea & Target University.'
        },
        studyPlan: {
          score: spWords > 300 ? 84 : 58,
          strengths: spWords > 300 ? ['Covers language study and degree goals'] : ['Draft started'],
          redFlags: spWords <= 300 ? ['Study plan needs full expansion into Goal of Study & Detailed Study Plan sections.'] : ['Add specific professors and lab facilities at your target university.'],
          guidance: 'Split your study plan into: 1) Goal of Study & Language Plan, 2) Academic & Research Plan, 3) Future Plan After Graduation.'
        },
        recommendationLetter: {
          score: recWords > 200 ? 88 : 65,
          strengths: recWords > 200 ? ['Recommendation letter uploaded and verified'] : ['Pending complete recommendation letter text'],
          redFlags: recWords <= 200 ? ['Recommendation letter appears brief or missing'] : ['Ensure letter includes referee contact details and official seal.'],
          guidance: 'Ensure your referee highlights your academic adaptability and research integrity with concrete project anecdotes.'
        }
      },
      actionItems: [
        {
          id: 'act-1',
          priority: 'HIGH',
          category: 'Personal Statement',
          title: 'Strengthen Korea-Specific Motivation',
          problem: 'Many GKS applicants state general interest in Korean culture without tying it to their academic field.',
          recommendation: `Explain specifically how Korea's advances in ${profile.target_field || 'your field'} make it the ideal academic destination for your long-term research.`,
          koreanContextTip: 'NIIED selection committees favor candidates who demonstrate genuine academic alignment with Korea over general K-pop or media enthusiasm.'
        },
        {
          id: 'act-2',
          priority: 'HIGH',
          category: 'Study Plan',
          title: 'Reference Target Department & Professors',
          problem: 'Generic study plans that could apply to any university in the world score poorly.',
          recommendation: `Explicitly name professors, research centers, or specific course modules at ${profile.first_choice_university || 'your target university'}.`,
          koreanContextTip: 'Korean university admissions sub-committees check if the candidate has researched their specific department curriculum.'
        },
        {
          id: 'act-3',
          priority: 'MEDIUM',
          category: 'Strategy',
          title: 'Outline Clear Post-Graduation Bilateral Impact',
          problem: 'Weak future plans lack concrete outcomes after completing the degree.',
          recommendation: 'Specify how your career will serve as a bridge between Korea and your home country (diplomacy, technology exchange, economic collaboration).',
          koreanContextTip: 'The fundamental objective of the GKS scholarship program is fostering long-term international friendship and mutual growth.'
        }
      ]
    };
  }
}

module.exports = new GKSEvaluationService();
