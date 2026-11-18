'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
    });
    if (res.ok) router.push('/login');
    else setError((await res.json()).error ?? 'Something went wrong');
  }

  return (
    <main className='mx-auto mt-24 max-w-sm rounded-xl bg-white p-6 shadow'>
      <h1 className='mb-4 text-2xl font-semibold'>Create account</h1>
      <form onSubmit={onSubmit} className='space-y-3'>
        <input name='email' type='email' required placeholder='Email'
          className='w-full rounded border p-2' />
        <input name='password' type='password' required minLength={8}
          placeholder='Password (8+ characters)' className='w-full rounded border p-2' />
        {error && <p className='text-sm text-red-600'>{error}</p>}
        <button className='w-full rounded bg-indigo-600 p-2 text-white hover:bg-indigo-700'>
          Register
        </button>
      </form>
      <p className='mt-3 text-sm'>
        Have an account? <Link href='/login' className='text-indigo-600'>Log in</Link>
      </p>
    </main>
  );
}