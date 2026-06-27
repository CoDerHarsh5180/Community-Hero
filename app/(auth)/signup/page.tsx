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
import { useState, useEffect } from "react"
import axios, {AxiosError} from 'axios'

import {useForm, Controller} from 'react-hook-form'
import * as z from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toaster } from "@/components/ui/sonner"
import {toast} from 'sonner'

import { Loader2} from 'lucide-react'
function page() {

  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isUsernameChecking, setIsUsernameChecking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [uniqueUsername, setUniqueUsername] = useState(true)

  const router = useRouter()
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues:{
      username:'',
      email:'',
      password:'',
      name:'',
      role:'CITIZEN'
    },
    mode:"onChange"
  }) 

  const onSubmit = async(data: z.infer<typeof signupSchema>)=>{
    
    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/signup', data)
      // console.log(data)
      router.replace(`/verifycode/${username}`)
    } catch (error) {
      const axiosError = error as AxiosError
      console.log("Error while Signing up")
    }
    finally{
      setIsSubmitting(false)
    }
  }
  return (
    <div className="w-full flex items-center justify-center h-screen">
      <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle className="font-bold text-xl">Welcome to Community Hero</CardTitle>
        <CardDescription>Register now to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form id = "sign-up" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller 
              name = "name"
              control = {form.control}
              render={({field, fieldState})=>(
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    Name
                  </FieldLabel>
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
              name = "username"
              control = {form.control}
              render={({field, fieldState})=>(
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username">
                    Username
                  </FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  <Input
                    {...field}
                    id="username"
                    placeholder="username"
                    value={username}
                    onChange={e=>{
                      field.onChange(e)
                      setUsername(e.target.value)}}
                  />
                </Field>
              )}
            />
            <Controller 
              name = "email"
              control = {form.control}
              render={({field, fieldState})=>(
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">
                    Email
                  </FieldLabel>
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
              name = "password"
              control = {form.control}
              render={({field, fieldState})=>(
                <Field>
                  <FieldLabel htmlFor="password">
                    Password
                  </FieldLabel>
                   {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  <Input
                    {...field}
                    id="password"
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
                        <FieldLabel>
                        Role
                        </FieldLabel>
                        <FieldDescription>
                        Select Your role.
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                    <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                    >
                        <SelectTrigger
                        id="form-rhf-select-language"
                        aria-invalid={fieldState.invalid}
                        className="min-w-[120px]"
                        >
                        <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                        <SelectItem value="CITIZEN">Citizen</SelectItem>
                        <SelectItem value="AUTHORITY">Authority</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    </Field>
                )}
                />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation={"horizontal"}>
          <Button 
            type="submit" 
            form="sign-up"
            disabled={isSubmitting}
          >{isSubmitting ?<p> Signing Up...<Loader2 className="mr-2 h-4 w-4 animate-spin" /></p> : "Sign Up"}</Button>
          
        </Field>
      </CardFooter>
    </Card>
    </div>
  )
}

export default page