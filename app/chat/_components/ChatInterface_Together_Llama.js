"use client"
import React, { useState, useEffect, useRef } from "react";
import { chatSession } from "@/config/ChatModel";
import { toast } from "sonner";
import { storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import axios from "axios";
import Image from "next/image";
import { ArrowDown, Copy } from "lucide-react";
import ChatItem from "./ChatItem";
import { useUser } from "@clerk/nextjs";
import { ChatHistory } from "@/config/schema";
import { db } from "@/config/postgresdb";
import { eq } from "drizzle-orm";
import ChatInput from "./ChatInput";

function ChatInterface({ messages, setMessages }) {
    const [webSearchResults, setWebSearchResults] = useState(null);
    const { user } = useUser();
    const fetchChatHistory = async () => {
        if (!user) {
            return;
        }

        try {
            const email = user?.primaryEmailAddress?.emailAddress;

            const chatHistory = await db
                .select(ChatHistory)
                .from(ChatHistory)
                .where(eq(ChatHistory.email, email))

            if (chatHistory.length > 0) {
                console.log("chatHistory", chatHistory[0].chatHistory);
                setMessages(chatHistory[0].chatHistory);
            }
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };
    useEffect(() => {
        fetchChatHistory();
    }, [user]);
    const [input, setInput] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [extractedImageText, setExtractedImageText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadedImageRef, setUploadedImageRef] = useState(null);

    const chatContainerRef = useRef(null);
    const messageEndRef = useRef(null);
    const audioChunksRef = useRef([]);
    const mediaRecorderRef = useRef(null); // Initialize mediaRecorderRef

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if ((!input.trim() && !extractedImageText) || isExtracting) return;

        const newMessages = [];

        if (extractedImageText && extractedImageText !== input.trim()) {
            newMessages.push({ role: "user", content: extractedImageText });
        }

        if (input.trim()) {
            newMessages.push({ role: "user", content: input });
        }

        if (newMessages.length === 0) return;  // No new messages to send

        setMessages((prev) => [...prev, ...newMessages]);

        try {
            toast("AI is generating a response...");
            const fullPrompt = `
                 You are a highly knowledgeable, interactive, and user-friendly chatbot designed to provide comprehensive and engaging responses to any question. Your goals include:
    
                1. Interpreting and answering the user's query with detailed, accurate, and easy-to-understand information.
                2. Ensuring responses are conversational and encouraging further interaction.
                3. If an image has been uploaded, incorporate the extracted text into the response only if relevant.
                4. Avoid referencing "extracted image text" explicitly when it is unavailable ("N/A").
                5. Avoid referencing "Web Search Results" explicitly when it is unavailable "No web search results available.".
                6. Maintain a friendly and professional tone throughout.
                7. Always conclude responses clearly without abrupt or incomplete sentences.
                8. Suggest follow-up questions or topics based on the user's query to keep the conversation flowing.

                **Extracted Image Text:** "${extractedImageText || 'N/A'}"
                **User Input:** "${input}"
                **Web Search Results:** "${webSearchResults?.results ? webSearchResults.results.map(result => `
                    <div class="web-search-result">
                        <a href="${result.url}" target="_blank">
                            <h3>${result.title}</h3>
                            <p>${result.description}</p>
                            <img src="${result.icon}" alt="favicon" />
                        </a>
                    </div>
                `).join('') : 'No web search results available.'}"

                **Provide some top three urls at last in html clickable links**

                Now, based on the above inputs, generate a thoughtful and engaging response.
            `;

            const aiResult = await chatSession.sendMessage(fullPrompt);
            const cleanResponse = aiResult.response.text().trim();

            setMessages((prev) => [...prev, { role: "assistant", content: cleanResponse }]);
            toast("Response generated!");
        } catch (error) {
            console.error("Failed to generate response:", error);
            toast("Error generating response.");
        }

        setInput("");
        setExtractedImageText("");
        setImagePreview(null);

        if (uploadedImageRef) {
            try {
                await deleteObject(uploadedImageRef);
                setUploadedImageRef(null);
            } catch (error) {
                console.error("Failed to delete image:", error);
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsExtracting(true);
        setExtractedImageText("");
        setImagePreview(URL.createObjectURL(file));
        toast("Extracting text from image...");

        try {
            const storageRef = ref(storage, `uploaded-images/${Date.now()}_${file.name}`);
            setUploadedImageRef(storageRef);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                null,
                (error) => {
                    console.error("Error uploading image:", error);
                    toast("Failed to upload image.");
                    setIsExtracting(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    const ocrResponse = await axios.post("/api/ocr", { imagePath: downloadURL });
                    const extractedText = ocrResponse.data.result; // Extracted text from OCR

                    setExtractedImageText(extractedText); // Store extracted text
                    setInput(extractedText); // Set the extracted text to textarea input

                    toast("Content extracted successfully!");
                }
            );
        } catch (error) {
            console.error("Error handling image upload:", error);
            toast("Failed to extract text from the image.");
        } finally {
            setIsExtracting(false);
        }
    };



    const handleAudioStop = async () => {
        if (!audioChunksRef.current || audioChunksRef.current.length === 0) {
            toast("Please record something before stopping!");
            return;
        }

        // Create a Blob from the audio data and convert to a file for sending to the server
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });

        toast("Transcribing voice...");

        // Prepare the form data for the transcription API
        const formData = new FormData();
        formData.append("file", audioFile);

        try {
            // Send the audio file for transcription
            const response = await axios.post("/api/voice-to-text", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                // If transcription is successful, update the input state with the transcribed text
                setInput(response.data.transcription);
                toast("Voice transcription completed!");
            } else {
                // Handle any error from the transcription service
                toast("Failed to transcribe voice: " + (response.data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error transcribing voice:", error);
            toast("Failed to transcribe voice.");
        }
    };

    // Function to start recording
    const startRecording = () => {
        setIsRecording(true);
        audioChunksRef.current = []; // Clear previous audio data

        // Access the microphone to start recording
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);

            // Collect audio data chunks during the recording
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            // Call handleAudioStop when the recording is stopped
            mediaRecorderRef.current.onstop = handleAudioStop;

            // Start recording
            mediaRecorderRef.current.start();
        });
    };

    // Function to stop recording
    const stopRecording = () => {
        setIsRecording(false);
        mediaRecorderRef.current?.stop();
    };



    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    useEffect(() => {
        handleScrollToBottom()
    }, [messages])

    const handleScrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="flex flex-col h-full relative gap-3">
            {/* Chat messages container */}
            <div className="flex-grow w-full overflow-y-auto p-4 relative bg-gray-800 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-gray-800" ref={chatContainerRef} style={{ maxHeight: "calc(100vh - 170px)" }}>
                {messages?.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-12 p-4 rounded-lg text-white bg-gray-500 relative`}
                    >
                        <div className="flex items-start">
                            {/* Avatar */}
                            {msg.role === "user" ? (
                                <Image src="/user.png" height={35} width={35} alt="User" />
                            ) : (
                                <Image src="/bot.png" height={35} width={35} alt="Bot" />
                            )}

                            {/* Message Content */}
                            <div className="flex-1 ml-3 mt-6 overflow-x-hidden ">
                                <ChatItem content={msg.content} role={msg.role} />
                            </div>
                        </div>

                        {/* Copy Button */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(msg.content)
                                toast("Copied to clipboard!")
                            }}
                            className="absolute top-1 right-1 p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white"
                        >
                            <Copy />
                        </button>
                    </div>
                ))}
                <div ref={messageEndRef}></div>
            </div>

            {/* Scroll to bottom button */}
            <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-10">
                <button
                    onClick={handleScrollToBottom}
                    className="bg-gray-500 text-white p-2 rounded-full shadow-lg"
                >
                    <ArrowDown />
                </button>
            </div>
            {/* Message input area */}
            <ChatInput
                input={input}
                setInput={setInput}
                handleKeyDown={handleKeyDown}
                handleImageUpload={handleImageUpload}
                imagePreview={imagePreview}
                isRecording={isRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
                handleSendMessage={handleSendMessage}
                setWebSearchResults={setWebSearchResults}
            />
        </div>
    );
}

export default ChatInterface;
