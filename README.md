# AI-Powered YouTube Transcript & Chatbot

## 🚀 Excited to share my latest project! 🚀

Deployed URL: [AI-Powered Chatbot](https://lnkd.in/gzak5r5m)

This project is an AI-driven application that enables interactive conversations with YouTube video transcripts. By extracting transcripts, generating embeddings, and applying advanced context extraction, the chatbot provides highly relevant and accurate responses each time. Moreover, the app supports multi-modal interactions, including image and voice prompts, to enhance the user experience.

### ✨ Key Features:
- **Chat with YouTube Transcripts**: Fetches and processes YouTube video transcripts to deliver context-aware conversations.
- **Image and Voice Prompts**: Interact with the chatbot by uploading images or using voice inputs.
- **Text Extraction from Images**: Leveraging the Llama Model for accurate OCR (Optical Character Recognition) from uploaded images.
- **Voice-to-Text Conversion**: Powered by Whisper (Hugging Face), providing high-quality transcriptions from voice inputs.

---

## 💡 Technologies & Resources:

1. **Convex Database**: Manages PDF files and other related data.  
   - [Convex Dashboard](https://dashboard.convex.dev/t/praveenkumarsunkaraboina/ai-pdf-notes-taker/polished-marlin-789/data?table=pdfFiles)
   - [Convex Docs](https://docs.convex.dev/database/writing-data)

2. **Text Embeddings & Vector Stores**: Built using LangChain to facilitate better understanding of the transcripts.  
   - [LangChain Embeddings](https://js.langchain.com/docs/integrations/text_embedding/)  
   - [Convex Vector Stores](https://js.langchain.com/docs/integrations/vectorstores/convex/)

3. **Google Generative AI**: Generates contextually relevant responses during chat interactions.  
   - [Google Generative AI](https://ai.google.dev/)

4. **Text Editor Integration**: A rich text editing experience using Tiptap for customizing and managing interactions.  
   - [Tiptap Docs](https://tiptap.dev/docs/editor/extensions/)

5. **Llama Model for Text Extraction**: Utilizes the Llama-3.2-11B-Vision model for advanced OCR tasks.

6. **Voice-to-Text**: Whisper from Hugging Face to transcribe voice inputs into text.  
   - [Whisper API](https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo)

7. **UI Components**: Hyper UI is used for a sleek, responsive interface.  
   - [Hyper UI](https://www.hyperui.dev/)

---

## 🛠 Folder Structure

The application follows a routing-based architecture in **Next.js**, with the key structure shown below:

```
.
├── app
│   ├── _components
│   ├── (auth)
│   ├── api
│   ├── chat
│   ├── dashboard
│   ├── fonts
│   ├── transcribe_chat
│   ├── workspace_bot
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   └── provider.js
├── components
├── config
├── lib
├── node_modules
├── public
├── .env
└── package.json
```

- **app/**: Main application directory containing pages, layouts, and API routes.
- **components/**: Reusable components for the UI.
- **config/**: Configuration files for database and environment settings.
- **lib/**: Utility functions and libraries.

---

## 📦 How to Run the Project

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/yt-transcript-chatbot.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app.

### Deploy on Vercel
Deploying this Next.js application is easiest with Vercel, the platform built by the creators of Next.js. Follow the official deployment guide:  
[Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)

---

## Contributing

Feel free to raise issues or contribute to the project by submitting pull requests. Your feedback and contributions are always welcome!

---

## License

This project is licensed under the [MIT License](LICENSE).

