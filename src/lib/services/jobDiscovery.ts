import axios from 'axios';
import Parser from 'rss-parser';
import prisma from '../prisma';
import { scoreJob } from './aiService';

const parser = new Parser();

export interface JobData {
  externalId: string;
  source: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  salary?: string;
  tags?: string;
  applyUrl: string;
}

export async function fetchRemoteOKJobs(): Promise<JobData[]> {
  try {
    const response = await axios.get('https://remoteok.com/api');
    const jobs = response.data.slice(1);
    return jobs.map((job: any) => ({
      externalId: `remoteok-${job.id}`,
      source: 'RemoteOK',
      title: job.position,
      company: job.company,
      description: job.description,
      location: job.location,
      salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : undefined,
      tags: job.tags?.join(','),
      applyUrl: job.apply_url || job.url,
    }));
  } catch (error) {
    console.error('Error fetching jobs from RemoteOK:', error);
    return [];
  }
}

export async function fetchWWRJobs(): Promise<JobData[]> {
  try {
    const feed = await parser.parseURL('https://weworkremotely.com/remote-jobs.rss');
    return feed.items.map((item: any) => ({
      externalId: `wwr-${item.guid || item.link}`,
      source: 'WWR',
      title: item.title || 'Unknown Title',
      company: item.creator || 'Unknown',
      description: item.content || item.contentSnippet || '',
      location: 'Remote',
      applyUrl: item.link || '',
    }));
  } catch (error) {
    console.error('Error fetching jobs from WWR:', error);
    return [];
  }
}

export async function fetchRemotiveJobs(): Promise<JobData[]> {
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs');
    const jobs = response.data.jobs;
    return jobs.map((job: any) => ({
      externalId: `remotive-${job.id}`,
      source: 'Remotive',
      title: job.title,
      company: job.company_name,
      description: job.description,
      location: job.candidate_required_location,
      salary: job.salary,
      tags: job.tags?.join(','),
      applyUrl: job.url,
    }));
  } catch (error) {
    console.error('Error fetching jobs from Remotive:', error);
    return [];
  }
}

export async function fetchJobspressoJobs(): Promise<JobData[]> {
  try {
    const feed = await parser.parseURL('https://jobspresso.co/feed/');
    return feed.items.map((item: any) => ({
      externalId: `jobspresso-${item.guid || item.link}`,
      source: 'Jobspresso',
      title: item.title || 'Unknown Title',
      company: 'Unknown',
      description: item.content || item.contentSnippet || '',
      location: 'Remote',
      applyUrl: item.link || '',
    }));
  } catch (error) {
    console.error('Error fetching jobs from Jobspresso:', error);
    return [];
  }
}

export async function discoverAndSaveJobs() {
  console.log('Discovering and scoring jobs...');

  // Get candidate profile for scoring
  const profile = await prisma.candidateProfile.findFirst();
  const parsedResume = profile?.parsedResume ? JSON.parse(profile.parsedResume) : null;

  const sources = [
    fetchRemoteOKJobs(),
    fetchWWRJobs(),
    fetchRemotiveJobs(),
    fetchJobspressoJobs(),
  ];

  const results = await Promise.all(sources);
  const allJobs = results.flat();
  console.log(`Found ${allJobs.length} jobs in total.`);

  let savedCount = 0;
  // Limit scoring for MVP to avoid API overhead
  const jobsToProcess = allJobs.slice(0, 50);

  for (const jobData of jobsToProcess) {
    try {
      let score = null;
      let category = null;
      let suitability = null;

      if (parsedResume) {
        const match = await scoreJob(parsedResume, jobData.description);
        score = match.score;
        category = match.category;
        suitability = match.reasoning;
      }

      await prisma.job.upsert({
        where: { externalId: jobData.externalId },
        update: { ...jobData, score, category, suitability },
        create: { ...jobData, score, category, suitability },
      });
      savedCount++;
    } catch (error) {
      console.error('Error upserting job:', error);
    }
  }

  console.log(`Saved/Updated and Scored ${savedCount} jobs.`);
  return allJobs;
}
