import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-bold">
        Book appointments with local pros
      </h1>
      <p className="mb-4 text-gray-600">
        Pick a service, choose a time, and you're booked.
      </p>
      <Link to="/book/coach-mike" className="text-blue-600 underline">
        Try the demo: Coach Mike Fitness
      </Link>
    </main>
  );
}
