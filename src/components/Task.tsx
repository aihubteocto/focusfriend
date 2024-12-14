import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CheckCircle } from "lucide-react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now(), text: newTask.trim(), completed: false },
      ]);
      setNewTask("");
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="w-full max-w-md p-6 bg-secondary rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-primary mb-4">Tasks</h2>
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <Input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button type="submit" className="bg-primary hover:bg-primary-hover">
          <Plus className="w-5 h-5" />
        </Button>
      </form>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded-full border ${
                  task.completed
                    ? "bg-primary border-primary"
                    : "border-gray-300"
                } flex items-center justify-center`}
              >
                {task.completed && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </button>
              <span
                className={`${
                  task.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {task.text}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};