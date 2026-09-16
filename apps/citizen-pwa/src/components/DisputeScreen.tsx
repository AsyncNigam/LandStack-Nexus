import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, FileText, Send } from "lucide-react";

interface DisputeScreenProps {
  ulpin: string;
  onBack: () => void;
  onSubmit: () => void;
}

export default function DisputeScreen({ ulpin, onBack, onSubmit }: DisputeScreenProps) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Dispute filed successfully for ULPIN: ${ulpin}. Tracking ID: TRK-${Math.floor(Math.random() * 100000)}`);
      onSubmit();
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50 pb-10">
      {/* ── Header ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between px-5 pt-10 pb-4 border-b border-gray-100 bg-white"
      >
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-bold text-gray-800">
          File Dispute
        </span>
        <div className="w-9" />
      </motion.div>

      {/* ── Content ───────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 mt-6 flex-1"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-6">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Target Parcel</p>
            <p className="font-mono text-sm font-bold text-blue-900 mt-0.5">{ulpin}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dispute Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" disabled>Select category...</option>
              <option value="ownership">Ownership Name Mismatch</option>
              <option value="area">Parcel Area Discrepancy</option>
              <option value="boundary">Boundary / Encroachment Issue</option>
              <option value="tax">Tax Record Error</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Evidence Attachment</label>
            <div className="flex items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center">
                <FileText size={20} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-medium">Tap to upload documents</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !category || !description.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] hover:bg-blue-700 disabled:opacity-50 disabled:active:scale-100"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Send size={18} />
                  Submit Dispute
                </>
              )}
            </button>
            <p className="text-center mt-3 text-[10px] text-gray-400 leading-relaxed">
              By submitting this form, you affirm that the information provided is accurate under the penalty of perjury.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
