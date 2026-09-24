import { useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("security");

  // ---------------- PASSWORD ----------------

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  // Eye toggle state visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ---------------- DELETE ACCOUNT ----------------

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ---------------- PASSWORD HANDLERS ----------------

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = passwordData;

    if (!newPassword || !confirmPassword) {
      return toast.error("All fields are necessary");
    }

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setPasswordLoading(true);

    try {
      await axiosInstance.patch("/users/change-password", {
        newPassword,
        confirmPassword,
      });

      toast.success("Password changed successfully!");

      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Change password error:", err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ---------------- DELETE ACCOUNT ----------------

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    try {
      await axiosInstance.delete("/users/delete-account");

      toast.success("Account deleted successfully");

      setShowDeleteModal(false);

      window.location.href = "/signin";
    } catch (err) {
      console.error("Delete account error:", err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to delete account"
      );

      setDeleteLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto py-10 sm:py-12 px-4">
      

      {/* ================= HEADER ================= */}

      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>

        <p className="text-sm font-medium text-slate-500 mt-1">
          Manage your security and account
        </p>
      </div>

      {/* ================= TABS ================= */}

      <div className="mb-6 border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">

          {/* Security Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`shrink-0 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "security"
                ? "text-indigo-600 border-indigo-600"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            <i className="fi fi-rr-lock mr-2" />
            Security
          </button>

          {/* Danger Zone Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("danger")}
            className={`shrink-0 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "danger"
                ? "text-rose-600 border-rose-600"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            <i className="fi fi-rr-trash mr-2" />
            Danger Zone
          </button>
        </div>
      </div>

      {/* ================= SECURITY TAB ================= */}

      {activeTab === "security" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">

          <div className="max-w-xl">

            <div className="mb-8">

              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <i className="fi fi-rr-lock text-indigo-600 text-lg" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Update Password
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Create a new password for your account.
              </p>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="space-y-5"
            >

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New Password
                </label>

                <div className="relative">

                  <i className="fi fi-rr-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />

                  <input
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    disabled={passwordLoading}
                    placeholder="Enter new password"
                    className="w-full pl-11 pr-11 py-3 rounded-xl text-sm font-semibold outline-none transition-all border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900 shadow-sm disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <i
                      className={`fi ${
                        showNewPassword ? "fi-rr-eye-crossed" : "fi-rr-eye"
                      } text-base`}
                    />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>

                <div className="relative">

                  <i className="fi fi-rr-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />

                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={passwordLoading}
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-11 py-3 rounded-xl text-sm font-semibold outline-none transition-all border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900 shadow-sm disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <i
                      className={`fi ${
                        showConfirmPassword ? "fi-rr-eye-crossed" : "fi-rr-eye"
                      } text-base`}
                    />
                  </button>
                </div>
              </div>

              {/* Update Password Button */}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <>
                    <i className="fi fi-rr-spinner animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ================= DANGER ZONE TAB ================= */}

      {activeTab === "danger" && (
        <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-10 shadow-sm">

          <div className="max-w-xl">

            <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
              <i className="fi fi-rr-trash text-rose-600 text-lg" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Delete Account
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Permanently delete your PulseBlog account and all
              associated data.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100">

              <p className="text-sm font-semibold text-slate-800 mb-2">
                The following will be permanently deleted:
              </p>

              <ul className="text-sm text-slate-600 space-y-1.5">
                <li>• Your account</li>
                <li>• Your posts</li>
                <li>• Your likes</li>
                <li>• Your comments</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="mt-6 w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6 overflow-y-auto">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mb-5">
              <i className="fi fi-rr-trash text-rose-600 text-xl" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Delete your account?
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              This will permanently delete your account, posts,
              likes, and comments.
            </p>

            <p className="text-sm font-semibold text-rose-600 mt-3">
              This action cannot be undone.
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-7">

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleteLoading ? (
                  <>
                    <i className="fi fi-rr-spinner animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>

            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SettingsPage;