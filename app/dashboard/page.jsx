"use client"
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function Dashboard() {
  const { user } = useUser();
  const filesList = useQuery(api.pdfStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  });

  return (
    <div>
      <div className='flex justify-between gap-2'>
        <h2 className='font-medium text-2xl'>Work Space</h2>
        <div>
          <Link href={'/chat'}>
            <Button className='bg-purple-600 hover:bg-purple-800 flex gap-2'>
              <Image src={'/try_bot.png'} alt='try-bot' width={50} height={50} className='object-cover' />
              <span className='ml-2'>Try Our Bot!!</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Scrollable div for medium screens and above */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-10 overflow-y-auto max-h-[600px] scrollbar-thin'>
        {
          filesList?.length > 0 ? filesList.map((file, index) => (
            <div className='flex p-5 shadow-md rounded-md flex-col items-center justify-center border cursor-pointer hover:scale-105 transition-all' key={index}>
              <Image src={"/tube.png"} height={50} width={50} alt='pdf' />
              <h2 className='mt-3 font-medium text-lg'>{file?.fileName}</h2>
              {/* Buttons for navigating to workspace and workspace_bot */}
              <div className='mt-4 flex gap-4'>
                <Link href={`/transcribe_chat/${file?.fileId}`}>
                  <Button className='bg-green-500 hover:bg-green-800 text-white'>Transcribe Bot</Button>
                </Link>
              </div>
            </div>
          ))
            :
            [1, 2, 3, 4, 5, 6, 7].map((item, index) => (
              <div className='bg-slate-200 rounded-md h-[150px] animate-pulse' key={index}>
              </div>
            ))
        }
      </div>
    </div>
  );
}

export default Dashboard;
