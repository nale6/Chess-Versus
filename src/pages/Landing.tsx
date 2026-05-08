import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  //TODO: Fix/find means of setting sidebar to be visible on large display and on smaller display, make it appear onclick with a button and removed again with same button
  //TODO: Remove placeholder 64 flexboxes and replace
  //TODO: Use hashrouting for now and change to browser later.
  //TODO: Find good website for hosting. Vercel may not like client server state changes. Research more on this.

  return (
    <>
      <div className="flex justify-center items-center h-screen gap-4">
        <div className="lg:hidden absolute top-0 left-0 w-1">
          <button className="border bg-white" onClick={() => setOpen(true)}>
            Click Me!
          </button>
        </div>
        <div
          className={`hidden lg:block w-55 h-screen bg-gray-900 text-white p-4 absolute left-0 ${open ? "block" : ""}`}
        >
          <h2 className="text-xl font-bold mb-4">Chess Versus</h2>

          <ul className="space-y-2">
            <li>Play</li>
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
