import express from "express";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";
import {
  confirmAppointment,
  createAppointment,
  getAllAppointments,
  rejectAppointment,
} from "./appointment.controller.js";

const appointmentRouter = express.Router();

// Create an appointment
appointmentRouter.post(
  "/create",
  protectedRoutes,
  allowedTo("user"), // Or allow a specific role
  createAppointment
);
// Confirm an appointment (admin or authorized user)
appointmentRouter.put(
  "/confirm/:appointmentId",
  protectedRoutes,
  allowedTo("grader"), // Or allow a specific role
  confirmAppointment
);

// Create an appointment
appointmentRouter.get(
  "/getAllAppointments",
  protectedRoutes,
  allowedTo("user","grader","admin"), // Or allow a specific role
  getAllAppointments
);

// Reject an appointment (admin or authorized user)
appointmentRouter.put(
  "/reject/:appointmentId",
  protectedRoutes,
  allowedTo("admin"),
  rejectAppointment
);

export default appointmentRouter;
