'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Mail,
  Phone,
  Key
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UsersPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Sample data (will connect to Supabase RPC / table)
  const mockUsers = [
    {
      id: '1',
      full_name: 'أحمد محمود العبد',
      email: 'ahmed.mahmoud@cartonerp.com',
      phone: '+20 100 123 4567',
      role: 'Super Admin',
      department: 'IT & Management',
      is_active: true,
      last_login: '2026-08-31 18:40',
    },
    {
      title: 'Sales Specialist',
      full_name: 'سارة حسن علي',
      email: 'sara.hassan@cartonerp.com',
      phone: '+20 111 987 6543',
      role: 'Sales',
      department: 'Sales & Marketing',
      is_active: true,
      last_login: '2026-08-31 15:20',
    },
    {
      full_name: 'محمود القاضي',
      email: 'mahmoud.kadi@cartonerp.com',
      phone: '+20 122 345 6789',
      role: 'Production Manager',
      department: 'Manufacturing',
      is_active: true,
      last_login: '2026-08-30 09:15',
    },
    {
      full_name: 'إبراهيم السيد',
      email: 'ibrahim.sayed@cartonerp.com',
      phone: '+20 106 555 4321',
      role: 'Accountant',
      department: 'Finance',
      is_active: false,
      last_login: '2026-08-15 11:00',
    },
  ];

  const [users, setUsers] = useState(mockUsers);

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from('users').delete().eq('id', id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      setUsers(users.filter(u => u.id !== id));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate module="users" action="view" fallback={
      <AppShell>
        <div className="p-8 text-center text-red-500 font-bold">
          {locale === 'ar' ? 'غير مصرح لك بعرض هذه الصفحة' : 'Access Denied: You do not have permission to view Users'}
        </div>
      </AppShell>
    }>
      <AppShell>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.users')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة حسابات المستخدمين، تفعيل الحسابات، وتعيين الأدوار والصلاحيات'
                  : 'Manage user accounts, activation, and role assignments'}
              </p>
            </div>

            <PermissionGate module="users" action="create">
              <button onClick={() => router.push('/admin/users/new')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <UserPlus className="w-4 h-4" />
                <span>{t('actions.create')}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Filters & Actions Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('actions.search')}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Users Data Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.name')}</th>
                    <th className="p-3.5 text-start">{t('nav.roles')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'القسم' : 'Department'}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'آخر دخول' : 'Last Login'}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {users.map((u, i) => (
                    <tr key={u.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-semibold text-[11px]">
                          <Shield className="w-3 h-3" /> {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{u.department}</td>
                      <td className="p-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {t('status.active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> {t('status.inactive')}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400">{u.last_login}</td>
                      <td className="p-3.5 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGate module="users" action="edit">
                            <button onClick={() => router.push('/admin/users/' + u.id)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                          <PermissionGate module="users" action="delete">
                            <button onClick={() => handleDelete(u.id)} disabled={saving} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
