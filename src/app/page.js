"use client";

import GoogleLoginButton from "../../components/GoogleLoginButton";
import { auth } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.push("/board");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/background.jpg')" }}
      ></div>

      {/* Overlay */}
      {/* <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div> */}

      {/* Centered Card */}
      <div className="relative z-20 flex h-full w-full items-center justify-center">
        <div className="bg-white bg-opacity-50 rounded-xl shadow-lg p-10 max-w-md w-full text-center backdrop-blur-sm">
          <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-teal-500 text-5xl font-black">
            Welcome to the Kanban Board
          </h1>
          <p className="mb-6 text-gray-700">
            Sign in to manage your tasks visually
          </p>
          <GoogleLoginButton />
        </div>
      </div>
    </main>
  );
}
