import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
        <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight">
          Find the Best Courses for You
        </h1>

        <p className="text-gray-200 dark:text-gray-400 text-base sm:text-lg">
          Discover, Learn, and Upskill with our wide range of courses
        </p>

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

        <div className="flex justify-center">
          <Button
            onClick={() => navigate(`/course/search?query`)}
            className="bg-white dark:bg-gray-800 text-blue-600 font-semibold rounded-full hover:bg-gray-200 text-sm sm:text-base px-8 py-3"
          >
            Explore Courses
          </Button>
        </div>

        {/* Avia AI + JobHub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
          {/* Avia AI */}
          <div className="flex flex-col items-center space-y-3">
            <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
              Accelerate with Avia AI
            </h2>
            <p className="text-gray-200 dark:text-gray-400 text-sm sm:text-base max-w-sm">
              Build resumes, practice interviews, and get personalized career
              guidance.
            </p>
            <Link to="https://avia-ai.vercel.app/" target="_blank">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 px-6 text-sm md:text-base flex items-center gap-2"
              >
                Explore Avia AI <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* JobHub */}
          <div className="flex flex-col items-center space-y-3">
            <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
              Discover Jobs on JobHub
            </h2>
            <p className="text-gray-200 dark:text-gray-400 text-sm sm:text-base max-w-sm">
              Explore curated job opportunities and kickstart your career.
            </p>
            <Link to="https://jobhub12.netlify.app/" target="_blank">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 px-6 text-sm md:text-base flex items-center gap-2"
              >
                Visit JobHub <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
