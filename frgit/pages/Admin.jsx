import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, Video, ArrowLeft } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom'; // Changed to react-router-dom for better web support

function Admin() {
  const location = useLocation();
  
  // Logic: Only show the Dashboard Grid if we are exactly at "/admin"
  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/';

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/10',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-error/10',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      color: 'btn-info', // Changed to info to distinguish from create
      bgColor: 'bg-info/10',
      route: '/admin/video'
    },
    {
      id: 'course',
      title: 'Add Course',
      description: 'Upload And Delete Course Materials',
      icon: Video,
      color: 'btn-primary',
      bgColor: 'bg-primary/10',
      route: '/admin/course'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        
        {/* --- HEADER SECTION --- */}
        {isDashboard ? (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-base-content mb-4">
              Admin Panel
            </h1>
            <p className="text-base-content/70 text-lg">
              Manage coding problems on your platform
            </p>
          </div>
        ) : (
          /* Show Back Button on sub-pages */
          <div className="mb-8">
            <NavLink to="/admin" className="btn btn-ghost gap-2">
              <ArrowLeft size={20} />
              Back to Dashboard
            </NavLink>
          </div>
        )}

        {/* --- DYNAMIC CONTENT SWITCHER --- */}
        
        {isDashboard ? (
          /* VIEW 1: The Dashboard Grid (Only visible on /admin) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {adminOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <NavLink 
                  key={option.id}
                  to={option.route}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer no-underline text-current"
                >
                  <div className="card-body items-center text-center p-8">
                    <div className={`${option.bgColor} p-4 rounded-full mb-4`}>
                      <IconComponent size={32} className="text-base-content" />
                    </div>
                    <h2 className="card-title text-xl mb-2">{option.title}</h2>
                    <p className="text-base-content/70 mb-6">{option.description}</p>
                    <div className="card-actions">
                      <button className={`btn ${option.color} btn-wide`}>
                        {option.title}
                      </button>
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: The Child Page (Visible on /admin/create, etc.) */
          <div className="bg-base-100 rounded-box shadow-xl p-6 min-h-[500px]">
            <Outlet />
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;