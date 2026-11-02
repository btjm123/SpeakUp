"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const resetField = () => {
    setEmail("");
    setMessage("");
    setSubject("");
    setName("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_wziq1r3",
        "template_5z514ui",
        e.target as HTMLFormElement,
        "wH0cTcKyXxGeyTsgQ"
      )
      .then(() => {
        alert("Email sent successfully!");
      })
      .catch((error) => {
        alert(String(error));
      });

    resetField();
    e.currentTarget.reset();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 sm:px-8">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Contact Us</h1>
        <p className="text-center text-slate-600 mb-8">
          For any bug reports or feedback, please send us an email here!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white py-2.5 rounded-lg font-semibold shadow-sm hover:brightness-105 transition-all"
          >
            Send Message
          </button>
        </form>

        {/* 👇 Back to Home button styled consistently */}
        <Link
          to="/"
          className="block text-center w-full mt-4 py-2.5 rounded-lg font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default ContactForm;
