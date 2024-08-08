"use client";

import Link from "next/link";
import { useState } from "react"

export default function MoreInfo() {
  const [expanded, setExpanded] = useState<boolean>(false)

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="self-start"
      >
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </button>
      {expanded ? (
        <div className="flex flex-col gap-4">
          <span>built this to learn the following:</span>
          <hr />
          <span>Tech Stack</span>
          <ul className="list-disc ml-4">
            <li>Next.js App Router</li>
            <li>TypeScript</li>
            <li>
              Supabase
              <ul className="list-inside list-disc">
                <li>Auth</li>
                <li>Postgres</li>
                <li>Row Level Security (RLS)</li>
                <li>Realtime</li>
              </ul>
            </li>
            <li>
              React
              <ul className="list-inside list-disc">
                <li>React Server Components (RSCs)</li>
                <li>Suspense</li>
              </ul>
            </li>
            <li>Tailwind</li>
            <li>React Hook Form</li>
            <li>Zod</li>
          </ul>
          <span>General Concepts</span>
          <ul className="list-disc ml-4">
            <li>Client-side vs server-side rendering</li>
            <li>Server Actions</li>
            <li>React's Virtual DOM</li>
            <li>(Partial) Hydration</li>
            <li>Cursor-based pagination</li>
            <li>Object Relational Mapping (ORM)</li>
          </ul>
          <hr />
          <span>and more about the project itself:</span>
          <hr />
          <span>Tiny Network</span>
          <ul className="list-disc ml-4">
            <li>Befriend others</li>
            <li>One status update a day</li>
            <li>Simple profile page w/ basic info</li>
            <li>That's all for now lol</li>
          </ul>
          <hr />
          <div className="flex flex-row gap-2">
            <Link
              href="https://yihuihu.com"
              className="hover:text-decoration-line hover:underline hover:decoration-2 hover:underline-offset-4"
            >
              by yihui
            </Link>
            <span>•</span>
            <Link
              href="https://github.com/yihui-hu"
              className="hover:text-decoration-line hover:underline hover:decoration-2 hover:underline-offset-4"
            >
              github repo
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_37_99)">
        <path
          d="M11.0845 1.13477C11.0845 0.509277 10.6025 0.00341797 9.80615 0.00341797L1.2749 0C0.478516 0 0 0.505859 0 1.13135C0 1.4458 0.126465 1.7124 0.311035 2.09863L4.32373 10.4487C4.63818 11.0947 5.02441 11.3989 5.54053 11.3989C6.05664 11.3989 6.44629 11.0947 6.76074 10.4487L10.77 2.09863C10.958 1.71582 11.0845 1.44922 11.0845 1.13477Z"
          fill="black"
          fillOpacity="0.85"
        />
      </g>
      <defs>
        <clipPath id="clip0_37_99">
          <rect width="11.563" height="11.4023" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ChevronUp() {
return (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_37_107)">
      <path
        d="M11.0845 10.2812C11.0845 9.9668 10.958 9.70361 10.77 9.3208L6.76074 0.974121C6.44629 0.321289 6.05664 0.0170898 5.54053 0.0170898C5.02441 0.0170898 4.63818 0.321289 4.32373 0.974121L0.311035 9.3208C0.126465 9.70703 0 9.97021 0 10.2847C0 10.9102 0.478516 11.416 1.2749 11.416L9.80615 11.4126C10.6025 11.4126 11.0845 10.9067 11.0845 10.2812Z"
        fill="black"
        fillOpacity="0.85"
      />
    </g>
    <defs>
      <clipPath id="clip0_37_107">
        <rect width="11.563" height="11.416" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
}