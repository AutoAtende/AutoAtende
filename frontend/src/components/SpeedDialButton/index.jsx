import React from "react";

export function SpeedDialButton({ children }) {
  return (
    <div class="relative z-50 min-h-[380px] w-fit">
      <div class="speeddial-button star-60 group absolute top-6">
        <button
          type="button"
          aria-expanded="false"
          class="flex h-16 w-16 items-center justify-center rounded-full bg-[#0000FF] text-white  focus:outline-none focus:ring-4"
        >
          <svg
            class="h-5 w-5 transition-transform group-hover:rotate-45"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 1v16M1 9h16"
            />
          </svg>
          <span class="sr-only">Open actions menu</span>
        </button>
        <div
          id="speed-dial-menu-default"
          class="speed-dial-menu mt-4 hidden flex-col items-center space-y-2 group-hover:flex"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
