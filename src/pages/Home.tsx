function Home() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Home Page</h1>
      <p className="text-gray-600 mb-6">Welcome to the home page!</p>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Getting Started</h2>
        <p className="text-gray-600">
          This is a simple React application with Tailwind CSS styling.
        </p>
      </div>
    </div>
  );
}

export default Home;