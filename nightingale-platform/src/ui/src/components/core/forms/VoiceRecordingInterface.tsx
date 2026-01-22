"use client";
import React, { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { Button, Box, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

export const VoiceRecordingInterface = ({ name }: { name: string }) => {
  const { control } = useFormContext();

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const labelId = `${name}-label`;
  const descriptionId = `${name}-description`;

  const startRecording = async (onChange: (value: Blob | null) => void) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.start();
    setIsRecording(true);

    const chunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
      onChange(blob);
    };
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field: { onChange, value } }) => {
        const audioUrl = value ? URL.createObjectURL(value) : null;

        return (
          <Box
            className="p-md bg-surface border-md rounded-md border-primary/20"
            aria-labelledby={labelId}
            aria-describedby={descriptionId}
          >
            <Typography
              id={labelId}
              variant="subtitle1"
              className="mb-sm block text-text/70"
            >
              Describe your symptoms (Voice)
            </Typography>

            <div id={descriptionId} className="sr-only">
              Record an audio description of your symptoms. A playback control
              will appear after recording.
            </div>

            <div className="flex items-center gap-md">
              {!isRecording ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Mic />}
                  onClick={() => startRecording(onChange)}
                  className="rounded-xl"
                >
                  Record
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Square />}
                  onClick={stopRecording}
                >
                  Stop (Recording…)
                </Button>
              )}

              {audioUrl && (
                <audio
                  src={audioUrl}
                  controls
                  className="h-10"
                  aria-label="Recorded symptom description playback"
                />
              )}
            </div>
          </Box>
        );
      }}
    />
  );
};
