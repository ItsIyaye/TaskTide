"use client";
import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "regenerator-runtime/runtime";

export type TaskType = {
  id: string;
  title: string;
  description: string;
  time: string;
  tag: string;
  date: string;
  reminderTime?: string;
  repeatType?: "none" | "daily" | "weekly" | "monthly";
  repeatDays?: string[]; // for daily repeat (e.g. ["Mon", "Wed"])
  soundUrl?: string;
};

type Props = {
  onClose: () => void;
  onSave: (task: TaskType) => void;
  initialData?: TaskType | null;
};

const defaultSound = "/sounds/dun-dun-dun.mp3"; // ✅ Default sound path (must be in public folder)

export default function TaskModal({ onClose, onSave, initialData }: Props) {
  const [task, setTask] = useState<TaskType>(
    initialData || {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      time: "06:00",
      tag: "Work",
      date: new Date().toISOString().split("T")[0],
      reminderTime: "",
      repeatType: "none",
      repeatDays: [],
      soundUrl: "",
    }
  );

  const [activeField, setActiveField] = useState<"title" | "description" | null>(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (initialData) {
      setTask(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!activeField) return;
    setTask((prev) => ({ ...prev, [activeField]: transcript }));
  }, [transcript, activeField]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name === "repeatDays") {
      const day = value;
      setTask((prev) => {
        const days = prev.repeatDays || [];
        return {
          ...prev,
          repeatDays: days.includes(day)
            ? days.filter((d) => d !== day)
            : [...days, day],
        };
      });
    } else {
      setTask((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSpeechToggle = (field: "title" | "description") => {
    if (listening && activeField === field) {
      SpeechRecognition.stopListening();
      setActiveField(null);
    } else {
      resetTranscript();
      setActiveField(field);
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTask((prev) => ({ ...prev, soundUrl: url }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task);

    if (task.reminderTime) {
      const reminderDate = new Date(task.reminderTime);
      const now = new Date();
      const timeout = reminderDate.getTime() - now.getTime();

      if (timeout > 0 && timeout < 2147483647) {
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification(`🔔 ${task.title}`, {
              body: task.description || "You have a reminder!",
            });

            const sound = new Audio(task.soundUrl || defaultSound);
            sound.play().catch(console.error);
          }
        }, timeout);
      }
    }

    onClose();
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{initialData ? "Edit Task" : "New Task"}</h2>

        {/* Title */}
        <div className="relative mb-2">
          <input
            name="title"
            value={task.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border px-3 py-2 rounded pr-20"
            required
          />
          <button
            type="button"
            onClick={() => handleSpeechToggle("title")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            {listening && activeField === "title" ? "Stop 🎙" : "Speak 🎤"}
          </button>
        </div>

        {/* Description */}
        <div className="relative mb-2">
          <input
            name="description"
            value={task.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border px-3 py-2 rounded pr-20"
          />
          <button
            type="button"
            onClick={() => handleSpeechToggle("description")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            {listening && activeField === "description" ? "Stop 🎙" : "Speak 🎤"}
          </button>
        </div>

        {/* Task Time */}
        <label className="block text-sm font-medium mb-1">Task Time</label>
        <input
          name="time"
          value={task.time}
          onChange={handleChange}
          type="time"
          className="w-full border px-3 py-2 rounded mb-2"
        />

        {/* Tag */}
        <select
          name="tag"
          value={task.tag}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mb-2"
        >
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>

        {/* Date */}
        <input
          name="date"
          value={task.date}
          onChange={handleChange}
          type="date"
          className="w-full border px-3 py-2 rounded mb-2"
        />

        {/* Reminder Time */}
        <label className="block text-sm font-medium mb-1">Reminder Time</label>
        <input
          name="reminderTime"
          value={task.reminderTime || ""}
          onChange={handleChange}
          type="datetime-local"
          className="w-full border px-3 py-2 rounded mb-4"
        />

        {/* Notification Sound
        <label className="block text-sm font-medium mb-1">Notification Sound</label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleSoundUpload}
          className="w-full border px-3 py-2 rounded mb-4"
        /> */} 

        {/* 🔔 Custom Sound Upload */}
<label className="block text-sm font-medium mb-1">Notification Sound</label>
<div className="flex items-center gap-3 mb-4">
  <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
    Choose File
    <input
      type="file"
      accept="audio/*"
      onChange={handleSoundUpload}
      className="hidden"
    />
  </label>
  <span className="text-sm text-gray-700 truncate max-w-[200px]">
    {task.soundUrl ? task.soundUrl.split("/").pop() : "No file chosen"}
  </span>
</div>

        {/* Repeat Type */}
        <label className="block text-sm font-medium mb-1">Repeat</label>
        <select
          name="repeatType"
          value={task.repeatType || "none"}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mb-2"
        >
          <option value="none">No Repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        {/* Daily repeat days (if selected) */}
        {task.repeatType === "daily" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {weekDays.map((day) => (
              <label key={day} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  name="repeatDays"
                  value={day}
                  checked={task.repeatDays?.includes(day)}
                  onChange={handleChange}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 px-4 py-2 rounded text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
