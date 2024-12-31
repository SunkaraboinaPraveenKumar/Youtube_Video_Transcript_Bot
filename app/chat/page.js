"use client";
import React, { useState } from 'react';
import WorkSpaceHeader from './_components/WorkSpaceHeader';
import ChatInterface from './_components/ChatInterface_Together_Llama';

function WorkSpace() {
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
