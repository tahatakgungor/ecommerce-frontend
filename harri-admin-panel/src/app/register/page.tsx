import React from 'react';
import Link from 'next/link';
import RegisterForm from '@/forms/register-form';
import AuthBrandPanel from '@/app/components/auth/auth-brand-panel';

const RegisterPage = () => {
  return (
    <div className="tp-main-wrapper h-screen">
      <div className="container mx-auto my-auto h-full flex items-center justify-center">
        <div className="pt-[120px] pb-[120px]">
          <div className="grid grid-cols-12 shadow-lg bg-white overflow-hidden rounded-md ">
            <AuthBrandPanel />
            <div className="col-span-12 lg:col-span-6 w-full max-w-[500px] mx-auto my-auto pt-[36px] md:pt-[50px] py-[40px] md:py-[60px] px-5 md:px-[60px]">
              <div className="text-center">
                <h4 className="text-[24px] mb-1">Register Now.</h4>
                <p>Already have an account?  <span> 
                  <Link href="/login" className="text-theme">Sign In</Link> </span>
                </p>
              </div>
              <div className="">
                <RegisterForm/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
