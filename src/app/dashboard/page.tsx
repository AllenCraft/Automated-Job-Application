'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, RefreshCw, Star, Award, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/jobs', { method: 'POST' });
      await fetchJobs();
    } catch (error) {
      alert('Error refreshing jobs');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const result = await res.json();
      if (result.success) {
        alert('Application simulation successful (Dry Run)!');
        fetchJobs();
      } else {
        alert('Application failed: ' + result.message);
      }
    } catch (error) {
      alert('Error during application');
    }
  };

  const groupedJobs = {
    'Class A': jobs.filter(j => j.category === 'Class A'),
    'Class B': jobs.filter(j => j.category === 'Class B'),
    'Class C': jobs.filter(j => j.category === 'Class C'),
    'Uncategorized': jobs.filter(j => !j.category)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Job Matcher</h1>
          <div className="flex space-x-4">
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center shadow-sm"
            >
              {isRefreshing ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : null}
              {isRefreshing ? 'Analyzing...' : 'Discover & Categorize'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white p-5 shadow rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-2" />
              <dt className="text-sm font-medium text-gray-500 truncate">Class A (Top Matches)</dt>
            </div>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{groupedJobs['Class A'].length}</dd>
          </div>
          <div className="bg-white p-5 shadow rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center">
              <Award className="text-blue-400 mr-2" />
              <dt className="text-sm font-medium text-gray-500 truncate">Class B (Highly Qualified)</dt>
            </div>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{groupedJobs['Class B'].length}</dd>
          </div>
          <div className="bg-white p-5 shadow rounded-lg border-l-4 border-gray-400">
            <div className="flex items-center">
              <CheckCircle className="text-gray-400 mr-2" />
              <dt className="text-sm font-medium text-gray-500 truncate">Class C (Other Matches)</dt>
            </div>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{groupedJobs['Class C'].length}</dd>
          </div>
        </div>

        {Object.entries(groupedJobs).map(([category, categoryJobs]) => (
          categoryJobs.length > 0 && (
            <div key={category} className="mb-10">
              <h2 className={`text-xl font-bold mb-4 ${
                category === 'Class A' ? 'text-yellow-700' :
                category === 'Class B' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {category} Opportunities
              </h2>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {categoryJobs.map((job) => (
                    <li key={job.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="text-lg font-bold text-blue-600 truncate">{job.title}</h4>
                            {job.score && (
                              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {job.score}% Match
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{job.company}</span>
                            <span className="mx-2">•</span>
                            <span>{job.source}</span>
                            {job.salary && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-green-600 font-medium">{job.salary}</span>
                              </>
                            )}
                          </div>
                          {job.suitability && (
                            <p className="mt-2 text-xs text-gray-500 italic">"{job.suitability}"</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                          <button
                              onClick={() => handleApply(job.id)}
                              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                                category === 'Class A' ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                                category === 'Class B' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                                'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                          >
                              Apply (Dry Run)
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        ))}

        {isLoading && <div className="text-center p-10 text-gray-500">Loading jobs...</div>}
        {!isLoading && jobs.length === 0 && <div className="text-center p-10 text-gray-500">No jobs found.</div>}
      </div>
    </div>
  );
}
