import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { Edit } from 'lucide-react';
//import { getProblemById } from '../../../backend/src/controllers/userProblem';

function AdminUpdateList() {
    const [problems, setProblems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all problems for the list
        axiosClient.get('/problem/getAllproblem')
            .then((res) => setProblems(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6">Select a Problem to Update</h2>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th>Tags</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map((problem) => (
                            <tr key={problem._id} className="hover">
                                <td className="font-bold">{problem.title}</td>
                                <td>
                                    <span className={`badge ${problem.difficulty === 'easy' ? 'badge-success' :
                                            problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                </td>
                                <td>{problem.tags}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-info gap-2"
                                        onClick={() => navigate(`/admin/update/${problem._id}`)} // Navigate to the specific update page
                                    >
                                        <Edit size={16} /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUpdateList;