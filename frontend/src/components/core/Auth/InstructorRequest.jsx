import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiConnector } from "../../../services/apiConnector";
import { profileEndpoints } from "../../../services/apis";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];

export default function InstructorRequest() {
    const { user } = useSelector((state) => state.profile);
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
        qualifications: "",
        experience: "",
    });
    const [files, setFiles] = useState([]); // array of File objects (CV, certificates, etc.)
    const [fileError, setFileError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.additionalDetails?.contactNumber || "",
                bio: user.additionalDetails?.about || "",
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        setFileError("");

        const tooBig = selected.find(
            (f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024
        );
        if (tooBig) {
            setFileError(`"${tooBig.name}" vượt quá ${MAX_FILE_SIZE_MB}MB`);
            e.target.value = "";
            return;
        }

        const invalidType = selected.find(
            (f) => !ACCEPTED_TYPES.some((ext) => f.name.toLowerCase().endsWith(ext))
        );
        if (invalidType) {
            setFileError(
                `"${invalidType.name}" không đúng định dạng cho phép (PDF, JPG, PNG)`
            );
            e.target.value = "";
            return;
        }

        // merge with existing selection, avoid exact duplicates by name+size
        setFiles((prev) => {
            const merged = [...prev];
            selected.forEach((f) => {
                const exists = merged.some(
                    (m) => m.name === f.name && m.size === f.size
                );
                if (!exists) merged.push(f);
            });
            return merged;
        });

        e.target.value = ""; // allow re-selecting the same file later
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Please log in first");
            return;
        }

        if (files.length === 0) {
            setFileError("Vui lòng đính kèm ít nhất 1 tài liệu xác thực (CV, chứng chỉ...)");
            return;
        }

        setLoading(true);
        try {
            const payload = new FormData();
            payload.append("firstName", formData.firstName);
            payload.append("lastName", formData.lastName);
            payload.append("email", formData.email);
            payload.append("phone", formData.phone);
            payload.append("bio", formData.bio);
            payload.append("qualifications", formData.qualifications);
            payload.append("experience", formData.experience);
            files.forEach((file) => payload.append("documents", file));

            const response = await apiConnector(
                "POST",
                profileEndpoints.REQUEST_INSTRUCTOR_API,
                payload,
                {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            );

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || "Failed to submit request");
            }

            toast.success("Your instructor request has been submitted successfully");
            navigate("/dashboard/my-profile");
        } catch (error) {
            toast.error(error.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-richblack-900 px-4 py-10 text-richblack-5">
            <div className="mx-auto max-w-3xl rounded-2xl border border-richblack-700 bg-richblack-800 p-8 shadow-2xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-50">
                        Become an Instructor
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Submit Your Instructor Application
                    </h1>

                    <p className="mt-3 text-sm text-richblack-300">
                        Please complete the form below with your personal information,
                        qualifications, and teaching experience. Our team will review your
                        application and notify you of the result.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm text-richblack-300">
                                First Name
                            </label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-richblack-300">
                                Last Name
                            </label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm text-richblack-300">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-richblack-300">
                                Phone Number
                            </label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-richblack-300">
                            About Yourself
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none"
                            placeholder="Introduce yourself and explain why you want to become an instructor."
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-richblack-300">
                            Qualifications / Certifications
                        </label>
                        <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleChange}
                            rows="4"
                            className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none"
                            placeholder="Example: Bachelor's Degree in Computer Science, Google UX Design Certificate..."
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-richblack-300">
                            Teaching / Professional Experience
                        </label>
                        <textarea
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            rows="4"
                            className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none"
                            placeholder="Describe your teaching experience or relevant professional background."
                        />
                    </div>

                    {/* --- File upload: verification documents (CV, certificates, ID, etc.) --- */}
                    <div>
                        <label className="mb-2 block text-sm text-richblack-300">
                            Verification Documents (CV, Certificates...)
                        </label>

                        <label
                            htmlFor="documents"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-richblack-600 bg-richblack-900 px-4 py-6 text-center transition hover:border-yellow-50"
                        >
                            <span className="text-sm text-richblack-300">
                                Click to upload PDF, JPG or PNG — max {MAX_FILE_SIZE_MB}MB each
                            </span>
                            <input
                                id="documents"
                                type="file"
                                multiple
                                accept={ACCEPTED_TYPES.join(",")}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>

                        {fileError && (
                            <p className="mt-2 text-sm text-pink-200">{fileError}</p>
                        )}

                        {files.length > 0 && (
                            <ul className="mt-3 space-y-2">
                                {files.map((file, index) => (
                                    <li
                                        key={`${file.name}-${file.size}-${index}`}
                                        className="flex items-center justify-between rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-2 text-sm"
                                    >
                                        <span className="truncate text-richblack-100">
                                            {file.name}{" "}
                                            <span className="text-richblack-400">
                                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="ml-3 shrink-0 text-richblack-300 hover:text-pink-200"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-richblack-900 transition hover:bg-yellow-400 disabled:opacity-70"
                        >
                            {loading ? "Submitting..." : "Submit Application"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/my-profile")}
                            className="rounded-lg border border-richblack-600 px-5 py-3 text-sm text-richblack-300 hover:bg-richblack-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}