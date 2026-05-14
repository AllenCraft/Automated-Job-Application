import { parseResume, scoreJob, generateCoverLetter, optimizeResume } from '../lib/services/aiService';

async function main() {
  console.log('Testing AI Service with Anthropic and OpenAI logic...');

  const resumeText = "Experienced Software Engineer with skills in TypeScript and Next.js. Worked at ABC Tech for 5 years.";
  const parsed = await parseResume(resumeText);
  console.log('Parsed Resume:', parsed);

  const jobDescription = "We are looking for a Senior Developer proficient in TypeScript and React. Remote work available.";
  const match = await scoreJob(parsed, jobDescription);
  console.log('Match Result:', match);

  const coverLetter = await generateCoverLetter(parsed, "Senior Developer", "Tech Giant", jobDescription);
  console.log('Generated Cover Letter:\n', coverLetter);

  const optimized = await optimizeResume(parsed, jobDescription);
  console.log('Optimized Resume:\n', optimized);

  if (parsed.skills.length > 0 && match.category && optimized.length > 0) {
    console.log('AI Service test passed!');
  } else {
    console.error('AI Service test failed!');
    process.exit(1);
  }
}

main().catch(console.error);
