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
import { verifyEmailSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, {AxiosError} from "axios"

import { Loader2 } from "lucide-react"
function page() {
  const router = useRouter()

  const params = useParams<{username:string}>()

  const [isVerifying, setIsVerifying] = useState(false)
  const form = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver:zodResolver(verifyEmailSchema),
    defaultValues:{
      code:''
    }
  })

  const onSubmit = async(data : z.infer<typeof verifyEmailSchema>)=>{
    setIsVerifying(true)

    try {
      console.log(params)
      const res = axios.post('/api/verifycode', {
        username:params.username,
        code: data.code
      })
      router.replace('/signin')
    } catch (error) {
      console.error("Error in signup of user")
      const axiosError = error as AxiosError

    }
    finally{
      setIsVerifying(false)
    }
    
    
  }
  return (
    <div className="w-full flex items-center justify-center h-screen">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Verify your Gmail Account</CardTitle>
          <CardDescription>Enter the 6-digit verification code send to the given gmail</CardDescription>
        </CardHeader>
        <CardContent>
          <form id = "verify" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller 
                name="code"
                control = {form.control}
                render={({field, fieldState})=>(
                  <Field data-invalid = {fieldState.invalid}>
                    <FieldLabel>Verification Code</FieldLabel>
                    <Input
                      {...field}
                      id="code"
                      placeholder="Enter your verification code"
                    />
                  </Field> 
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="verify" disabled={isVerifying}>
            {isVerifying && <span>Verifying... <Loader2 /> </span>}
            {!isVerifying && ( <div>Verify</div> ) }
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default page