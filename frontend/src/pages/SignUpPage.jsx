import React from 'react'
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';

function SignUpPage() {
  const [showPassword, getShowPassword] = useState(false);
  fonst [FormData,setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  })
  const {signup,isSigningUp} = useAuthStore();
  const validateForm = ()=>{}
  const handleSubmit = (e)=>{
    e.preventDefault()
  }



  return (
    <div className='min-h-screen grid d-lg-grid-cols-2'>
      <div>
        
      </div>
    </div>
  )
}

export default SignUpPage