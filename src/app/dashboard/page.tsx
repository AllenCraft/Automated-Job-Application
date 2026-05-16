'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, RefreshCw, Star, Award, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/apply');
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

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
    fetchApplications();
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

  const handlePrepareReview = async (jobId: string) => {
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const result = await res.json();
      if (result.success) {
        alert('Application prepared for review!');
        fetchApplications();
      } else {
        alert('Failed: ' + result.message);
      }
    } catch (error) {
      alert('Error');
    }
  };

  const handleReviewAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action }),
      });
      const result = await res.json();
      if (result.success) {
        alert(action === 'approve' ? 'Application submitted!' : 'Application rejected.');
        fetchApplications();
      } else {
        alert('Action failed: ' + result.message);
      }
    } catch (error) {
      alert('Error');
    }
  };

  const groupedJobs = {
    'Class A': jobs.filter(j => j.category === 'Class A'),
    'Class B': jobs.filter(j => j.category === 'Class B'),
    'Class C': jobs.filter(j => j.category === 'Class C'),
    'Uncategorized': jobs.filter(j => !j.category)
  };

  const pendingReviews = applications.filter(a => a.status === 'pending_review');

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

        {pendingReviews.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
              <RefreshCw className="mr-2 h-5 w-5" /> Pending Approval ({pendingReviews.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {pendingReviews.map((app) => (
                <div key={app.id} className="bg-white shadow rounded-lg p-6 border-l-4 border-purple-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{app.job.title}</h3>
                      <p className="text-sm text-gray-500">{app.job.company} • Match Score: <span className="font-bold text-green-600">{app.job.score}%</span></p>

                      <div className="mt-4">
                        <h4 className="text-xs font-semibold uppercase text-gray-400">Generated Cover Letter</h4>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-600 italic whitespace-pre-wrap">
                          {app.coverLetter}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleReviewAction(app.id, 'approve')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Approve & Submit
                      </button>
                      <button
                        onClick={() => handleReviewAction(app.id, 'reject')}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                              onClick={() => handlePrepareReview(job.id)}
                              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                                category === 'Class A' ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                                category === 'Class B' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                                'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                          >
                              Prepare Application
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
