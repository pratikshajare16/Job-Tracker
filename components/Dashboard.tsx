'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

const STATUSES = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'] as const;
type Status = (typeof STATUSES)[number];
type Filter = Status | 'ALL';

type App = {
  id: string;
  company: string;
  role: string;
  status: Status;
  followUpAt: string | null;
};

const STATUS_STYLES: Record<Status, string> = {
  APPLIED: 'border-[#dce7df] bg-[#f2f6f1] text-[#45644e]',
  INTERVIEW: 'border-[#f0dfc6] bg-[#fbf4e9] text-[#94632c]',
  OFFER: 'border-[#cfe6d1] bg-[#edf7ed] text-[#397047]',
  REJECTED: 'border-[#ecd7d2] bg-[#fbf1ef] text-[#a2594c]',
};

const FILTERS: Filter[] = ['ALL', ...STATUSES];

function formatStatus(status: Filter) {
  return status === 'ALL'
    ? 'All applications'
    : status.charAt(0) + status.slice(1).toLowerCase();
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === 'string' ? body.error : 'Request failed');
  }
  return res.json();
}

export default function Dashboard({ email }: { email: string }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api<App[]>('/api/applications'),
  });

  const add = useMutation({
    mutationFn: (body: { company: string; role: string; status: Status }) =>
      api('/api/applications', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      setCompany('');
      setRole('');
    },
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      api(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['applications'] });
      const previous = qc.getQueryData<App[]>(['applications']);
      qc.setQueryData<App[]>(['applications'], (old = []) =>
        old.map((application) =>
          application.id === id ? { ...application, status } : application,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) =>
      qc.setQueryData(['applications'], context?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/applications/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  const visible = data.filter(
    (application) =>
      (filter === 'ALL' || application.status === filter) &&
      `${application.company} ${application.role}`.toLowerCase().includes(search.toLowerCase()),
  );
  const counts = {
    total: data.length,
    applied: data.filter((application) => application.status === 'APPLIED').length,
    interviews: data.filter((application) => application.status === 'INTERVIEW').length,
    offers: data.filter((application) => application.status === 'OFFER').length,
  };

  return (
    <main className='min-h-screen bg-[#f7f8f5] text-[#172a25]'>
      <header className='border-b border-[#e7ebe6] bg-white/90'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8'>
          <a href='/dashboard' className='inline-flex items-center gap-3' aria-label='Stepwise dashboard'>
            <span className='flex size-10 items-center justify-center rounded-xl bg-[#173c32] text-[#c4f0c5]'>
              <svg viewBox='0 0 24 24' fill='none' className='size-6' aria-hidden='true'>
                <path d='M4 17.5 9.2 12l3.5 3.2L20 7' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M15.5 7H20v4.5' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </span>
            <span className='text-lg font-semibold tracking-tight'>Stepwise</span>
          </a>

          <div className='flex min-w-0 items-center gap-3'>
            <span className='hidden max-w-56 truncate text-sm text-[#687771] sm:block'>{email}</span>
            <button
              type='button'
              onClick={() => signOut({ callbackUrl: '/login' })}
              className='rounded-xl border border-[#dce4df] px-3.5 py-2 text-sm font-medium text-[#42584d] transition hover:border-[#b8c9bc] hover:bg-[#f5f8f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#47765b]'
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12'>
        <section className='mb-8 flex flex-col justify-between gap-5 sm:mb-9 sm:flex-row sm:items-end'>
          <div>
            <p className='text-sm font-medium text-[#47765b]'>YOUR CAREER, IN MOTION</p>
            <h1 className='mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl'>
              Your job search, at a glance.
            </h1>
            <p className='mt-2 text-sm leading-6 text-[#687771]'>
              Every opportunity has a next step. Keep yours moving.
            </p>
          </div>
          <a
            href='#add-application'
            className='inline-flex h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-[#173c32] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#225344] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#47765b]'
          >
            <svg viewBox='0 0 20 20' fill='none' className='size-4' aria-hidden='true'>
              <path d='M10 4v12m6-6H4' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
            </svg>
            Add an application
          </a>
        </section>

        <section aria-label='Application summary' className='mb-8 grid grid-cols-2 gap-3 sm:mb-9 sm:grid-cols-4 sm:gap-4'>
          {[
            { label: 'Total tracked', value: counts.total, note: 'all applications' },
            { label: 'Applied', value: counts.applied, note: 'waiting to hear' },
            { label: 'Interviews', value: counts.interviews, note: 'conversations ahead' },
            { label: 'Offers', value: counts.offers, note: 'great progress' },
          ].map((stat, index) => (
            <article key={stat.label} className='rounded-2xl border border-[#e5eae4] bg-white p-4 shadow-[0_2px_12px_rgba(27,52,40,0.03)] sm:p-5'>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-xs font-medium text-[#687771] sm:text-sm'>{stat.label}</p>
                <span className={`size-2 rounded-full ${index === 0 ? 'bg-[#47765b]' : index === 1 ? 'bg-[#a9c5ac]' : index === 2 ? 'bg-[#d6aa70]' : 'bg-[#76a87b]'}`} />
              </div>
              <p className='mt-3 text-3xl font-semibold tracking-tight text-[#172a25] sm:mt-4 sm:text-4xl'>{stat.value}</p>
              <p className='mt-1 text-[11px] text-[#8a9791] sm:text-xs'>{stat.note}</p>
            </article>
          ))}
        </section>

        <section
          id='add-application'
          className='mb-8 scroll-mt-6 rounded-2xl border border-[#dce7df] bg-[#eef4ed] p-4 sm:mb-9 sm:p-6'
        >
          <div className='mb-4'>
            <h2 className='text-base font-semibold text-[#223b2e]'>A new opportunity?</h2>
            <p className='mt-1 text-sm text-[#687771]'>Add it here and keep your next step close.</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              add.mutate({ company, role, status: 'APPLIED' });
            }}
            className='grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end'
          >
            <div>
              <label htmlFor='company' className='mb-1.5 block text-xs font-medium text-[#42584d]'>Company</label>
              <input
                id='company'
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                required
                placeholder='e.g. Northstar Labs'
                className='h-11 w-full rounded-xl border border-[#dce4df] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#9aa7a0] focus:border-[#47765b] focus:ring-4 focus:ring-[#47765b]/10'
              />
            </div>
            <div>
              <label htmlFor='role' className='mb-1.5 block text-xs font-medium text-[#42584d]'>Role</label>
              <input
                id='role'
                value={role}
                onChange={(event) => setRole(event.target.value)}
                required
                placeholder='e.g. Product Designer'
                className='h-11 w-full rounded-xl border border-[#dce4df] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#9aa7a0] focus:border-[#47765b] focus:ring-4 focus:ring-[#47765b]/10'
              />
            </div>
            <button
              type='submit'
              disabled={add.isPending}
              className='h-11 rounded-xl bg-[#d5ead4] px-5 text-sm font-semibold text-[#244b35] transition hover:bg-[#c7e2c6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#47765b] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {add.isPending ? 'Adding…' : 'Add to tracker'}
            </button>
          </form>
          {add.error && <p role='alert' className='mt-3 text-sm text-[#a2594c]'>{add.error.message}</p>}
        </section>

        <section className='overflow-hidden rounded-2xl border border-[#e5eae4] bg-white shadow-[0_2px_12px_rgba(27,52,40,0.03)]'>
          <div className='border-b border-[#edf0ec] p-4 sm:p-6'>
            <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
              <div>
                <h2 className='text-lg font-semibold tracking-tight'>Your applications</h2>
                <p className='mt-1 text-sm text-[#687771]'>
                  {data.length === 1 ? '1 opportunity in your tracker' : `${data.length} opportunities in your tracker`}
                </p>
              </div>
              <label className='relative block w-full sm:max-w-xs'>
                <span className='sr-only'>Search applications</span>
                <svg viewBox='0 0 20 20' fill='none' className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a9791]' aria-hidden='true'>
                  <circle cx='8.8' cy='8.8' r='5.8' stroke='currentColor' strokeWidth='1.5' />
                  <path d='m13.2 13.2 3.3 3.3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder='Search company or role'
                  className='h-10 w-full rounded-xl border border-[#e1e7e1] bg-[#fbfcfa] pl-10 pr-3 text-sm outline-none transition placeholder:text-[#9aa7a0] focus:border-[#47765b] focus:ring-4 focus:ring-[#47765b]/10'
                />
              </label>
            </div>

            <div className='-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1'>
              {FILTERS.map((status) => (
                <button
                  key={status}
                  type='button'
                  onClick={() => setFilter(status)}
                  aria-pressed={filter === status}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition sm:text-sm ${
                    filter === status
                      ? 'bg-[#173c32] text-white'
                      : 'bg-[#f3f6f2] text-[#627269] hover:bg-[#eaf0e9] hover:text-[#263f31]'
                  }`}
                >
                  {formatStatus(status)}
                  {status !== 'ALL' && <span className='ml-1.5 opacity-70'>{data.filter((application) => application.status === status).length}</span>}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role='alert' className='m-4 rounded-xl border border-[#ecd7d2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#a2594c] sm:m-6'>
              {(error as Error).message}
            </p>
          )}
          {changeStatus.error && (
            <p role='alert' className='mx-4 mt-4 rounded-xl border border-[#ecd7d2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#a2594c] sm:mx-6'>
              {changeStatus.error.message}
            </p>
          )}
          {remove.error && (
            <p role='alert' className='mx-4 mt-4 rounded-xl border border-[#ecd7d2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#a2594c] sm:mx-6'>
              {remove.error.message}
            </p>
          )}

          {isLoading ? (
            <p className='px-5 py-12 text-center text-sm text-[#687771]'>Loading your applications…</p>
          ) : visible.length === 0 ? (
            <div className='px-5 py-12 text-center sm:py-16'>
              <span className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#eef4ed] text-[#47765b]'>
                <svg viewBox='0 0 24 24' fill='none' className='size-6' aria-hidden='true'>
                  <path d='M4 7.5h16M6.5 4v3.5M17.5 4v3.5M5 5.5h14A1.5 1.5 0 0 1 20.5 7v12A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5Z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                  <path d='M8 12h8m-8 4h5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
                </svg>
              </span>
              <h3 className='mt-4 text-sm font-semibold text-[#263a33]'>
                {search || filter !== 'ALL' ? 'No matching applications' : 'Your next opportunity starts here'}
              </h3>
              <p className='mx-auto mt-1.5 max-w-sm text-sm leading-6 text-[#687771]'>
                {search || filter !== 'ALL'
                  ? 'Try another search or choose a different status filter.'
                  : 'Add your first application above and keep every next step in one place.'}
              </p>
            </div>
          ) : (
            <ul className='divide-y divide-[#edf0ec]'>
              {visible.map((application) => (
                <li key={application.id} className='flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                  <div className='flex min-w-0 items-center gap-3.5'>
                    <span className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4ec] text-base font-semibold text-[#47765b]'>
                      {application.company.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-[#263a33]'>{application.company}</p>
                      <p className='mt-1 truncate text-sm text-[#687771]'>{application.role}</p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between gap-3 pl-[58px] sm:justify-end sm:pl-0'>
                    <label className='relative'>
                      <span className='sr-only'>Status for {application.company}</span>
                      <select
                        value={application.status}
                        onChange={(event) => changeStatus.mutate({ id: application.id, status: event.target.value as Status })}
                        className={`max-w-full appearance-none rounded-full border py-2 pl-3 pr-8 text-xs font-medium outline-none transition focus-visible:ring-4 focus-visible:ring-[#47765b]/10 ${STATUS_STYLES[application.status]}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{formatStatus(status)}</option>
                        ))}
                      </select>
                      <svg viewBox='0 0 16 16' fill='none' className='pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2' aria-hidden='true'>
                        <path d='m4 6 4 4 4-4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    </label>
                    <button
                      type='button'
                      onClick={() => remove.mutate(application.id)}
                      disabled={remove.isPending}
                      aria-label={`Delete ${application.company} application`}
                      className='rounded-lg px-2.5 py-2 text-xs font-medium text-[#8a716c] transition hover:bg-[#fbf1ef] hover:text-[#a2594c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a2594c] disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className='mt-6 text-center text-xs text-[#8a9791]'>One step at a time. You’ve got this.</p>
      </div>
    </main>
  );
}
