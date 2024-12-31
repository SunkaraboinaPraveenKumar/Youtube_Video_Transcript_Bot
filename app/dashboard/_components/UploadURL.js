"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation

function UploadURL({ children, isMaxFiles }) {
  const generateUploadUrl = useMutation(api.pdfStorage.generateUploadUrl);
  const getFileUrl = useMutation(api.pdfStorage.getFileUrl);
  const addFileEntry = useMutation(api.pdfStorage.AddFileEntryToDb);
  const embeddDocument = useAction(api.myAction.ingest);
  const [url, setUrl] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState(false);

  const GetUserInfo = useQuery(api.user.GetUserInfo, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });

  const onUpload = async () => {
    if (isMaxFiles && !GetUserInfo.upgrade) {
      toast("Sorry, Please Upgrade! Free Trial is Over!!");
      return;
    }
    setLoading(true);

    try {
      // Step 1: Transcribe the YouTube video
      const apiResp = await axios.get("/api/transcribe-video?url=" + url);
      console.log("Transcription API Response:", apiResp.data);
      const transcription =
        typeof apiResp.data.result === "string"
          ? apiResp.data.result
          : JSON.stringify(apiResp.data.result);

      if (!transcription || typeof transcription !== "string") {
        throw new Error("Transcription is not a valid string");
      }
      console.log(transcription);

      // Step 2: Generate a PDF from the transcription
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(transcription, 180);
      doc.text(lines, 10, 10);
      const pdfBlob = doc.output("blob");

      // Step 3: Upload the generated PDF to the storage
      const postUrl = await generateUploadUrl();
      const formData = new FormData();
      formData.append("file", pdfBlob, fileName || "transcription.pdf");

      const uploadResp = await fetch(postUrl, {
        method: "POST",
        body: formData,
      });
      const { storageId } = await uploadResp.json();

      // Step 4: Generate the file URL and save entry to the database
      const fileId = uuid4();
      const fileUrl = await getFileUrl({ storageId: storageId });
      await addFileEntry({
        fileId: fileId,
        storageId: storageId,
        fileName: fileName ?? "Untitled File",
        fileUrl: fileUrl,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      // Step 5: Store the vector embeddings in the database
      await embeddDocument({
        splitText: Array.isArray(transcription)
          ? transcription
          : transcription.split("\n").filter((line) => line.trim()), // Split into an array of strings
        fileId: fileId,
      });

      setLoading(false);
      setOpen(false);
      toast("YouTube video transcribed, PDF generated, and vector embeddings stored successfully!");
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Failed to process the YouTube video. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          className="w-full bg-red-600 hover:bg-red-800"
          disabled={isMaxFiles}
        >
          + Upload YouTube URL
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2">
            <UploadCloud />
            Upload YouTube URL
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col">
              <h2 className="mt-5">Enter YouTube Video URL</h2>
              <div className="gap-2 p-3 rounded-md">
                <Input
                  type="url"
                  placeholder="https://youtube.com/videoId"
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <label>File Name*</label>
              <div className="mt-2 gap-2 p-3 rounded-md">
                <Input placeholder="File Name" onChange={(e) => setFileName(e.target.value)} />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogClose>
          <Button onClick={onUpload} disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UploadURL;
