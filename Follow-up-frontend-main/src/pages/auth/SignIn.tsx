import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Eye, EyeOff, Lock, Mail, Send } from 'lucide-react'
import { loginFormSchema, type LoginFormValues } from '@/schema/auth/login.schema'
import { useLoginMutation } from '@/store/features/auth/authApi'
import { setCredentials } from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { dismissToast, showError, showLoading, showSuccess } from '@/utils/toast'
import Logo from '@/components/logo/Logo'


export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()

  const signInForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSignInSubmit = async (values: LoginFormValues) => {
    // const loadingToastId = showLoading('Signing you in...')

    try {
      const response = await login({
        email: values.email,
        password: values.password,
      }).unwrap()

      if (response.success) {
        dispatch(
          setCredentials({
            token: response.data.accessToken,
            user: response.data.user,
          }),
        )

        showSuccess(response.message || 'Login successful')
        signInForm.reset()
        navigate('/dashboard')
      } else {
        showError(response.message || 'Login failed. Please try again.')
      }
    } catch (error: unknown) {
      showError((error as { data?: { message?: string } })?.data?.message || 'Login failed. Please try again.')
    } 
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-100 p-4'>
      <Card className='w-full max-w-[28rem] rounded-2xl border-slate-200 bg-white py-8 shadow-sm'>
        <CardContent className='px-8'>
          <div className='mb-6 flex justify-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl border  border-indigo-600'>
              <Logo></Logo>
            </div>
          </div>

          <div className='mb-8 space-y-2 text-center'>
            <h1 className='text-4xl font-semibold tracking-tight text-slate-900'>Touch Base AI</h1>
            {/* <h1 className='text-4xl font-semibold tracking-tight text-slate-900'>Follow-Up Agent</h1> */}
            <p className='text-lg text-slate-600'>
              Transform your call transcripts into personalized follow-ups with AI
            </p>
          </div>

          <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onSignInSubmit)}>
              <div className='space-y-5'>
                <FormField
                  control={signInForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='space-y-2.5'>
                      <FormLabel>Email address</FormLabel>
                      <div className='relative'>
                        <Mail className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='you@company.com'
                            className='h-12 border-slate-300 pl-10'
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='space-y-2.5'>
                      <FormLabel>Password</FormLabel>
                      <div className='relative'>
                        <Lock className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            className='h-12 border-slate-300 px-10'
                            {...field}
                          />
                        </FormControl>
                        <button
                          type='button'
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600'
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type='submit'
                  disabled={isLoading}
                  className='mt-2 h-12 w-full bg-indigo-600 text-base hover:bg-indigo-700 disabled:opacity-70'
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className='my-6 h-px w-full bg-slate-200' />

                <p className='text-center text-lg text-slate-600'>
                  Don&apos;t have an account?{' '}
                  <Link to='/auth/signup' className='font-semibold text-indigo-600 hover:text-indigo-700'>
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
