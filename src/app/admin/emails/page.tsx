'use client';

import React from 'react';
import { EmailDashboard } from '@/components/admin/EmailDashboard';

export default function EmailsPage() {
  return (
    <div className="p-6">
      {/* Email Dashboard - has its own header */}
      <EmailDashboard
        autoRefresh={true}
        refreshInterval={30000}
        locale="en"
      />
    </div>
  );
}
