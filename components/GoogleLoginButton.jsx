"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/config";
import { useRouter } from "next/navigation";

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Optional: log user info
      console.log("Logged in as:", user.displayName);

      // Redirect to board
      router.push("/board");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-white text-black border border-gray-300 px-6 py-2 rounded shadow-md hover:shadow-lg transition duration-200"
    >
      Sign in with Google
    </button>
  );
}
