import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"; // for navigation to Avia AI dashboard

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/course/search?query=${searchQuery}`);
    }
    setSearchQuery("");
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 py-14 sm:py-16 px-4 text-center">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Heading */}
        <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight">
          Find the Best Courses for You
        </h1>
        <p className="text-gray-200 dark:text-gray-400 text-base sm:text-lg">
          Discover, Learn, and Upskill with our wide range of courses
        </p>

        {/* Search Bar */}
        <form
          onSubmit={searchHandler}
          className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-xl mx-auto"
        >
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Courses"
            className="flex-grow border-none focus-visible:ring-0 px-4 py-2 sm:px-6 sm:py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
          />
          <Button
            type="submit"
            className="bg-blue-600 dark:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-r-full hover:bg-blue-700 dark:hover:bg-blue-800 text-sm sm:text-base"
          >
            Search
          </Button>
        </form>

        {/* Explore Courses Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate(`/course/search?query`)}
            className="bg-white dark:bg-gray-800 text-blue-600 font-semibold rounded-full hover:bg-gray-200 text-sm sm:text-base px-8 py-3 flex items-center justify-center"
          >
            Explore Courses
          </Button>
        </div>

        {/* Avia AI CTA Section */}
        <div className="flex flex-col items-center space-y-2 sm:space-y-3 mt-6">
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">
            Accelerate Your Career with Avia AI
          </h2>
          <p className="text-gray-200 dark:text-gray-400 text-sm sm:text-base max-w-md">
            Build resumes, practice interviews, and get personalized tips to
            stand out.
          </p>
          <Link to="https://avia-ai.netlify.app/">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              Start Your Journey Today <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
