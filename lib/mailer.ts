
import nodemailer from "nodemailer"
const sendVerificationEmail = async(email:string, otp:string)=>{
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL_SERVER_USER,
            pass:process.env.EMAIL_SERVER_PASSWORD
        }
    })

    const htmlLayout = `
        <div style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:8px; overflow:hidden;">
    <!-- Header -->
    <div style="background-color:#4f46e5; color:#ffffff; text-align:center; padding:20px; font-size:24px; font-weight:bold;">
      OTP Verification
    </div>
    <!-- Body -->
    <div style="padding:30px; color:#333333; font-size:16px; line-height:1.5;">
      <p>Hello,</p>
      <p>Use the following One-Time Password (OTP) to complete your verification process:</p>
      <p style="text-align:center; font-size:28px; font-weight:bold; color:#4f46e5; margin:30px 0;">
        ${otp}
      </p>
      <p>This OTP is valid for the next <strong>10 minutes</strong>. Please do not share it with anyone.</p>
      <p>Thank you,<br></p>
    </div>
    <!-- Footer -->
    <div style="background-color:#f4f4f4; text-align:center; padding:15px; font-size:12px; color:#777777;">
     Made by myself😊
    </div>
  </div> 
</div>`

    const mailOptions = {
        from:process.env.EMAIL,
        to:email,
        subject:"OTP Verification Email",
        html:htmlLayout

    }
   
    try{
        const info = await transporter.sendMail(mailOptions)
        console.log("Email Sent")
    }
    catch(e){
        console.log(e)
    }
}
export default sendVerificationEmail