import { Router } from "express";
import auth from "../../shared/middleware/auth";
import validateRequest from "../../shared/middleware/validateRequest";
import { csvUpload } from "../../shared/config/upload";
import { LeadController } from "./lead.controller";
import {
  bulkDeleteLeadsSchema,
  createLeadSchema,
  updateLeadSchema,
} from "./lead.validation";
import { LeadTranscriptRoutes } from "../lead-transcript/lead-transcript.route";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(createLeadSchema),
  LeadController.createLead
);

router.post(
  "/import-csv",
  auth,
  csvUpload.single("file"),
  LeadController.importCSV
);

router.get("/", auth, LeadController.getLeads);

router.post(
  "/bulk-delete",
  auth,
  validateRequest(bulkDeleteLeadsSchema),
  LeadController.deleteManyLeads
);

router.get("/:id", auth, LeadController.getLeadById);

router.patch(
  "/:id",
  auth,
  validateRequest(updateLeadSchema),
  LeadController.updateLead
);

router.delete(
  "/bulk-delete",
  auth,
  validateRequest(bulkDeleteLeadsSchema),
  LeadController.deleteManyLeads
);

router.delete("/:id", auth, LeadController.deleteLead);

router.use("/:leadId/transcripts", LeadTranscriptRoutes);

export const LeadRoutes = router;
