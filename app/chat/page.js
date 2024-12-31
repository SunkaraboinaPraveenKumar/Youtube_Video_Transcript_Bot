"use client";
import React, { useState, useEffect } from 'react';
import WorkSpaceHeader from './_components/WorkSpaceHeader';
import ChatInterface from './_components/ChatInterface_Together_Llama';
import { db } from '@/config/postgresdb';
import { ChatHistory } from '@/config/schema';
import { useUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';

function WorkSpace() {
    const { user } = useUser();
    const [messages, setMessages] = useState([]);
    return (
        <div className="h-screen flex flex-col">
            <WorkSpaceHeader messages={messages} setMessages={setMessages}/>
            <div className="flex-grow">
                <ChatInterface messages={messages} setMessages={setMessages}/>
            </div>
        </div>
    );
}

export default WorkSpace;