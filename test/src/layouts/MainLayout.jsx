const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen text-white bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)]">
      
      <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10">
        {/* Sidebar */}
      </div>

      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;