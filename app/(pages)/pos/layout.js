import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
    title: "POS System",
    description: "A simple POS system",
  };

const PosLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">POS System</h1>
        <nav className="flex flex-col gap-2">
          <Link href="/pos"><Button variant="ghost" className="w-full text-left">Dashboard</Button></Link>
          <Link href="/pos/products"><Button variant="ghost" className="w-full text-left">Products</Button></Link>
          <Link href="/pos/categories"><Button variant="ghost" className="w-full text-left">Categories</Button></Link>
          <Link href="/pos/cart"><Button variant="ghost" className="w-full text-left">Cart</Button></Link>
          <Link href="/pos/orders"><Button variant="ghost" className="w-full text-left">Orders</Button></Link>
        </nav>
      </aside>
      <main className="flex-1 p-4">
        {children}
        <Toaster />
      </main>
    </div>
  );
}
export default PosLayout;