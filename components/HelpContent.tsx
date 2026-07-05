"use client";

import { FormEvent, useState } from "react";
import { FEEDBACK_STORAGE_KEY, PROBLEM_REPORTS_STORAGE_KEY } from "@/lib/appStorage";

const faqItems = [
  {
    question: "Can I use MangystauTrails without location?",
    answer: "Yes. Nearby sorting becomes approximate, while guides, hotels, routes and offline packs remain available.",
  },
  {
    question: "How do offline guides work?",
    answer: "Saved offline items are kept on this device as compact route, guide and map-pack records.",
  },
  {
    question: "Are remote routes safe for solo driving?",
    answer: "Remote desert tracks should be planned with local drivers, daylight buffers, water reserves and offline maps.",
  },
  {
    question: "Where do saved hotels and routes appear?",
    answer: "Saved items appear in the Saved page and remain available until browser storage is cleared.",
  },
  {
    question: "Can I change language manually?",
    answer: "Yes. Settings supports automatic detection and manual Kazakh, Russian or English selection.",
  },
];

export default function HelpContent() {
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [problemCategory, setProblemCategory] = useState("Bug");
  const [problemDescription, setProblemDescription] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [status, setStatus] = useState("");

  const sendFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = feedbackEmail.trim().toLowerCase();
    const subject = feedbackSubject.trim();
    const message = feedbackMessage.trim();

    if (!emailPattern.test(email)) {
      setStatus("Please enter a valid email address.");
      return;
    }

    if (!subject || !message) {
      setStatus("Email, subject and message are required.");
      return;
    }

    saveLocalRecord(FEEDBACK_STORAGE_KEY, {
      id: createLocalId(),
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    });

    setFeedbackEmail("");
    setFeedbackSubject("");
    setFeedbackMessage("");
    setStatus("Thanks! Your feedback has been saved.");
  };

  const reportProblem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveLocalRecord(PROBLEM_REPORTS_STORAGE_KEY, {
      id: createLocalId(),
      category: problemCategory,
      description: problemDescription.trim(),
      screenshotName: screenshotName || null,
      createdAt: new Date().toISOString(),
    });
    setStatus(
      screenshotName
        ? `Report saved locally: ${problemCategory} / ${screenshotName}`
        : `Report saved locally: ${problemCategory}`
    );
    setProblemDescription("");
    setScreenshotName("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="glass-card space-y-3 p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-white/40">FAQ</p>
        {faqItems.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/66 open:bg-white/7"
          >
            <summary className="cursor-pointer list-none font-semibold text-white">{item.question}</summary>
            <p className="mt-3">{item.answer}</p>
          </details>
        ))}
      </section>

      <div className="grid gap-4">
        {status ? (
          <p aria-live="polite" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/66">
            {status}
          </p>
        ) : null}

        <form onSubmit={sendFeedback} className="glass-card space-y-4 p-4 md:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Contact & Feedback</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Send feedback</h2>
            </div>
          </div>
          <label className="grid gap-2">
            <span className="text-sm text-white/58">Email / Gmail</span>
            <input
              type="email"
              required
              value={feedbackEmail}
              onChange={(event) => setFeedbackEmail(event.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
              placeholder="you@gmail.com"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/58">Subject</span>
            <input
              required
              value={feedbackSubject}
              onChange={(event) => setFeedbackSubject(event.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
              placeholder="Route, hotel, account..."
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/58">Message</span>
            <textarea
              value={feedbackMessage}
              onChange={(event) => setFeedbackMessage(event.target.value)}
              required
              rows={4}
              className="resize-none rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
              placeholder="Write your message"
            />
          </label>
          <button type="submit" className="btn chat-button w-full justify-center">
            Send
          </button>
        </form>

        <form onSubmit={reportProblem} className="glass-card space-y-4 p-4 md:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Report a Problem</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Problem report</h2>
          </div>
          <label className="grid gap-2">
            <span className="text-sm text-white/58">Category</span>
            <select
              value={problemCategory}
              onChange={(event) => setProblemCategory(event.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
            >
              <option>Bug</option>
              <option>Wrong information</option>
              <option>Map issue</option>
              <option>Auth issue</option>
              <option>Other</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/58">Description</span>
            <textarea
              value={problemDescription}
              onChange={(event) => setProblemDescription(event.target.value)}
              required
              rows={4}
              className="resize-none rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
              placeholder="What happened?"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/58">Optional screenshot</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setScreenshotName(event.target.files?.[0]?.name ?? "")}
              className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
            />
          </label>
          <button type="submit" className="btn chat-button w-full justify-center">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function saveLocalRecord(key: string, record: Record<string, unknown>) {
  const records = readLocalRecords(key);
  window.localStorage.setItem(key, JSON.stringify([record, ...records].slice(0, 50)));
}

function readLocalRecords(key: string) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
