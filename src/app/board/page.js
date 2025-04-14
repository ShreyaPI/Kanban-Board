"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

export default function BoardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [columns, setColumns] = useState([]);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newTasks, setNewTasks] = useState({});

  // Fetch user and subscribe to columns
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
        const columnsRef = collection(db, "boards", currentUser.uid, "columns");
        const q = query(columnsRef, orderBy("createdAt", "asc"));

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const updatedCols = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setColumns(updatedCols);
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // Add new column
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || !user) return;

    const newColumn = {
      title: newColumnTitle,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "boards", user.uid, "columns"), newColumn);
      setNewColumnTitle("");
    } catch (error) {
      console.error("Error adding column:", error.message);
    }
  };

  // Add task under a column
  const handleAddTask = async (columnId) => {
    const taskText = newTasks[columnId];
    if (!taskText?.trim()) return;

    try {
      await addDoc(
        collection(db, "boards", user.uid, "columns", columnId, "tasks"),
        {
          text: taskText,
          createdAt: serverTimestamp(),
        }
      );
      setNewTasks((prev) => ({ ...prev, [columnId]: "" }));
    } catch (error) {
      console.error("Error adding task:", error.message);
    }
  };

  // Delete column and its tasks
  const handleDeleteColumn = async (columnId) => {
    if (!user) return;

    try {
      const tasksRef = collection(
        db,
        "boards",
        user.uid,
        "columns",
        columnId,
        "tasks"
      );
      const tasksSnapshot = await getDocs(tasksRef);
      for (const taskDoc of tasksSnapshot.docs) {
        await deleteDoc(
          doc(db, "boards", user.uid, "columns", columnId, "tasks", taskDoc.id)
        );
      }

      await deleteDoc(doc(db, "boards", user.uid, "columns", columnId));
    } catch (error) {
      console.error("Error deleting column:", error.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100 text-gray-900">
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/background.jpg')" }}
      ></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Kanban Board</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="Enter column title"
            className="border p-2 rounded w-64 bg-white text-black"
          />
          <button
            onClick={handleAddColumn}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Column
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto">
          {columns.length === 0 && (
            <p className="text-gray-500">No columns yet. Add one above!</p>
          )}
          {columns.map((column) => (
            <ColumnCard
              key={column.id}
              column={column}
              user={user}
              newTasks={newTasks}
              setNewTasks={setNewTasks}
              handleAddTask={handleAddTask}
              handleDeleteColumn={handleDeleteColumn}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function ColumnCard({
  column,
  user,
  newTasks,
  setNewTasks,
  handleAddTask,
  handleDeleteColumn,
}) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user || !column.id) return;

    const q = query(
      collection(db, "boards", user.uid, "columns", column.id, "tasks"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskList);
    });

    return () => unsubscribe();
  }, [user, column.id]);

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(
        doc(db, "boards", user.uid, "columns", column.id, "tasks", taskId)
      );
    } catch (error) {
      console.error("Error deleting task:", error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-72 shrink-0 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{column.title}</h2>
        <button
          onClick={() => handleDeleteColumn(column.id)}
          className="text-red-500 hover:text-red-700 text-sm"
          title="Delete column"
        >
          ✕
        </button>
      </div>

      <ul className="space-y-2 mb-4">
        {tasks.length === 0 ? (
          <li className="text-gray-400 text-sm">No tasks yet</li>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              className="bg-gray-100 p-2 rounded text-sm text-gray-800 flex justify-between items-center"
            >
              <span>{task.text}</span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-400 hover:text-red-600 text-xs ml-2"
                title="Delete task"
              >
                🗑️
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={newTasks[column.id] || ""}
          onChange={(e) =>
            setNewTasks((prev) => ({ ...prev, [column.id]: e.target.value }))
          }
          placeholder="New task"
          className="border px-2 py-1 rounded text-sm bg-white"
        />
        <button
          onClick={() => handleAddTask(column.id)}
          className="bg-green-600 text-white text-sm py-1 rounded hover:bg-green-700"
        >
          Add Task
        </button>
      </div>
    </div>
  );
}
