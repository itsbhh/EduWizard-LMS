import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";

import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, Medal } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const { width, height } = useWindowSize();
  const { courseId } = useParams();
  
  const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);
  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation();
  const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess }] = useInCompleteCourseMutation();
  
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCongratsDialog, setShowCongratsDialog] = useState(false);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
      setShowConfetti(true);
      setShowCongratsDialog(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess]);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data?.data?.courseDetails) return <p>Failed to load course details</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle, lectures } = courseDetails || {};

  // Debugging API response
  console.log("Course Progress Data:", data);

  // Select first lecture if none selected
  const initialLecture = currentLecture || (lectures?.length > 0 ? lectures[0] : null);

  // Check if a lecture is completed
  const isLectureCompleted = (lectureId) => {
    return progress?.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  // Update progress when playing video
  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  // Select lecture from the list
  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    handleLectureProgress(lecture._id);
  };

  // Complete or Incomplete Course
  const handleCompleteCourse = async () => await completeCourse(courseId);
  const handleInCompleteCourse = async () => await inCompleteCourse(courseId);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {showConfetti && <Confetti width={width} height={height} />}

      {/* Course Title & Completion Button */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle || "Untitled Course"}</h1>
        <Button onClick={completed ? handleInCompleteCourse : handleCompleteCourse} variant={completed ? "outline" : "default"}>
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Video Section */}
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          {initialLecture?.videoUrl ? (
            <video
              src={initialLecture.videoUrl}
              controls
              className="w-full h-auto md:rounded-lg"
              onPlay={() => handleLectureProgress(initialLecture._id)}
            />
          ) : (
            <div className="h-40 flex items-center justify-center bg-gray-200">
              {lectures?.length > 0 ? "No video available for this lecture" : "No lectures available"}
            </div>
          )}
          <h3 className="font-medium text-lg mt-2">
            {`Lecture ${lectures?.findIndex((lec) => lec._id === initialLecture?._id) + 1 || 0} : ${initialLecture?.lectureTitle || "No Lecture Title"}`}
          </h3>
        </div>

        {/* Lecture Sidebar */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
          <div className="flex-1 overflow-y-auto">
            {lectures?.length > 0 ? (
              lectures.map((lecture) => (
                <Card
                  key={lecture._id}
                  className={`mb-3 hover:cursor-pointer transition ${
                    lecture._id === currentLecture?._id ? "bg-gray-200 dark:bg-gray-800" : ""
                  }`}
                  onClick={() => handleSelectLecture(lecture)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      {isLectureCompleted(lecture._id) ? <CheckCircle2 size={24} className="text-green-500 mr-2" /> : <CirclePlay size={24} className="text-gray-500 mr-2" />}
                      <CardTitle className="text-lg font-medium">{lecture.lectureTitle}</CardTitle>
                    </div>
                    {isLectureCompleted(lecture._id) && <Badge variant={"outline"} className="bg-green-200 text-green-600">Completed</Badge>}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No lectures available</p>
            )}
          </div>
        </div>
      </div>

      {/* Congratulations Dialog */}
      {/* Congratulations Dialog */}
<Dialog open={showCongratsDialog} onOpenChange={setShowCongratsDialog}>
  <DialogContent className="max-w-md text-center p-6" aria-describedby="congrats-dialog-description">
    <DialogHeader>
      <DialogTitle className="flex items-center justify-center gap-2">
        <CheckCircle className="text-green-500" size={24} />
        Congratulations!
      </DialogTitle>
    </DialogHeader>
    <DialogDescription id="congrats-dialog-description" className="text-gray-600 text-lg">
      🎉 You have successfully completed the course! Well done! 🎉
    </DialogDescription>
    <Medal className="text-yellow-500 mx-auto my-4" size={40} />
    <Button onClick={() => setShowCertificateDialog(true)}>Generate Certificate</Button>
  </DialogContent>
</Dialog>
{/* Certificate Dialog */}
<Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
  <DialogContent className="max-w-md text-center p-6">
    <DialogHeader>
      <DialogTitle className="flex items-center justify-center gap-2">
        <Medal className="text-yellow-500" size={24} />
        Certificate Unavailable
      </DialogTitle>
    </DialogHeader>
    <DialogDescription className="text-gray-600 text-lg">
      ⚠️ Sorry, we are not government-registered, so we cannot provide an official certificate at this time.  
      However, we appreciate your hard work and dedication! 🎉
    </DialogDescription>
    <Button variant="outline" onClick={() => setShowCertificateDialog(false)}>
      Okay
    </Button>
  </DialogContent>
</Dialog>


    </div>
  );
};

export default CourseProgress;
