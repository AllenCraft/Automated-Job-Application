import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';

export interface ParsedResume {
  name?: string;
  email?: string;
  skills: string[];
  experience: string[];
  education: string[];
}

export interface MatchResult {
  score: number;
  reasoning: string;
  category: 'Class A' | 'Class B' | 'Class C';
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY || 'mock_key',
});

async function callOpenAI(prompt: string, systemPrompt: string) {
  if (!OPENAI_API_KEY) return null;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      },
      { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return null;
  }
}

async function callClaude(prompt: string, systemPrompt: string) {
  if (!ANTHROPIC_API_KEY) {
    console.log('No Anthropic API Key found, using mock Claude response.');
    return null;
  }
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });
    // @ts-ignore
    return message.content[0].text;
  } catch (error) {
    console.error('Error calling Claude:', error);
    return null;
  }
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const systemPrompt = "You are an expert HR assistant. Parse the resume into JSON: { name, email, skills: [], experience: [], education: [] }";
  const result = await callOpenAI(resumeText, systemPrompt);
  if (result) return JSON.parse(result);

  return {
    name: "John Doe",
    email: "john@example.com",
    skills: ["TypeScript", "Next.js", "React"],
    experience: ["Senior Developer at Tech Corp"],
    education: ["B.S. CS"]
  };
}

export async function scoreJob(resume: ParsedResume, jobDescription: string): Promise<MatchResult> {
  const prompt = `Match resume: ${JSON.stringify(resume)} with job: ${jobDescription}. Return JSON: { score (0-100), reasoning }`;
  const systemPrompt = "Expert technical recruiter. Match strictly.";
  const result = await callOpenAI(prompt, systemPrompt);

  let score = 50;
  let reasoning = "Mock: Base score.";

  if (result) {
    const data = JSON.parse(result);
    score = data.score;
    reasoning = data.reasoning;
  } else {
    // Basic mock logic
    if (jobDescription.toLowerCase().includes('typescript')) score += 30;
  }

  let category: 'Class A' | 'Class B' | 'Class C' = 'Class C';
  if (score > 85) category = 'Class A';
  else if (score >= 70) category = 'Class B';

  return { score, reasoning, category };
}

export async function generateCoverLetter(resume: ParsedResume, jobTitle: string, company: string, jobDescription: string): Promise<string> {
  const systemPrompt = "You are a career coach. Generate a TRUTHFUL, tailored cover letter. NEVER falsify experience.";
  const prompt = `Candidate: ${JSON.stringify(resume)}\nJob: ${jobTitle} at ${company}\nJD: ${jobDescription}`;

  const result = await callClaude(prompt, systemPrompt);
  if (result) return result;

  return `Dear ${company} Team,\n\nI am excited to apply for the ${jobTitle} role. Based on my experience in ${resume.skills.join(', ')}, I believe I am a strong fit...`;
}

export async function optimizeResume(resume: ParsedResume, jobDescription: string): Promise<string> {
  const systemPrompt = "You are a professional resume optimizer. Rephrase and highlight REAL skills from the candidate's profile that match the JD. DO NOT ADD NEW SKILLS.";
  const prompt = `Candidate: ${JSON.stringify(resume)}\nJD: ${jobDescription}`;

  const result = await callClaude(prompt, systemPrompt);
  if (result) return result;

  return `Optimized Resume for JD: ${resume.name}\nSkills: ${resume.skills.join(', ')}...`;
}
