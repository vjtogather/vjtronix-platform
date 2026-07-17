export default function AdminLoading() {
  return <div aria-label="Loading admin dashboard" className="animate-pulse space-y-6 p-5 sm:p-8 lg:p-10"><div className="h-8 w-56 rounded bg-white/10" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-28 rounded-xl bg-white/[0.06]" key={index} />)}</div><div className="h-72 rounded-xl bg-white/[0.06]" /></div>;
}
