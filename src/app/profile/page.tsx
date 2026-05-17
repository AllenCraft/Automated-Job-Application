'use client';

import React, { useState } from 'react';
import { Upload, User, Briefcase, DollarSign, Clock, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const [resume, setResume] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [exp, setExp] = useState('Senior');
  const [salary, setSalary] = useState('');
  const [timezone, setTimezone] = useState('');
  const [industries, setIndustries] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resume,
          experienceLevel: exp,
          salaryPreference: salary,
          timezone: timezone,
          preferredIndustries: industries,
        }),
      });
      if (res.ok) alert('Profile saved and analyzed!');
    } catch (error) {
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Candidate Profile</h1>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Resume/CV Text
              </label>
              <textarea
                rows={10}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste your resume here for AI analysis..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                >
                  <option>Junior</option>
                  <option>Mid-Level</option>
                  <option>Senior</option>
                  <option>Lead/Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Salary Preference (Annual USD)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 border border-gray-300 rounded-md p-2"
                    placeholder="e.g. 120,000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 text-right">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
