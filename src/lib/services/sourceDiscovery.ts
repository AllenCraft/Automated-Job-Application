import Anthropic from '@anthropic-ai/sdk';
import prisma from '../prisma';

if (!prisma) {
  console.error("Prisma client is undefined in sourceDiscovery.ts!");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock_key',
});

export async function discoverNewJobSources() {
  console.log('AI discovering new job sources...');

  const profile = await prisma.candidateProfile.findFirst();
  if (!profile) return;

  const existingSources = await prisma.jobSource.findMany({
    select: { url: true }
  });
  const existingUrls = existingSources.map(s => s.url).join(', ');

  const prompt = `You are an expert recruitment researcher focused on remote work.
  Based on the candidate's profile:
  "${profile.parsedResume || profile.resumeText}"

  Identify 3-5 high-quality remote job boards, company career pages, or niche hiring platforms that frequently list "work from anywhere" or "remote" jobs in their industry.

  Exclude these already known URLs: [${existingUrls}]

  Return ONLY a JSON array of objects with 'name', 'url', and 'type' (RSS, API, or SCRAPE).
  If it's an RSS feed you know for the site, provide that URL.

  Example: [{"name": "Working Nomads", "url": "https://www.workingnomads.com/jobs/feed", "type": "RSS"}]`;

  try {
    let sources = [];
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      });
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      sources = JSON.parse(content);
    } else {
      // Mock discovery for verification
      sources = [
        { name: "Working Nomads", url: "https://www.workingnomads.com/jobs/feed", type: "RSS" },
        { name: "Hacker News Remote", url: "https://hnrss.org/jobs?q=Remote", type: "RSS" }
      ];
    }

    for (const source of sources) {
      await prisma.jobSource.upsert({
        where: { url: source.url },
        update: {},
        create: {
          ...source,
          isActive: false, // Wait for user approval
          isAiFound: true,
        }
      });
    }

    console.log(`AI discovered ${sources.length} potential new sources.`);
    return sources;
  } catch (error) {
    console.error('Error in AI source discovery:', error);
    return [];
  }
}
