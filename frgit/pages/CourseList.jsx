import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { Link } from "react-router-dom";

function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      const res = await axiosClient.get("/courses");
      setCourses(res.data);
    };
    loadCourses();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-lg">
        📚 Courses
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Link
            to={`/course/${course._id}`}
            key={course._id}
            className="bg-gray-800 border border-gray-700 shadow-xl rounded-2xl overflow-hidden 
                       hover:scale-[1.04] hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all duration-300"
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-5">
              <h2 className="text-2xl font-semibold">{course.title}</h2>
              <p className="text-gray-400 text-sm mt-2">
                {course.description.slice(0, 90)}...
              </p>

              <button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-medium transition-all"
              >
                Start Learning 🚀
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CourseList;
