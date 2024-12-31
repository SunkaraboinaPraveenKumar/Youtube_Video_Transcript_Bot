"use client";
import { Button } from '@/components/ui/button';
import { UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ChatHistory } from '@/config/schema';
import { db } from '@/config/postgresdb';

function WorkSpaceHeader({ messages,setMessages }) {
  const { user } = useUser();
  const pathname = usePathname();
  const [deleted,setDeleted]=useState(false);
  const onDelete=()=>{
    setDeleted(true);
    setMessages([]);
    onSave();
  }

  const onSave = async () => {
    if (!user) {
      toast.error("You need to be logged in to save your chat history.");
      return;
    }

    try {
      const email = user?.primaryEmailAddress?.emailAddress;

      const response = await db
        .insert(ChatHistory)
        .values({
          email,
          chatHistory: messages,
          timestamp: new Date(),
        })
        .onConflictDoUpdate({
          target: ChatHistory.email,
          set: { chatHistory: messages, updatedAt: new Date() },
        });

      if (response) {
        if(deleted){
          toast.success("Chat history deleted successfully!");
        }
        else{
          toast.success("Chat history saved successfully!");
        }
        setDeleted(false);
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast.error("Failed to save chat history. Please try again.");
    }
  };

  return (
    <div className={`p-4 flex justify-between shadow-md ${pathname !== '/chat' ? 'bg-white' : 'bg-gray-400'}`}>
      <Link href={"/dashboard"}>
        <Image src={"/logo.png"} width={50} height={50} alt="logo" />
      </Link>
      <div className="flex gap-2 items-center">
        <Button onClick={onDelete} className='bg-red-500 hover:bg-red-800'>Delete Chats</Button>
        <Button onClick={onSave} className='bg-green-500 hover:bg-green-800'>Save</Button>
      </div>
      <UserButton />
    </div>
  );
}

export default WorkSpaceHeader;
