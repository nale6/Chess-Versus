import "./App.css";

function App() {
  return (
    <>
      <div className="flex justify-center items-center h-screen gap-4">
        <div className="homepage-item ml-3">
          <div className="grid grid-cols-8 gap-0 gap-x">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-black border" />
            ))}
          </div>
        </div>
        <div className="homepage-item text-xl md:text-3xl lg:text-5xl text-center">
          <h1 className="bg-green-500 rounded-2xl p-2 hover:bg-green-700 active:scale-95 cursor-pointer select-none">
            Start Match
          </h1>
        </div>
      </div>
    </>
  );
}

export default App;
