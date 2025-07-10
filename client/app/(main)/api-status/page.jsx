'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Globe,
  Activity
} from 'lucide-react';
import { appConfig, getTotalEndpoints, buildApiUrl } from '@/lib/config';
import { SpykeLogo } from '@/components/Logo';

export default function APIPage() {
  const [serviceStatus, setServiceStatus] = useState({});
  const [loading, setLoading] = useState(true);

  const safeAppConfig = appConfig || { services: [], company: {}, monitoring: {}, statusMessages: {}, healthDisplay: { metricsToShow: {} } };

  useEffect(() => {
    const checkAllServices = async () => {
      const statuses = {};

      for (const service of safeAppConfig.services) {
        try {
          const start = Date.now();
          const response = await fetch(buildApiUrl(service.healthEndpoint), { method: 'GET' });
          const responseTime = Date.now() - start;

          const data = await response.json();
          statuses[service.id] = {
            status: response.ok ? 'online' : 'offline',
            responseTime,
            data,
            lastChecked: new Date().toISOString()
          };
        } catch (err) {
          statuses[service.id] = {
            status: 'offline',
            error: err.message,
            responseTime: 0,
            lastChecked: new Date().toISOString()
          };
        }
      }

      setServiceStatus(statuses);
      setLoading(false);
    };

    checkAllServices();
    const interval = setInterval(checkAllServices, safeAppConfig.api?.healthCheckInterval || 60000);
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = () => {
    if (loading) return 'checking';
    const statuses = Object.values(serviceStatus);
    const onlineCount = statuses.filter((s) => s.status === 'online').length;
    if (onlineCount === statuses.length) return 'all-operational';
    if (onlineCount > statuses.length / 2) return 'partial-outage';
    return 'major-outage';
  };

  const statusColors = {
    checking: 'text-[#FFC050] bg-[#FFC050]/10 border-[#FFC050]/30',
    'all-operational': 'text-[#00FF89] bg-[#00FF89]/10 border-[#00FF89]/30',
    'partial-outage': 'text-[#FFC050] bg-[#FFC050]/10 border-[#FFC050]/30',
    'major-outage': 'text-red-500 bg-red-500/10 border-red-500/30'
  };

  const StatusIndicator = ({ status }) => {
    const circleColor = status === 'online' ? '#00FF89' : status === 'offline' ? 'red' : '#FFC050';
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: circleColor }} />
        <span className="text-sm font-medium text-gray-700">{status === 'online' ? 'Operational' : 'Offline'}</span>
      </div>
    );
  };

  const format = {
    memory: (bytes) => (bytes ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : 'N/A'),
    cpu: (arr) => (Array.isArray(arr) ? `${(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)}%` : 'N/A'),
    uptime: (ms) => {
      const s = Math.floor((ms || 0) / 1000);
      const m = Math.floor(s / 60), h = Math.floor(m / 60);
      return h ? `${h}h ${m % 60}m` : m ? `${m}m ${s % 60}s` : `${s}s`;
    }
  };

  return (
    <div className="min-h-screen px-6 pb-16 text-[#121212] bg-white">
      <div className="py-16 text-center">
        <SpykeLogo size={64} showText={false} />
        <h1 className="text-5xl font-bold my-2">{safeAppConfig.company.fullName || 'Spyke AI'}</h1>
        <p className="text-[#00FF89]">{safeAppConfig.company.tagline || 'Fast. Reliable. Secure.'}</p>
        <p className="mt-4 text-gray-600">{safeAppConfig.company.description || 'API Monitoring Dashboard'}</p>
      </div>

      <div className={`mx-auto max-w-lg px-4 py-3 rounded-xl border-2 text-center font-semibold text-xl ${statusColors[getOverallStatus()]}`}>
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Clock className="animate-spin" />
            Checking services...
          </div>
        ) : (
          <>
            {getOverallStatus() === 'all-operational' && <CheckCircle className="inline mr-2" />}
            {getOverallStatus() === 'partial-outage' && <Clock className="inline mr-2" />}
            {getOverallStatus() === 'major-outage' && <XCircle className="inline mr-2" />}
            {safeAppConfig.statusMessages?.[getOverallStatus()] || 'All systems go.'}
          </>
        )}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {safeAppConfig.services.map((service) => {
          const status = serviceStatus[service.id];
          const Icon = service.icon || Activity;
          return (
            <div key={service.id} className="rounded-xl border p-6 bg-white shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl text-white ${service.color || 'bg-[#00FF89]'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
                <StatusIndicator status={status?.status} />
              </div>
              <ul className="mt-4 text-sm text-gray-700">
                {service.endpoints.map((ep, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00FF89]" />
                    {ep}
                  </li>
                ))}
              </ul>
              {status?.responseTime && (
                <div className="mt-2 text-xs text-gray-400">Response time: {status.responseTime} ms</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 max-w-3xl mx-auto bg-white/60 p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold text-center mb-4">System Health Metrics</h2>
        {(() => {
          const health =
            serviceStatus['health'] || Object.values(serviceStatus).find((s) => s?.status === 'online' && s?.data?.data);
          const { application = {}, system = {} } = health?.data?.data || {};

          if (!application && !system) {
            return <p className="text-center text-gray-400">No data available</p>;
          }

          return (
            <div className="grid gap-2 text-sm text-gray-700">
              {application.environment && (
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span>{application.environment}</span>
                </div>
              )}
              {application.uptime && (
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{format.uptime(application.uptime)}</span>
                </div>
              )}
              {application.memoryUsage?.heapUsed && (
                <div className="flex justify-between">
                  <span>Heap Used:</span>
                  <span>{format.memory(application.memoryUsage.heapUsed)}</span>
                </div>
              )}
              {system.cpuUsage && (
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span>{format.cpu(system.cpuUsage)}</span>
                </div>
              )}
              {system.freeMemory && (
                <div className="flex justify-between">
                  <span>Free Memory:</span>
                  <span>{format.memory(system.freeMemory)}</span>
                </div>
              )}
              {system.totalMemory && (
                <div className="flex justify-between">
                  <span>Total Memory:</span>
                  <span>{format.memory(system.totalMemory)}</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
