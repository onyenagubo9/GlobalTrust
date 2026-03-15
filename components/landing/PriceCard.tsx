import Link from "next/link";

interface PriceCardProps {
  title: string;
  price: string;
  features: string[];
  featured?: boolean;
}

export default function PriceCard({
  title,
  price,
  features,
  featured = false,
}: PriceCardProps) {
  return (
    <div
      className={`relative p-8 rounded-2xl border transition-all duration-300 ${
        featured
          ? "bg-linear-to-b from-emerald-600 to-green-600 text-white border-green-400 shadow-2xl scale-[1.03]"
          : "bg-white border-slate-200 hover:border-green-400 hover:shadow-lg"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Most Popular
        </div>
      )}

      <h4
        className={`text-lg font-semibold ${
          featured ? "text-white" : "text-gray-800"
        }`}
      >
        {title}
      </h4>

      <div
        className={`mt-4 text-4xl font-bold ${
          featured ? "text-white" : "text-green-700"
        }`}
      >
        {price}
      </div>

      <ul
        className={`mt-6 space-y-2 text-sm ${
          featured ? "text-emerald-50" : "text-gray-600"
        }`}
      >
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href="/signup"
          className={`inline-block w-full text-center px-5 py-3 rounded-md font-medium transition-all ${
            featured
              ? "bg-white text-green-700 hover:bg-emerald-50"
              : "border border-green-300 text-green-700 hover:bg-green-50"
          }`}
        >
          {featured ? "Upgrade Now" : "Choose Plan"}
        </Link>
      </div>
    </div>
  );
}
