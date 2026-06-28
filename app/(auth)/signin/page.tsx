'use client'
import { useState } from "react"
import { Card,
         CardContent,
         CardDescription,
         CardFooter,
         CardHeader,
         CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
   Field,
   FieldDescription,
   FieldError,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {useForm, Controller} from 'react-hook-form'
import { useParams, useRouter } from "next/navigation"
import * as z from 'zod'
import { loginSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, {AxiosError} from "axios"
import { Loader2 } from "lucide-react"
import Link from "next/link"

function page() {
    const router = useRouter()
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues:{
            identifier:'',
            password:''
        }
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const onSubmit = async(data: z.infer<typeof loginSchema>)=>{
        setIsSubmitting(true)
        try {
            console.log("Logging...")
            const res = await axios.post('/api/signin', data)
            const user = res.data.user
            if(user.role === 'ADMIN'){
                router.replace('/admin')
            }
            else if(user.role=== 'AUTHORITY') {
                router.replace('/authority')
            }
            else router.replace('/dashboard/map')
        } catch (error) {
            console.log("Error while logging in")
            console.log(error)
        }
        finally{
            setIsSubmitting(false)
        }
    }
  return (
    <div  className="w-full flex items-center justify-center h-screen">
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>
                    Community Hero
                </CardTitle>
                <CardDescription>Sign In to Enter the System</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="sign-in" onSubmit={form.handleSubmit(onSubmit)}  method="POST">
                    <FieldGroup>
                        <Controller 
                            name="identifier"
                            control={form.control}
                            render={({field, fieldState})=>(
                                <Field data-invalid = {fieldState.invalid}>
                                    <FieldLabel>Username or Email</FieldLabel>  
                                    <Input
                                        {...field}
                                        id="identifier"
                                        placeholder="harsh@web.in / harsh123"
                                    />  
                                </Field>
                            )}
                        />
                        <Controller 
                            name="password"
                            control={form.control}
                            render={({field, fieldState})=>(
                                <Field data-invalid = {fieldState.invalid}>
                                    <FieldLabel>Password</FieldLabel>  
                                    <Input
                                        {...field}
                                        id="password"
                                        placeholder="........."
                                    />  
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button type="submit" form="sign-in">
                    {isSubmitting && <span>Please Wait... <Loader2 className="animate-spin"/> </span>}
            {!isSubmitting && ( <div>Login</div> ) }
                </Button>
                <div>Don't have an account? <Link href='/signup' className="hover:text-blue-500">Sign Up</Link></div>
                
            </CardFooter>
        </Card>
    </div>
  )
}

export default page