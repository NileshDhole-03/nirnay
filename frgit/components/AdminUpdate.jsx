import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react'; // Make sure you have lucide-react or use a standard SVG

// --- Zod Schema ---
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function UpdateProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [serverHiddenCount, setServerHiddenCount] = useState(null); // Track what server sent

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [],
      referenceSolution: [],
      visibleTestCases: [],
      hiddenTestCases: []
    }
  });

  // Dynamic Fields
  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({ control, name: 'visibleTestCases' });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({ control, name: 'hiddenTestCases' });

  // --- Fetch Data ---
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axiosClient.get(`/problem/problemById/${id}`);
        
        // Check if server sent hidden cases or empty array
        const fetchedHidden = response.data.hiddenTestCases || [];
        setServerHiddenCount(fetchedHidden.length);

        const safeData = {
            ...response.data,
            startCode: response.data.startCode || [],
            referenceSolution: response.data.referenceSolution || [],
            visibleTestCases: response.data.visibleTestCases || [],
            hiddenTestCases: fetchedHidden,
        };

        reset(safeData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching problem:", error);
        alert('Failed to fetch problem details.');
        navigate('/admin/update');
      }
    };
    fetchProblem();
  }, [id, reset, navigate]);

  // --- Submit Update ---
  const onSubmit = async (data) => {
    // FINAL SAFETY CHECK
    if (serverHiddenCount === 0 && data.hiddenTestCases.length > 0) {
        const confirmSave = window.confirm(
            "⚠️ WARNING: The server previously sent 0 hidden test cases. " +
            "If there were old test cases, they might be overwritten. Are you sure you want to proceed?"
        );
        if (!confirmSave) return;
    }

    try {
      // Clean IDs to prevent Mongoose conflicts
      const cleanData = {
          ...data,
          visibleTestCases: data.visibleTestCases.map(({ _id, ...rest }) => rest),
          hiddenTestCases: data.hiddenTestCases.map(({ _id, ...rest }) => rest),
          startCode: data.startCode.map(({ _id, ...rest }) => rest),
          referenceSolution: data.referenceSolution.map(({ _id, ...rest }) => rest),
      };

      await axiosClient.put(`/problem/update/${id}`, cleanData);
      
      alert('Problem updated successfully!');
      navigate('/admin/update'); 
    } catch (error) {
      console.error("Update Error:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Update Problem</h1>
      
      {/* 🚨 ADMIN WARNING BANNER 🚨 */}
      {serverHiddenCount === 0 && (
        <div className="alert alert-error shadow-lg mb-6">
          <AlertTriangle strokeWidth={2.5} />
          <div>
            <h3 className="font-bold">Warning: Hidden Test Cases Missing!</h3>
            <div className="text-sm">
              The server returned 0 hidden test cases. This usually means your 
              <strong> Backend Controller (getProblemById)</strong> is filtering them out.
              <br />
              If you click "Update" now, you might <strong>delete</strong> any existing hidden test cases in the database.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Title</span></label>
              <input {...register('title')} className={`input input-bordered ${errors.title && 'input-error'}`} />
              {errors.title && <span className="text-error">{errors.title.message}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Description</span></label>
              <textarea {...register('description')} className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`} />
              {errors.description && <span className="text-error">{errors.description.message}</span>}
            </div>

            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label"><span className="label-text">Difficulty</span></label>
                <select {...register('difficulty')} className="select select-bordered">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="form-control w-1/2">
                <label className="label"><span className="label-text">Tag</span></label>
                <select {...register('tags')} className="select select-bordered">
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases Section */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          
          {/* Visible Cases */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Visible Test Cases</h3>
              <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="btn btn-sm btn-primary">Add Visible Case</button>
            </div>
            {visibleFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button type="button" onClick={() => removeVisible(index)} className="btn btn-xs btn-error">Remove</button>
                </div>
                <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full" />
                <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
                <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="textarea textarea-bordered w-full" />
              </div>
            ))}
             {errors.visibleTestCases && <p className="text-error text-sm">{errors.visibleTestCases.message}</p>}
          </div>

          {/* Hidden Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Hidden Test Cases</h3>
              <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-sm btn-primary">Add Hidden Case</button>
            </div>
            {hiddenFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button type="button" onClick={() => removeHidden(index)} className="btn btn-xs btn-error">Remove</button>
                </div>
                <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full" />
                <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
              </div>
            ))}
             {errors.hiddenTestCases && <p className="text-error text-sm">{errors.hiddenTestCases.message}</p>}
          </div>
        </div>

        {/* Code Templates Section */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>
          <div className="space-y-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium badge badge-neutral">
                  {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                </h3>
                <div className="form-control">
                  <label className="label"><span className="label-text">Initial Code</span></label>
                  <div className="mockup-code bg-base-300 p-0 min-h-[150px]">
                    <textarea {...register(`startCode.${index}.initialCode`)} className="w-full h-full bg-transparent p-4 font-mono outline-none resize-y min-h-[150px]" />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Reference Solution</span></label>
                  <div className="mockup-code bg-base-300 p-0 min-h-[150px]">
                    <textarea {...register(`referenceSolution.${index}.completeCode`)} className="w-full h-full bg-transparent p-4 font-mono outline-none resize-y min-h-[150px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-warning w-full text-lg">Update Problem</button>
      </form>
    </div>
  );
}

export default UpdateProblem;