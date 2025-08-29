'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GptPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(''); // Clear previous response

    try {
      const res = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err: unknown) {
       if (err instanceof Error) {
        setError(`İstek gönderilirken bir hata oluştu: ${err.message}`);
       } else {
         setError('Bilinmeyen bir hata oluştu.');
       }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">GPT Deneme Sayfası</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-lg mb-8">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Promptunuzu buraya girin..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`mt-3 w-full px-4 py-2 text-white font-semibold rounded-md shadow ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition duration-200 ease-in-out`}
          disabled={isLoading}
        >
          {isLoading ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <AnimatePresence>
        {response && (
          <motion.div
            key={response} // Ensure animation triggers on new response
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }} // Optional: animate out
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-lg p-4 bg-white border border-gray-200 rounded-md shadow-md"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Gelen Cevap:</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{response}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 