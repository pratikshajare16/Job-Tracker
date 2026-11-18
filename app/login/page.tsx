'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      });

      if (result?.error) {
        setError('That email and password combination doesn’t look right. Try again.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('We couldn’t sign you in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className='min-h-screen bg-[#f7f8f5] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]'>
      <section className='relative isolate flex min-h-[310px] flex-col overflow-hidden bg-[#102e29] px-6 py-7 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-10'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
          <div className='absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#a5d6a7]/10 blur-3xl' />
          <div className='absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[#f5b87a]/10 blur-3xl' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px] opacity-40' />
        </div>

        <Link href='/login' className='inline-flex w-fit items-center gap-3' aria-label='Stepwise home'>
          <span className='flex size-10 items-center justify-center rounded-xl bg-[#c4f0c5] text-[#102e29]'>
            <svg viewBox='0 0 24 24' fill='none' className='size-6' aria-hidden='true'>
              <path d='M4 17.5 9.2 12l3.5 3.2L20 7' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' />
              <path d='M15.5 7H20v4.5' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </span>
          <span className='text-xl font-semibold tracking-tight'>Stepwise</span>
        </Link>

        <div className='relative mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-9 lg:py-12'>
          <p className='mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#d3ecd6]'>
            <span className='size-1.5 rounded-full bg-[#a9e3a8]' />
            YOUR CAREER, IN MOTION
          </p>
          <h1 className='max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl'>
            Make your next move <span className='text-[#b9e8b8]'>count.</span>
          </h1>
          <p className='mt-5 max-w-md text-sm leading-6 text-[#c2d4ce] sm:text-base sm:leading-7'>
            Keep every application, follow-up, and opportunity in one calm, clear place.
          </p>

          <div className='mt-8 max-w-md rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/10 backdrop-blur sm:mt-12 sm:p-5'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs text-[#c2d4ce]'>YOUR JOB SEARCH</p>
                <p className='mt-1 text-sm font-medium'>A little progress adds up.</p>
              </div>
              <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[#b9e8b8]/15 text-[#b9e8b8]'>
                <svg viewBox='0 0 24 24' fill='none' className='size-5' aria-hidden='true'>
                  <path d='M12 3v18m9-9H3' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
                  <circle cx='12' cy='12' r='8.5' stroke='currentColor' strokeWidth='1.5' />
                </svg>
              </span>
            </div>
            <div className='mt-5 flex items-center gap-2' aria-hidden='true'>
              <span className='h-1.5 flex-1 rounded-full bg-[#b9e8b8]' />
              <span className='h-1.5 flex-1 rounded-full bg-[#b9e8b8]/70' />
              <span className='h-1.5 flex-1 rounded-full bg-white/20' />
              <span className='h-1.5 flex-1 rounded-full bg-white/20' />
              <span className='h-1.5 flex-1 rounded-full bg-white/20' />
            </div>
            <p className='mt-3 text-xs text-[#c2d4ce]'>One step at a time. You’ve got this.</p>
          </div>
        </div>

        <p className='hidden text-xs text-[#c2d4ce]/75 lg:block'>A clearer path to what’s next.</p>
      </section>

      <section className='flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12'>
        <div className='w-full max-w-md'>
          <div className='mb-8 lg:mb-10'>
            <p className='text-sm font-medium text-[#47765b]'>WELCOME BACK</p>
            <h2 className='mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#172a25] sm:text-4xl'>
              Sign in to Stepwise
            </h2>
            <p className='mt-3 text-sm leading-6 text-[#687771]'>
              Pick up right where your job search left off.
            </p>
          </div>

          <form onSubmit={onSubmit} autoComplete='on' className='space-y-5'>
            <div>
              <label htmlFor='email' className='mb-2 block text-sm font-medium text-[#263a33]'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='username'
                required
                placeholder='you@example.com'
                className='h-12 w-full rounded-xl border border-[#dce4df] bg-white px-4 text-sm text-[#172a25] outline-none transition placeholder:text-[#9aa7a0] focus:border-[#47765b] focus:ring-4 focus:ring-[#47765b]/10'
              />
            </div>
            <div>
              <div className='mb-2 flex items-center justify-between gap-3'>
                <label htmlFor='password' className='text-sm font-medium text-[#263a33]'>
                  Password
                </label>
              </div>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                placeholder='Enter your password'
                className='h-12 w-full rounded-xl border border-[#dce4df] bg-white px-4 text-sm text-[#172a25] outline-none transition placeholder:text-[#9aa7a0] focus:border-[#47765b] focus:ring-4 focus:ring-[#47765b]/10'
              />
            </div>

            {error && (
              <p role='alert' className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {error}
              </p>
            )}

            <button
              type='submit'
              disabled={isSubmitting}
              className='flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173c32] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#225344] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#47765b] disabled:cursor-not-allowed disabled:opacity-70'
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting && (
                <svg viewBox='0 0 20 20' fill='none' className='size-4' aria-hidden='true'>
                  <path d='M4 10h12m-5-5 5 5-5 5' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              )}
            </button>
          </form>

          <p className='mt-7 text-center text-sm text-[#687771]'>
            New to Stepwise?{' '}
            <Link href='/register' className='font-semibold text-[#32634a] underline-offset-4 hover:underline'>
              Create an account
            </Link>
          </p>
          <p className='mt-8 text-center text-xs leading-5 text-[#8a9791]'>
            Your password is handled securely. Use your browser’s password manager to save it for next time.
          </p>
        </div>
      </section>
    </main>
  );
}
