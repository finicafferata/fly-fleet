'use client';

import React from 'react';
import { EmailDashboard } from '@/components/admin/EmailDashboard';

export default function EmailsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Email Monitoring</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor email delivery status and performance metrics
        </p>
      </div>

      {/* Email Dashboard */}
      <EmailDashboard
        autoRefresh={true}
        refreshInterval={30000}
        locale="en"
      />
    </div>
  );
}
