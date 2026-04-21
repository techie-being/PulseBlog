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
    if (!isOpen) return null;

    const theme = {
        danger: "bg-red-500 hover:bg-red-600",
        primary: "bg-black hover:bg-opacity-80",
        warning: "bg-yellow-500 hover:bg-yellow-600",
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl overflow-hidden"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50' : 'bg-grey'}`}>
                            <i className={`fi ${type === 'danger' ? 'fi-rr-trash text-red-500' : 'fi-rr-info text-black'} text-2xl`} />
                        </div>
                        
                        <h2 className="text-2xl font-inter font-bold mb-3">{title}</h2>
                        <p className="text-dark-grey mb-8">{message}</p>

                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={onClose}
                                className="flex-1 btn-light py-3 rounded-xl transition-all"
                            >
                                {cancelText}
                            </button>
                            <button 
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 text-white py-3 rounded-xl transition-all font-medium ${theme[type]}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
