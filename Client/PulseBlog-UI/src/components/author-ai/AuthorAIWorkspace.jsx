
const AuthorAIWorkspace = ({
    onPolish,
    onAssets,
    loading
}) => {
    return (
        <aside className="rounded-2xl border bg-white p-6 shadow-sm mt-8">

            <h3 className="text-xl font-bold mb-2">
                ✨ AI Assistant
            </h3>

             <p className="text-sm text-gray-500 mb-6">
                Improve your article before publishing.
             </p>

            <div className="grid md:grid-cols-2 gap-4">
                <button >
                    ✨ Polish Draft
                </button>

                <button>
            🚀      Generate Assets
                </button>

            </div>

        </aside>
    );
};

export default AuthorAIWorkspace;