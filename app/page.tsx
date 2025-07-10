
//First MODEL


"use client";
import React, { useState, useEffect } from "react";
import TaskModal, { TaskType } from "./Component/TaskModal";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [taskToEdit, setTaskToEdit] = useState<TaskType | null>(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState<TaskType | null>(null);
  const [view, setView] = useState<'today' | 'calendar'>('today');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleSaveTask = (task: TaskType) => {
    setTasks((prev) => {
      const existing = prev.find((t) => t.id === task.id);
      if (existing) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      return [...prev, task];
    });
    setTaskToEdit(null);
    setSelectedDate(null);
  };

  const handleDeleteTask = (id: string) => {
    const toDelete = tasks.find((t) => t.id === id);
    if (toDelete) {
      setRecentlyDeleted(toDelete);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
  };

  const handleUndoDelete = () => {
    if (recentlyDeleted) {
      setTasks((prev) => [...prev, recentlyDeleted]);
      setRecentlyDeleted(null);
    }
  };

  const openNewTaskModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: TaskType) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const today = new Date().toISOString().split("T")[0];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const handleMonthChange = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const filteredTasks = tasks.filter((task) => {
  const matchesSearch = searchTerm
    ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    : true;

  const matchesTag = tagFilter ? task.tag === tagFilter : true;

  const matchesDate = view === 'today' && !searchTerm && !tagFilter
    ? task.date === today
    : true;

  return matchesSearch && matchesTag && matchesDate;
});


  return (
    <div className="flex">
      <aside className={`fixed top-0 left-0 min-h-screen w-64 bg-gray-800 text-white p-4 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 md:block`}>
        <div className="flex justify-between items-center mb-6 md:block">
          <h1 className="text-2xl font-bold">TaskTide</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav>
          <ul className="space-y-4">
            <li><button onClick={() => setView('today')} className="w-full text-left">Dashboard</button></li>
            <li><button onClick={() => setView('calendar')} className="w-full text-left">Calendar</button></li>
          </ul>
        </nav>
      </aside>

      <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-xl fixed top-4 left-4  rounded z-10">☰</button>

      <main className="p-2 sm:p-4 md:ml-64 w-full mt-16 md:mt-0">
        {view === 'today' && (
          <div>
           <h2 className="text-xl font-bold mb-4">Today’s Tasks</h2>

<div className="flex flex-col sm:flex-row gap-4 mb-2">
  <input
    type="text"
    placeholder="Search tasks..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="border px-3 py-2 rounded w-full max-w-md"
  />
  <select
    value={tagFilter}
    onChange={(e) => setTagFilter(e.target.value)}
    className="border px-3 py-2 rounded w-full sm:w-auto"
  >
    <option value="">All Tags</option>
    <option value="Work">Work</option>
    <option value="Personal">Personal</option>
  </select>
</div>

<div className="mb-4">
  <button
    onClick={openNewTaskModal}
    className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
  >
    + Add Task
  </button>
</div>


            {recentlyDeleted && (
              <button onClick={handleUndoDelete} className="bg-yellow-500 text-white px-4 py-2 rounded mb-4">
                Undo 
              </button>
            )}

            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="border p-4 rounded shadow bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{task.title}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <p className="text-sm">{task.time} • {task.tag}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditTaskModal(task)} className="text-white bg-blue-600 p-2 rounded-md">Edit</button>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-white bg-red-600 p-2 rounded-md">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 mb-4">
              <h2 className="text-xl font-bold">
                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => handleMonthChange(-1)} className="bg-gray-300 px-3 py-1 rounded">Previous</button>
                <button onClick={() => handleMonthChange(1)} className="bg-gray-300 px-3 py-1 rounded">Next</button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center font-semibold mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
              {getDaysInMonth(currentMonth).map((day) => {
                const dateStr = day.toISOString().split("T")[0];
                const dayTasks = tasks.filter(task => task.date === dateStr);
                const isToday = dateStr === today;

                return (
                  <div
                    key={dateStr}
                    className={`border rounded p-1 sm:p-2 min-h-[80px] sm:min-h-[100px] cursor-pointer flex flex-col gap-1 items-start ${isToday ? 'bg-yellow-100' : 'bg-white'}`}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setTaskToEdit(null);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="font-bold text-sm">{day.getDate()}</div>
                    {/* {dayTasks.map((task) => (
                      <div key={task.id} className="text-[10px] sm:text-xs mt-1 px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate w-full">
                        {task.title}
                      </div>
                    ))} */}
                    {dayTasks.map((task) => (
  <button
    key={task.id}
    onClick={(e) => {
      e.stopPropagation(); // Prevent parent day click
      openEditTaskModal(task);
    }}
    className="text-[10px] sm:text-xs mt-1 px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate w-full text-left hover:bg-blue-200"
  >
    {task.title}
  </button>
))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <TaskModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
          onSave={handleSaveTask}
          initialData={taskToEdit || (selectedDate ? { id: '', title: '', description: '', time: '6 AM', tag: 'Work', date: selectedDate } : null)}
        />
      )}
    </div>
  );
}











