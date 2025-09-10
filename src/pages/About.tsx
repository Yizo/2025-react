function About() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">About Page</h1>
      <p className="text-gray-600 mb-6">This is the about page.</p>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Our Story</h2>
        <p className="text-gray-600 mb-4">
          We are a team of developers passionate about creating great web applications.
        </p>
        <p className="text-gray-600">
          This project demonstrates the use of React with Tailwind CSS for rapid UI development.
        </p>
      </div>
    </div>
  );
}

export default About;