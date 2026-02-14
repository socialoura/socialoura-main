'use client';

import Image from 'next/image';

export default function PaymentMethods() {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
      <div className="text-xs sm:text-sm text-gray-400 font-medium">Secure payment:</div>
      
      {/* Visa */}
      <div className="h-8 sm:h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm">
        <Image src="/images/visa.svg" alt="Visa" width={40} height={16} className="h-4 w-auto" />
      </div>
      
      {/* Mastercard */}
      <div className="h-8 sm:h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm">
        <Image src="/images/mastercard.svg" alt="Mastercard" width={40} height={24} className="h-5 w-auto" />
      </div>
      
      {/* Apple Pay */}
      <div className="h-8 sm:h-10 px-3 bg-black rounded-lg flex items-center justify-center shadow-sm">
        <Image src="/images/apple-pay.svg" alt="Apple Pay" width={40} height={16} className="h-4 w-auto" />
      </div>
      
      {/* Google Pay */}
      <div className="h-8 sm:h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm">
        <Image src="/images/google-pay.svg" alt="Google Pay" width={40} height={16} className="h-4 w-auto" />
      </div>
      
      {/* PayPal */}
      <div className="h-8 sm:h-10 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm">
        <Image src="/images/paypal.svg" alt="PayPal" width={60} height={16} className="h-4 w-auto" />
      </div>
    </div>
  );
}
