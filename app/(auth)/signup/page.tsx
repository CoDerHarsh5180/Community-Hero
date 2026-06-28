'use client'
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldContent
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import axios, { AxiosError } from 'axios'

import { useForm, Controller } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from "@/lib/validation"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Link from "next/link"

export default function Page() {
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      name: '',
      role: 'CITIZEN',
      // Note: Make sure to add department and otherDepartment to your Zod signupSchema 
      department: '',
      otherDepartment: '' 
    },
    mode: "onChange"
  })

  // Watch the values to conditionally render fields
  const selectedRole = form.watch("role")
  const selectedDepartment = form.watch("department")

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    console.log('clicked')
    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/signup', data)
      router.replace(`/verifycode/${username}`)
    } catch (error) {
      const axiosError = error as AxiosError
      console.log("Error while Signing up")
      toast.error("Error while signing up")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex items-center justify-center min-h-screen py-10">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle className="font-bold text-xl">Welcome to Community Hero</CardTitle>
          <CardDescription>Register now to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="sign-up" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    <Input
                      {...field}
                      id="name"
                      placeholder="Your full name"
                    />
                  </Field>
                )}
              />

              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    <Input
                      {...field}
                      id="username"
                      placeholder="username"
                      value={username}
                      onChange={e => {
                        field.onChange(e)
                        setUsername(e.target.value)
                      }}
                    />
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    <Input
                      {...field}
                      id="email"
                      placeholder="email"
                    />
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="password"
                    />
                  </Field>
                )}
              />

              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel>Role</FieldLabel>
                      <FieldDescription>Select Your role.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={(val) => {
                         field.onChange(val)
                         // Reset department if role changes away from authority
                         if(val !== 'AUTHORITY') {
                            form.setValue('department', '')
                            form.setValue('otherDepartment', '')
                         }
                      }}
                    >
                      <SelectTrigger
                        id="form-rhf-select-role"
                        aria-invalid={fieldState.invalid}
                        className="min-w-[120px]"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        <SelectItem value="CITIZEN">Citizen</SelectItem>
                        <SelectItem value="AUTHORITY">Authority</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              {/* CONDITIONAL RENDER: Department selection if role is AUTHORITY */}
              {selectedRole === 'AUTHORITY' && (
                <Controller
                  name="department"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="department">Department</FieldLabel>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={(val) => {
                            field.onChange(val)
                            // Reset other department text if they switch away from "Others"
                            if(val !== 'Others') {
                                form.setValue('otherDepartment', '')
                            }
                        }}
                      >
                        <SelectTrigger
                          id="department"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          <SelectItem value="Water & Sewage">Water & Sewage</SelectItem>
                          <SelectItem value="Sanitation">Sanitation</SelectItem>
                          <SelectItem value="Public works">Public works</SelectItem>
                          <SelectItem value="Electricity">Electricity</SelectItem>
                          <SelectItem value="Law Enforcement">Law Enforcement</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              )}

              {/* CONDITIONAL RENDER: Specific department input if Department is Others */}
              {selectedRole === 'AUTHORITY' && selectedDepartment === 'Others' && (
                <Controller
                  name="otherDepartment"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="otherDepartment">Specify Department</FieldLabel>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      <Input
                        {...field}
                        id="otherDepartment"
                        placeholder="Please specify your department"
                      />
                    </Field>
                  )}
                />
              )}

            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation={"horizontal"}>
            <Button
              type="submit"
              form="sign-up"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center p-2">
                  Signing Up...<Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </span>
              ) : "Sign Up"}
            </Button>
          </Field>
          <div>
              Already Have Account?, <Link href='/signin' className="hover:text-blue-500">Sign In </Link>Now
            </div>
        </CardFooter>
      </Card>
    </div>
  )
}