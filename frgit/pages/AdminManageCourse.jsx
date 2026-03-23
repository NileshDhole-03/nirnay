import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useParams, Link } from "react-router-dom";

function AdminManageCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await axiosClient.get(`/courses/${id}`);
      setCourse(res.data);
    };
    load();
  }, [id]);

  const addModule = async () => {
    await axiosClient.post(`/courses/${id}/module`, { title: moduleTitle });
    window.location.reload();
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{course.title}</h1>

      <div className="mt-4 flex">
        <input className="border p-2 rounded w-60 mr-3"
          placeholder="New Module Title" onChange={(e) => setModuleTitle(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={addModule}>
          Add Module
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {course.modules?.map((m) => (
          <div key={m._id} className="bg-white p-4 shadow rounded">
            <div className="flex justify-between">
              <h3 className="font-semibold">{m.title}</h3>
              <Link to={`/admin/course/${id}/module/${m._id}/lesson`} className="text-blue-600">
                + Add Lesson
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default AdminManageCourse;
