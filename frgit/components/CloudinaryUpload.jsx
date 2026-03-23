import { useState } from "react";

export default function CloudinaryUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);

  const openWidget = () => {
    setUploading(true);
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "YOUR_CLOUD_NAME",
        uploadPreset: "YOUR_PRESET",
        resourceType: "video"
      },
      (err, result) => {
        if (!err && result?.event === "success") {
          onUpload(result.info.secure_url);
          setUploading(false);
        }
      }
    );
    widget.open();
  };

  return (
    <button type="button"
      onClick={openWidget}
      className="bg-purple-600 text-white py-2 px-4 rounded w-full">
      {uploading ? "Uploading..." : "Upload Video (Cloudinary)"}
    </button>
  );
}
