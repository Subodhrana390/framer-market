import express from "express";
import {
  getAllGraderProfiles,
  getAssignedCrops,
  getDownloadReport,
  getGraderProfile,
  getGradingHistory,
  startGrading,
  submitGradingReport,
  SubmitVerificationDocuments,
  verifyGraderDocuments,
} from "./grader.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";
import { upload } from "../../middlewares/multer.js";

const graderRouter = express.Router();

graderRouter.post(
  "/submit-documents",
  upload.fields([
    { name: "govtId", maxCount: 1 },
    { name: "gradingCertification", maxCount: 1 },
  ]),
  protectedRoutes,
  allowedTo("grader"),
  SubmitVerificationDocuments
);

graderRouter.post(
  "/:graderId/verify",
  protectedRoutes,
  allowedTo("admin"),
  verifyGraderDocuments
);

graderRouter.get(
  "/profile",
  protectedRoutes,
  allowedTo("grader"),
  getGraderProfile
);
graderRouter.get(
  "/all-grader-profiles",
  protectedRoutes,
  allowedTo("admin"),
  getAllGraderProfiles
);

graderRouter.post(
  "/:cropId/start-grading",
  protectedRoutes,
  allowedTo("grader"),
  startGrading
);

graderRouter.post(
  "/submit-report",
  protectedRoutes,
  allowedTo("grader"),
  upload.fields([{ name: "supportingDocs", maxCount: 2 }]),
  submitGradingReport
);

graderRouter.get(
  "/getGradingGistory",
  protectedRoutes,
  allowedTo("grader"),
  getGradingHistory
);
graderRouter.get(
  "/getAssignedCrops",
  protectedRoutes,
  allowedTo("grader"),
  getAssignedCrops
);

graderRouter.get(
  "/download/:fileName",
  protectedRoutes,
  allowedTo("grader","user"),
  getDownloadReport
);

export default graderRouter;
