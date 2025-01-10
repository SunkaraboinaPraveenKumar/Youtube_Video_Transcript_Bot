import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { AudioLinesIcon, Mic, ArrowUp } from 'lucide-react';
import TranslateDialog from './TranslateDialog';
import WebSearch from './WebSearch';

const ChatInput = ({
  input,
  setInput,
  handleKeyDown,
  handleImageUpload,
  imagePreview,
  isRecording,
  startRecording,
  stopRecording,
  handleSendMessage,
  setWebSearchResults
}) => {
  const [webSearchActive, setWebSearchActive] = useState(false);
  

  const performWebSearch = async (query) => {
    if (!query) return;
    try {
      const response = await fetch(`/api/web-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setWebSearchResults(data.results);
    } catch (error) {
      console.error('Web search failed:', error);
    }
  };

  const handleSendWithWebSearch = async () => {
    if (!input.trim()) return; // Prevent sending empty messages
  
    if (webSearchActive) {
      await performWebSearch(input);
    }
    handleSendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 shadow-md">
      <div className="relative flex items-center space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 bg-gray-700 text-white resize-none p-3 h-28 rounded-xl"
        />
        <div className="absolute left-3 bottom-3 space-x-2 flex">
          {imagePreview && (
            <Image src={imagePreview} alt="Uploaded Preview" width={25} height={25} className="rounded-md" />
          )}
          <label className="bg-blue-500 text-white p-2 rounded-full cursor-pointer">
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            <Image src="/upload.png" width={25} height={25} alt="Upload" />
          </label>
          {isRecording ? (
            <button onClick={stopRecording} className="bg-red-500 text-white p-2 rounded-full">
              <AudioLinesIcon />
            </button>
          ) : (
            <button onClick={startRecording} className="bg-green-500 text-white p-2 rounded-full">
              <Mic />
            </button>
          )}
        </div>
        <div className="absolute right-28 bottom-3 flex items-center space-x-2">
          <TranslateDialog setInput={setInput} input={input} />
          <WebSearch 
          setWebSearchActive={setWebSearchActive}
          />
        </div>
        <button
          onClick={handleSendWithWebSearch}
          className="bg-blue-500 text-white p-2 rounded-full absolute right-3 bottom-3"
        >
          <ArrowUp />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
