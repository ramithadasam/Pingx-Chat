import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  description, 
  confirmText = "Yes", 
  cancelText = "No", 
  onConfirm, 
  onCancel,
  isDanger = true
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onCancel}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-[24px] p-6 w-full max-w-sm pointer-events-auto"
            >
              <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
              <p className="text-[rgba(255,255,255,0.7)] mb-6">{description}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-full font-medium text-white bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-3 rounded-full font-medium text-[#050505] transition-colors ${
                    isDanger ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]' : 'bg-[#C6FF3B] hover:bg-[#b0eb2d]'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
