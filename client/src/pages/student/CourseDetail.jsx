import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetCourseDetailWithStatusQuery(courseId);
  
  console.log("Course Data:", data); 

  if (isLoading) return <h1>Loading...</h1>;
  if (isError || !data?.course) return <h1>Failed to load course details</h1>;

  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Course Header */}
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle || "Untitled Course"}
          </h1>
          <p className="text-base md:text-lg">
            {course?.subTitle || "No subtitle available"}
          </p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator?.name || "Unknown Instructor"}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt?.split("T")[0] || "N/A"}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents?.length || 0}</p>
        </div>
      </div>

      {/* Course Details */}
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        {/* Left Section: Description & Content */}
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{
              __html: course?.description || "No description available",
            }}
          />

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course?.lectures?.length || 0} lectures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.length > 0 ? (
                course.lectures.map((lecture, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {purchased ? <PlayCircle size={14} /> : <Lock size={14} />}
                    <p>{lecture.lectureTitle}</p>
                  </div>
                ))
              ) : (
                <p>No lectures available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Video & Purchase */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                {purchased && course.lectures.length > 0 && course.lectures[0].videoUrl ? (
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    url={course.lectures[0].videoUrl}
                    controls={true}
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center bg-gray-200">
                    {purchased ? "No video available" : "Purchase to unlock content"}
                  </div>
                )}
              </div>
              <h1>
                {course.lectures.length > 0
                  ? course.lectures[0].lectureTitle
                  : "No lecture available"}
              </h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">
                Price: {course?.coursePrice || "Free"} INR
              </h1>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
