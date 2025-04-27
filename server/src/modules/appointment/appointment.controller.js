import AppointmentModel from "../../../Database/models/appointment.model.js";
import UserModel from "../../../Database/models/user.model.js";
import AppError from "../../utils/AppError.js";
import AppResponse from "../../utils/AppResponse.js";
import AsyncHandler from "../../utils/AsyncHandler.js";

const createAppointment = AsyncHandler(async (req, res, next) => {
  const { date, timeSlot, purpose, notes } = req.body;
  const userId = req.user._id;

  // Validate if all fields are provided
  if (!userId || !date || !timeSlot || !purpose) {
    return next(new AppError(400, "Please provide all required fields"));
  }

  // Create the new appointment document
  const newAppointment = new AppointmentModel({
    user: userId,
    grader: null,
    date: new Date(date),
    timeSlot,
    purpose,
    notes,
    status: "pending", // Default status
  });

  // Save the appointment to the database
  await newAppointment.save();

  return res
    .status(201)
    .json(
      new AppResponse(201, newAppointment, "Appointment created successfully")
    );
});

// Confirm an appointment and provide a meeting link
const confirmAppointment = AsyncHandler(async (req, res, next) => {
  const { appointmentId } = req.params;
  const { meetingLink } = req.body;
  const graderId = req.user._id;

  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    return next(new AppError(404, "Appointment not found"));
  }

  if (appointment.status !== "pending") {
    return next(
      new AppError(
        400,
        "Appointment cannot be confirmed, it is already processed"
      )
    );
  }

  // Update status to 'confirmed' and add meeting link
  appointment.grader = graderId;
  appointment.status = "confirmed";
  appointment.meetingLink = meetingLink; // Set the meeting link

  await appointment.save();

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        appointment,
        "Appointment confirmed successfully with meeting link"
      )
    );
});

// Reject an appointment
const rejectAppointment = AsyncHandler(async (req, res, next) => {
  const { appointmentId } = req.params;
  const graderId = req.user._id;

  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    return next(new AppError(404, "Appointment not found"));
  }

  if (appointment.status !== "pending") {
    return next(
      new AppError(
        400,
        "Appointment cannot be rejected, it is already processed"
      )
    );
  }

  // Update status to 'confirmed' and add meeting link
  appointment.grader = graderId;
  appointment.status = "rejected";

  await appointment.save();

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        appointment,
        "Appointment confirmed successfully with meeting link"
      )
    );
});

// Reject an appointment
const getAllAppointments = AsyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Default page 1
  const limit = parseInt(req.query.limit) || 10; // Default 10 items per page
  const skip = (page - 1) * limit;

  const appointments = await AppointmentModel.find()
    .skip(skip)
    .limit(limit)
    .populate("user grader");

  const totalAppointments = await AppointmentModel.countDocuments({
    status: "approved",
  });

  return res.status(200).json(
    new AppResponse(
      200,
      {
        total: totalAppointments,
        page,
        limit,
        appointments,
      },
      "Appointments fetched successfully"
    )
  );
});

export {
  createAppointment,
  confirmAppointment,
  rejectAppointment,
  getAllAppointments,
};
