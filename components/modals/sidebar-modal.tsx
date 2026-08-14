interface sidebarModal {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarModal({ isOpen, onClose }: sidebarModal) {
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white p-4 z-50 lg:hidden">
        <button
          onClick={onClose}
          className="mb-4 border p-2 pl-3 pr-3 ml-[85%]"
        >
          X
        </button>

        <h2 className="text-xl font-bold mb-4">Chess Versus</h2>

        <ul className="space-y-2">
          <li className="cursor-pointer select-none">Play</li>
          <li>Community</li>
          <li>Settings</li>
        </ul>
      </div>
    </>
  );
}
