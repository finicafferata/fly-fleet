'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface EmailStats {
  totalSent: number;
  delivered: number;
  bounced: number;
  failed: number;
  deliveryRate: number;
  bounceRate: number;
}

interface EmailActivity {
  id: string;
  recipientEmail: string;
  subject: string;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed';
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  bouncedAt?: string;
  failedAt?: string;
  errorMessage?: string;
}

interface EmailDashboardProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function EmailDashboard({
  locale = 'en',
  className,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: EmailDashboardProps) {
  const [stats, setStats] = useState<EmailStats>({
    totalSent: 0,
    delivered: 0,
    bounced: 0,
    failed: 0,
    deliveryRate: 0,
    bounceRate: 0,
  });
  const [activities, setActivities] = useState<EmailActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [alerts, setAlerts] = useState<string[]>([]);

  const getContent = (locale: string) => {
    const content = {
      en: {
        title: 'Email Delivery Dashboard',
        summaryHeading: 'Delivery Summary',
        activityHeading: 'Recent Email Activity',
        totalSent: 'Total Sent',
        delivered: 'Delivered',
        bounced: 'Bounced',
        failed: 'Failed',
        deliveryRate: 'Delivery Rate',
        bounceRate: 'Bounce Rate',
        recipient: 'Recipient',
        subject: 'Subject',
        status: 'Status',
        timestamp: 'Timestamp',
        lastUpdated: 'Last updated',
        refreshData: 'Refresh data',
        exportData: 'Export data',
        noData: 'No email activity found',
        errorLoading: 'Error loading email data',
        statusLabels: {
          pending: 'Pending',
          sent: 'Sent',
          delivered: 'Delivered',
          bounced: 'Bounced',
          failed: 'Failed',
        },
        alerts: {
          highBounceRate: 'Warning: Bounce rate is above 10%',
          lowDeliveryRate: 'Alert: Delivery rate is below 90%',
        },
      },
      es: {
        title: 'Panel de Entrega de Correos',
        summaryHeading: 'Resumen de Entregas',
        activityHeading: 'Actividad Reciente de Correos',
        totalSent: 'Total Enviados',
        delivered: 'Entregados',
        bounced: 'Rebotados',
        failed: 'Fallidos',
        deliveryRate: 'Tasa de Entrega',
        bounceRate: 'Tasa de Rebote',
        recipient: 'Destinatario',
        subject: 'Asunto',
        status: 'Estado',
        timestamp: 'Marca de Tiempo',
        lastUpdated: 'Última actualización',
        refreshData: 'Actualizar datos',
        exportData: 'Exportar datos',
        noData: 'No se encontró actividad de correo',
        errorLoading: 'Error al cargar datos de correo',
        statusLabels: {
          pending: 'Pendiente',
          sent: 'Enviado',
          delivered: 'Entregado',
          bounced: 'Rebotado',
          failed: 'Fallido',
        },
        alerts: {
          highBounceRate: 'Advertencia: La tasa de rebote está por encima del 10%',
          lowDeliveryRate: 'Alerta: La tasa de entrega está por debajo del 90%',
        },
      },
      pt: {
        title: 'Painel de Entrega de E-mails',
        summaryHeading: 'Resumo de Entregas',
        activityHeading: 'Atividade Recente de E-mails',
        totalSent: 'Total Enviados',
        delivered: 'Entregues',
        bounced: 'Rejeitados',
        failed: 'Falharam',
        deliveryRate: 'Taxa de Entrega',
        bounceRate: 'Taxa de Rejeição',
        recipient: 'Destinatário',
        subject: 'Assunto',
        status: 'Status',
        timestamp: 'Timestamp',
        lastUpdated: 'Última atualização',
        refreshData: 'Atualizar dados',
        exportData: 'Exportar dados',
        noData: 'Nenhuma atividade de e-mail encontrada',
        errorLoading: 'Erro ao carregar dados de e-mail',
        statusLabels: {
          pending: 'Pendente',
          sent: 'Enviado',
          delivered: 'Entregue',
          bounced: 'Rejeitado',
          failed: 'Falhou',
        },
        alerts: {
          highBounceRate: 'Aviso: Taxa de rejeição está acima de 10%',
          lowDeliveryRate: 'Alerta: Taxa de entrega está abaixo de 90%',
        },
      },
    };
    return content[locale as keyof typeof content] || content.en;
  };

  const content = getContent(locale);

  // Fetch email statistics and activities
  const fetchEmailData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch stats
      const statsResponse = await fetch('/api/admin/email-stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch email statistics');
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent activities
      const activitiesResponse = await fetch('/api/admin/email-activities?limit=50');
      if (!activitiesResponse.ok) {
        throw new Error('Failed to fetch email activities');
      }
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData);

      // Check for alerts
      const newAlerts: string[] = [];
      if (statsData.bounceRate > 10) {
        newAlerts.push(content.alerts.highBounceRate);
      }
      if (statsData.deliveryRate < 90) {
        newAlerts.push(content.alerts.lowDeliveryRate);
      }
      setAlerts(newAlerts);

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : content.errorLoading);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchEmailData();

    if (autoRefresh) {
      const interval = setInterval(fetchEmailData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Export functionality
  const handleExport = () => {
    const csvData = activities.map(activity => ({
      recipient: activity.recipientEmail,
      subject: activity.subject,
      status: activity.status,
      created: activity.createdAt,
      sent: activity.sentAt || '',
      delivered: activity.deliveredAt || '',
      bounced: activity.bouncedAt || '',
      failed: activity.failedAt || '',
      error: activity.errorMessage || '',
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-delivery-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'bounced':
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'sent':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(locale);
  };

  return (
    <div className={clsx('email-dashboard', className)} role="main" aria-labelledby="dashboard-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 id="dashboard-title" className="text-3xl font-bold text-navy-primary mb-2">
            {content.title}
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-neutral-medium">
              {content.lastUpdated}: {formatTimestamp(lastUpdated.toISOString())}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={fetchEmailData}
                disabled={isLoading}
                className={clsx(
                  'px-4 py-2 bg-accent-blue text-white rounded-lg',
                  'hover:bg-accent-blue/90 transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-describedby="refresh-description"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </span>
                ) : (
                  content.refreshData
                )}
              </button>
              <button
                onClick={handleExport}
                disabled={activities.length === 0}
                className={clsx(
                  'px-4 py-2 border border-neutral-medium text-navy-primary rounded-lg',
                  'hover:bg-neutral-light transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {content.exportData}
              </button>
            </div>
          </div>
          <div id="refresh-description" className="sr-only">
            Refresh email delivery data and statistics
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6" role="alert" aria-live="polite">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{alert}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <div className="flex items-center space-x-2 text-red-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Summary Section */}
        <section aria-labelledby="summary-heading" className="mb-8">
          <h2 id="summary-heading" className="text-xl font-semibold text-navy-primary mb-4">
            {content.summaryHeading}
          </h2>
          <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            <div className="stat-card bg-white p-6 rounded-lg shadow-medium border border-neutral-light" role="listitem">
              <h3 className="text-sm font-medium text-neutral-medium mb-2">
                {content.totalSent}
              </h3>
              <span className="stat-number text-2xl font-bold text-navy-primary" aria-label={`${stats.totalSent} emails sent`}>
                {stats.totalSent.toLocaleString()}
              </span>
            </div>

            <div className="stat-card bg-white p-6 rounded-lg shadow-medium border border-neutral-light" role="listitem">
              <h3 className="text-sm font-medium text-neutral-medium mb-2">
                {content.delivered}
              </h3>
              <span className="stat-number text-2xl font-bold text-green-600" aria-label={`${stats.delivered} emails delivered, ${stats.deliveryRate}% success rate`}>
                {stats.delivered.toLocaleString()}{' '}
                <small className="text-sm text-neutral-medium">
                  ({stats.deliveryRate.toFixed(1)}%)
                </small>
              </span>
            </div>

            <div className="stat-card bg-white p-6 rounded-lg shadow-medium border border-neutral-light" role="listitem">
              <h3 className="text-sm font-medium text-neutral-medium mb-2">
                {content.bounced}
              </h3>
              <span className="stat-number text-2xl font-bold text-red-600" aria-label={`${stats.bounced} emails bounced, ${stats.bounceRate}% bounce rate`}>
                {stats.bounced.toLocaleString()}{' '}
                <small className="text-sm text-neutral-medium">
                  ({stats.bounceRate.toFixed(1)}%)
                </small>
              </span>
            </div>

            <div className="stat-card bg-white p-6 rounded-lg shadow-medium border border-neutral-light" role="listitem">
              <h3 className="text-sm font-medium text-neutral-medium mb-2">
                {content.failed}
              </h3>
              <span className="stat-number text-2xl font-bold text-red-600" aria-label={`${stats.failed} emails failed`}>
                {stats.failed.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Activity Section */}
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-xl font-semibold text-navy-primary mb-4">
            {content.activityHeading}
          </h2>

          {activities.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-medium border border-neutral-light text-center">
              <p className="text-neutral-medium">{content.noData}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-medium border border-neutral-light overflow-hidden">
              <table className="email-table w-full" role="table" aria-describedby="table-desc">
                <caption id="table-desc" className="sr-only">
                  Recent email delivery status with timestamps and recipient information
                </caption>
                <thead className="bg-neutral-light">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      {content.recipient}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      {content.subject}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      {content.status}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      {content.timestamp}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-neutral-light/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-primary">
                        {activity.recipientEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-dark max-w-xs truncate">
                        {activity.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={clsx(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            getStatusColor(activity.status)
                          )}
                        >
                          {content.statusLabels[activity.status as keyof typeof content.statusLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-medium">
                        {formatTimestamp(activity.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}