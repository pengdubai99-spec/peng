"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Save, X } from "lucide-react";

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'checkbox';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface EntityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, any>;
  saveLabel?: string;
  cancelLabel?: string;
}

import { useState, useEffect } from "react";

export default function EntityModal({ open, onClose, onSave, title, fields, initialData, saveLabel = 'Save', cancelLabel = 'Cancel' }: EntityModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      setFormData(initialData || {});
    }
  }, [open, initialData]);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050510]/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0c0c1e] border border-white/10 rounded-[32px] p-10 shadow-3xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  {field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                      <input
                        type="checkbox"
                        checked={formData[field.key] || false}
                        onChange={(e) => handleChange(field.key, e.target.checked)}
                        className="w-4 h-4 accent-indigo-500"
                      />
                      <span className="text-sm font-bold text-slate-300">{field.label}</span>
                    </label>
                  ) : (
                    <>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.key] || ''}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all appearance-none"
                        >
                          <option value="" className="bg-[#0c0c1e]">--</option>
                          {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-[#0c0c1e]">{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={(e) => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}

              <div className="flex gap-4 mt-10">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-400 font-bold hover:bg-white/[0.05] transition-all"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-[2] py-4 px-10 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                >
                  <Save className="w-5 h-5" />
                  <span>{saveLabel}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
