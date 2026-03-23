import { useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import CloudinaryUpload from "../components/CloudinaryUpload";

 function AdminAddLesson() {
  const { courseId, moduleId } = useParams();
  const [form, setForm] = useState({ title: "", videoUrl: "" });

  const submit = async (e) => {
    e.preventDefault();
    await axiosClient.post(`/courses/${courseId}/module/${moduleId}/lesson`, form);
    alert("Lesson added");
  };

  return (
    <div className="p-6">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-4 max-w-xl">
        <h2 className="text-xl font-bold">Add Lesson</h2>

        <input className="w-full border p-2 rounded" placeholder="Lesson Title"
          onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <input className="w-full border p-2 rounded" placeholder="YouTube URL"
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />

        <CloudinaryUpload onUpload={(url) => setForm({ ...form, videoUrl: url })} />

        <button className="bg-green-600 text-white w-full py-2 rounded">Add Lesson</button>
      </form>
    </div>
  );
}
export default AdminAddLesson;