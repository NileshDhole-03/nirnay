import { useState } from "react";
import axiosClient from "../utils/axiosClient";

function AdminAddCourse() {
  const [form, setForm] = useState({ title: "", description: "", thumbnail: "" });

  const submit = async (e) => {
    e.preventDefault();
    await axiosClient.post("/yt/ytcreate", form);
    alert("Course created!");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-8">
      <form
        onSubmit={submit}
        className="bg-[#1e293b] border border-[#334155] p-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-5 transition-all duration-300 hover:shadow-blue-700/30"
      >
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Add New Course
        </h2>

        <input
          className="w-full bg-[#0f172a] border border-gray-600 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Course Title"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full bg-[#0f172a] border border-gray-600 p-3 rounded-xl min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Course Description"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          className="w-full bg-[#0f172a] border border-gray-600 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Thumbnail Image URL"
          onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
        />

        <button
          className="w-full bg-blue-600 py-3 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/30"
        >
          Create Course
        </button>
      </form>
    </div>
  );
}

export default AdminAddCourse;
