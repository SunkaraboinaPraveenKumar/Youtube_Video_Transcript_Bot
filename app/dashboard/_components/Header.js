import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import React from 'react';

function Header() {
  return (
    <div className='flex justify-between w-full p-2'>
      <Image src={'/logo1.png'} height={60} width={60} alt='logo'/>
      <UserButton />
    </div>
  );
}

export default Header;
