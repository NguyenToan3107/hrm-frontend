import React from "react";

export default function StyledIconLoading() {
  return (
    <svg
      className="w-5 h-5 mr-2 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8l5 3-5 3V4a8 8 0 00-8 8z"
      />
    </svg>
  );
}
