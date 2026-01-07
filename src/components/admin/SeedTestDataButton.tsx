'use client';

import { useState } from 'react';

export function SeedTestDataButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeedData = async () => {
    if (!confirm('This will create 11 test quotes and 5 test contacts. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: `✓ Created ${data.data.quotesCreated} quotes and ${data.data.contactsCreated} contacts` });
        // Reload the page after 2 seconds to show new data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult({ success: false, message: `Error: ${data.details || data.error}` });
      }
    } catch (error) {
      setResult({ success: false, message: `Failed to seed data: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Test Data</h3>
          <p className="text-xs text-blue-700 mt-1">
            Generate sample quotes and contacts to test the platform
          </p>
        </div>
        <button
          onClick={handleSeedData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Seed Test Data'}
        </button>
      </div>
      {result && (
        <div className={`mt-3 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
}
