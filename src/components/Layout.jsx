import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex overflow-x-hidden">
      {/* Background glowing orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/20 blur-[100px] rounded-full mix-blend-screen" />
      </div>
      
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 relative z-10">
        <div className="max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
