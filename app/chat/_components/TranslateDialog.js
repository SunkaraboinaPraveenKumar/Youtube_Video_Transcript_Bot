"use client"
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { chatSession } from '@/config/TranslateModel';
import Image from 'next/image';
function TranslateDialog({setInput,input}) {
    const [targetLanguage, setTargetLanguage] = useState("English");
    const [isTranslating, setIsTranslating] = useState(false);
    const handleTranslate = async () => {
        if (!input) {
            toast.error("Please enter text to translate");
            return;
        }

        setIsTranslating(true);
        try {
            const PROMPT = `Translate the following text to ${targetLanguage}. Provide only the translated text without any additional explanation or context:\n\n${input}`;

            // Send message with the prompt
            const response = await chatSession.sendMessage(PROMPT);

            // Ensure response is valid and contains the expected structure
            if (response && response.response && response.response.text) {
                setInput(response.response.text());
                toast.success(`Translated to ${targetLanguage}`);
            } else {
                toast.error("Invalid response from translation API");
            }
        } catch (error) {
            console.error("Error during translation:", error);
            toast.error("An error occurred while translating.");
        } finally {
            setIsTranslating(false);
        }
    };
    const languages = [
        { label: "English", value: "English" },
        { label: "Telugu", value: "Telugu" },
        { label: "Hindi", value: "Hindi" },
        { label: "French", value: "French" },
        { label: "German", value: "German" },
        { label: "Spanish", value: "Spanish" },
        { label: "Italian", value: "Italian" },
        { label: "Portuguese", value: "Portuguese" },
        { label: "Chinese", value: "Chinese" },
        { label: "Japanese", value: "Japanese" },
        { label: "Russian", value: "Russian" },
    ];

    return (
        <Dialog>
            <DialogTrigger className="p-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white">
                <Image src={'/translate.png'} height={25} width={25} alt="translate" />
            </DialogTrigger>

            <DialogContent className="bg-gray-800 text-white p-4 rounded-xl max-h-[270px] max-w-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-800">
                <DialogHeader>
                    <DialogTitle>Select Language</DialogTitle>
                    <DialogDescription>
                        Choose a language to translate the text.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    {/* Translate Button */}
                    <Button
                        onClick={handleTranslate}
                        className="w-[1/2] bg-green-500 text-white rounded-lg"
                        disabled={isTranslating}
                    >
                        {isTranslating ? "Translating..." : "Translate"}
                    </Button>
                    {languages.map((lang, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setTargetLanguage(lang.value);
                                toast.success(`Selected language: ${lang.label}`);
                            }}
                            className={`w-full text-left p-2 rounded ${targetLanguage === lang.value
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 hover:bg-gray-600 text-white"
                                }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default TranslateDialog