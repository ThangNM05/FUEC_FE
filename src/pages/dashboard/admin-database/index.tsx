import { Database, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';

interface Backup {
  id: number;
  name: string;
  date: string;
  size: string;
  type: string;
  status: string;
}

function AdminDatabase() {
  const backups: Backup[] = [
    {
      id: 1,
      name: 'Full Backup_20231001',
      date: '2023-10-01 02:00 AM',
      size: '4.2 GB',
      type: 'Full',
      status: 'Success'
    },
    {
      id: 2,
      name: 'Inc Backup_20231002',
      date: '2023-10-02 02:00 AM',
      size: '150 MB',
      type: 'Incremental',
      status: 'Success'
    },
    {
      id: 3,
      name: 'Inc Backup_20231003',
      date: '2023-10-03 02:00 AM',
      size: '155 MB',
      type: 'Incremental',
      status: 'Failed'
    }
  ];

  const columns = [
    {
      header: 'Backup Name',
      accessor: 'name' as keyof Backup,
      sortable: true,
      render: (item: Backup) => (
        <div className="flex items-center gap-2 font-medium">
          <Database className="w-4 h-4 text-orange-500" />
          {item.name}
        </div>
      )
    },
    { header: 'Date Created', accessor: 'date' as keyof Backup, sortable: true },
    { header: 'Size', accessor: 'size' as keyof Backup, align: 'center' as const },
    { header: 'Type', accessor: 'type' as keyof Backup, align: 'center' as const },
    {
      header: 'Status',
      accessor: 'status' as keyof Backup,
      sortable: true,
      align: 'center' as const,
      render: (item: Backup) => (
        <div className={`flex items-center justify-center gap-1.5 ${item.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
          {item.status === 'Success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {item.status}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Backup,
      align: 'center' as const,
      render: () => (
        <div className="flex gap-2 justify-center">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Restore">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Database Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">System backups and data integrity.</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
            <span className="hidden sm:inline">Configuration</span>
            <span className="sm:hidden">Config</span>
          </button>
          <button className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
            <span className="hidden sm:inline">Create Backup</span>
            <span className="sm:hidden">Backup</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">4.5 GB</div>
              <div className="text-sm text-gray-600">Total Storage Used</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">Daily</div>
              <div className="text-sm text-gray-600">Backup Schedule</div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">Healthy</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Backup History Table */}
      <DataTable
        title="Backup History"
        data={backups}
        columns={columns}
        selectable={false}
      />
    </div>
  );
}

export default AdminDatabase;
