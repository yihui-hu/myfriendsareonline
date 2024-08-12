"use client";

import Link from "next/link";
import { useState } from "react"
import { ChevronDownSvg, ChevronUpSvg } from "@/app/components/svgs";

export default function MoreInfo() {
  const [expanded, setExpanded] = useState<boolean>(false)

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="self-start"
      >
        {expanded ? <ChevronUpSvg /> : <ChevronDownSvg />}
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