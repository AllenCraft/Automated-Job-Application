'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Plus, ToggleLeft, ToggleRight, Sparkles, RefreshCw } from 'lucide-react';

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', name: newName, url: newUrl, type: 'RSS' }),
      });
      if (res.ok) {
        setNewName('');
        setNewUrl('');
        fetchSources();
      }
    } catch (error) {
      alert('Error adding source');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id }),
      });
      fetchSources();
    } catch (error) {
      alert('Error toggling source');
    }
  };

  const handleAiDiscover = async () => {
    setIsDiscovering(true);
    try {
      await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' }),
      });
      fetchSources();
    } catch (error) {
      alert('Error discovering sources');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="mr-3 text-blue-600" /> Job Sources
          </h1>
          <button
            onClick={handleAiDiscover}
            disabled={isDiscovering}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition flex items-center shadow-sm"
          >
            {isDiscovering ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isDiscovering ? 'Searching...' : 'AI Source Discovery'}
          </button>
        </div>

        <div className="bg-white p-6 shadow rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4">Add New RSS Source</h2>
          <form onSubmit={handleAddSource} className="flex gap-4">
            <input
              type="text"
              placeholder="Source Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              required
            />
            <input
              type="url"
              placeholder="Feed URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Add
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sources.map((source) => (
                <tr key={source.id} className={source.isAiFound && !source.isActive ? 'bg-purple-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{source.name}</span>
                      {source.isAiFound && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          AI Discovered
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{source.url}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {source.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggle(source.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {source.isActive ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                    </button>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">No sources configured.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
