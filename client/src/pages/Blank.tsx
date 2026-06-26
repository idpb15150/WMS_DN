export default function Shelf3DLayout() {
  return (
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Warehouse Shelf Layout (9m)</h1>

      {/* Shelf container */}
      <div className="flex gap-6 perspective-1000">

        {/* 3 shelves */}
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="
              w-[300px] h-[250px]     /* scale จาก 3m x 2.5m */
              bg-white rounded-xl
              border border-gray-300
              shadow-lg
              transform-gpu transition-all duration-500
              hover:rotate-x-3 hover:rotate-y-3 hover:scale-105
            "
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-3 rounded-t-xl">
              <h2 className="text-center font-semibold">
                Shelf {n} (3m)
              </h2>
            </div>

            {/* Inner rack */}
            <div className="p-4 grid grid-rows-3 gap-3">
              <div className="bg-gray-200 h-full rounded-md shadow-inner"></div>
              <div className="bg-gray-200 h-full rounded-md shadow-inner"></div>
              <div className="bg-gray-200 h-full rounded-md shadow-inner"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 text-gray-600 text-sm">
        <p>• Total Length: 9 meters (3m × 3)</p>
        <p>• Depth: 1 meter (scaled)</p>
        <p>• Height: 2.5 meters (scaled)</p>
      </div>
    </div>
  );
}


