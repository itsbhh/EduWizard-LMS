import Stripe from "stripe";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Generate a random payment ID (this is just a placeholder)
    const randomPaymentId = crypto.randomBytes(16).toString("hex");

    // Directly mark the purchase as completed before payment is done
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "completed", // HARD-CODED TO COMPLETED
      paymentId: randomPaymentId, // Assigning the random ID
    });

    await newPurchase.save(); // Save to DB immediately

    // Enroll the student immediately (HARD-CODED)
    await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { enrolledStudents: userId } }, // Prevent duplicates
      { new: true }
    );

    // 🔥 HARD-CODE USER UPDATE (Enroll Immediately)
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: courseId } }, // Prevent duplicates
      { new: true }
    );

    console.log(`✅ User ${userId} enrolled in course ${courseId}`);

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://eduwizard.netlify.app/course-progress/${courseId}`, 
      cancel_url: `https://eduwizard.netlify.app/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
        paymentId: randomPaymentId, // Storing the generated ID in metadata
      },
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url, // Return the Stripe checkout URL
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error(`❌ Webhook error: ${error.message}`);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("✅ Stripe session completed");

    try {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const courseId = session.metadata.courseId;

      console.log(`📌 Processing purchase for User: ${userId}, Course: ${courseId}`);

      // Try finding the purchase
      let purchase = await CoursePurchase.findOne({ paymentId: session.id }).populate({ path: "courseId" });

      // If purchase is not found, create a new one
      if (!purchase) {
        console.warn("❌ Purchase not found. Creating a fallback record.");

        const randomPaymentId = crypto.randomBytes(16).toString("hex");

        purchase = new CoursePurchase({
          courseId,
          userId,
          amount: session.amount_total / 100,
          status: "completed",
          paymentId: randomPaymentId, // Assigning the random ID
        });

        await purchase.save();
      }

      // Mark the purchase as completed
      purchase.status = "completed";
      await purchase.save();

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      // Ensure IDs are formatted correctly
      console.log(`📌 Enrolling user ${userId} into course ${courseId}`);

      // Update the course with the new enrolled student
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { enrolledStudents: userId } }, // Prevent duplicates
        { new: true }
      );

      if (!updatedCourse) {
        console.error("❌ Course not found during update!");
        return res.status(404).json({ message: "Course not found" });
      }

      console.log(`✅ Course updated: ${updatedCourse.courseTitle}`);

      // 🛠 Fix: Also add the course to the user's enrolledCourses
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { enrolledCourses: courseId } }, // Prevent duplicates
        { new: true }
      );

      if (!updatedUser) {
        console.error("❌ User not found or not updating!");
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`✅ User updated: ${updatedUser.name}, Enrolled Courses: ${updatedUser.enrolledCourses}`);

    } catch (error) {
      console.error("❌ Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  res.status(200).send();
};


export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
  }
};
