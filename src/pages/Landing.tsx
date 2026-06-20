import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarModal from "../../components/modals/sidebar-modal";
import { Menu } from "lucide-react";

const Landing = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  //TODO: Remove placeholder 64 grid boxes and replace
  //TODO: Use hashrouting for now and change to browser later.
  //TODO: Find good website for hosting. Vercel may not like client server state changes. Research more on this.
  //TODO: Explore better pages folder structuring
  //TODO: Add login button on small functionality if picked
  //TODO: Check on phone later if having menu appear on really small viewports looks good, or revert to way it was before otherwise
  //TODO: For now play and start match just brings to page automatically, both should bring up modal option. Moreover consider 'Play' in menu to be removed if it will be same as start match. Just placeholder for now to look good.
  //TODO: Modal that shows on hover for play and start button having different modal potentially.
  //TODO: Format game page once done, just need base chess board as frontend and return button for now, later explore chat and name display and pieces, chess material and points. Maybe unique elo rating system?
  //TODO: ^^ Continued, may need to look into resizing especially on smaller viewports but large chess board to actually play on looks good for now
  //TODO: ID for each games, AI and player. Integrate API, chess reads in FEN format
  //TODO: Draggable pieces
  //TODO: Once everything is done, add extra mechanics to truly be unique.
  //TODO: Fix highlighting on non legal moves specifically against pawn diagonal take but in general for all moves. Prevents properly from these moves taking place but king cannot be moved in front of a pawn
  //TODO: Backend to store and go back moves and needed for online play
  //TODO: When pawn gets pushed the en passant(?) doenst' get cleared or something. Refer to screenshots

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen gap-4 md:flex-row">
        <div className="lg:hidden absolute top-0 left-0 w-1">
          <button
            className="block border bg-gray-900 border-gray-500 pr-3 pb-3 pl-0 lg:hidden rounded-[30%] ml-2 mt-2"
            onClick={() => setOpen(true)}
          >
            <Menu className="ml-3 mt-3" />
          </button>
        </div>
        <div className="block lg:hidden">
          <SidebarModal isOpen={open} onClose={() => setOpen(false)} />
        </div>
        <div
          className={`hidden lg:block w-55 h-screen bg-gray-900 text-white p-4 absolute left-0 ${open ? "block" : ""}`}
        >
          <h2 className="text-xl font-bold mb-4">Chess Versus</h2>

          <ul className="space-y-2">
            <li
              className="cursor-pointer select-none"
              onClick={() => navigate("/game")}
            >
              Play
            </li>
            <li>Community</li>
            <li>Settings</li>
          </ul>
        </div>
        <div className="homepage-item ml-3">
          <div className="grid grid-cols-8 gap-0 gap-x">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-black border" />
            ))}
          </div>
        </div>
        <div className="homepage-item text-xl md:text-3xl lg:text-5xl text-center">
          <h1
            className="bg-green-500 rounded-2xl p-2 hover:bg-green-700 active:scale-95 cursor-pointer select-none"
            onClick={() => navigate("/game")}
          >
            Start Match
          </h1>
        </div>
      </div>
    </>
  );
};

export default Landing;
