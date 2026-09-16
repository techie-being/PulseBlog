import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    type = "danger" // danger, primary, warning
}) => {
    const theme = {
        danger: "bg-red-500 hover:bg-red-600 focus:ring-red-500/50",
        primary: "bg-black hover:bg-opacity-80 focus:ring-black/50",
        warning: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500/50",
    };

    return (
        /* AnimatePresence requires children to stay mounted during exit animation */
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal Content Container */}
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative bg-white dark:bg-gray-900 w-full max-w-sm sm:max-w-md rounded-2xl p-5 sm:p-8 shadow-2xl overflow-hidden my-auto"
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon Container */}
                            <div 
                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6 shrink-0 ${
                                    type === 'danger' 
                                        ? 'bg-red-50 dark:bg-red-950/30' 
                                        : type === 'warning'
                                        ? 'bg-yellow-50 dark:bg-yellow-950/30'
                                        : 'bg-grey'
                                }`}
                            >
                                <i 
                                    className={`fi ${
                                        type === 'danger' 
                                            ? 'fi-rr-trash text-red-500' 
                                            : type === 'warning'
                                            ? 'fi-rr-exclamation text-yellow-500'
                                            : 'fi-rr-info text-black dark:text-white'
                                    } text-xl sm:text-2xl`} 
                                />
                            </div>
                            
                            {/* Title & Message */}
                            <h2 className="text-xl sm:text-2xl font-inter font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white leading-snug">
                                {title}
                            </h2>
                            <p className="text-dark-grey text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed max-w-xs sm:max-w-none">
                                {message}
                            </p>

                            {/* Action Buttons - Stack on tiny mobile screens, row on sm+ */}
                            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-4 w-full">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 btn-light py-2.5 sm:py-3 text-sm sm:text-base rounded-xl transition-all active:scale-95 focus:outline-none"
                                >
                                    {cancelText}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-xl transition-all font-medium active:scale-95 focus:outline-none focus:ring-2 ${theme[type] || theme.danger}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;