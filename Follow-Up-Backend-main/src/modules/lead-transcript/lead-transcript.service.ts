import prisma from "../../shared/prisma";
import AppError from "../../shared/errors/AppError";
import { FathomService } from "../fathom/fathom.service";
import {
  CreateTranscriptInput,
  UpdateTranscriptInput,
  FathomTranscriptInput,
} from "./lead-transcript.validation";

const verifyLeadOwnership = async (userId: string, leadId: string) => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, userId },
  });

  if (!lead) {
    throw new AppError(404, "Lead not found");
  }

  return lead;
};

const createTranscript = async (
  userId: string,
  leadId: string,
  payload: CreateTranscriptInput
) => {
  await verifyLeadOwnership(userId, leadId);

  return prisma.leadTranscript.create({
    data: {
      userId,
      leadId,
      source: payload.source,
      meetingTitle: payload.meetingTitle,
      meetingDate: new Date(payload.meetingDate),
      transcript: payload.transcript,
    },
  });
};

const getTranscripts = async (userId: string, leadId: string) => {
  await verifyLeadOwnership(userId, leadId);

  return prisma.leadTranscript.findMany({
    where: { leadId, userId },
    orderBy: { meetingDate: "desc" },
    select: {
      id: true,
      source: true,
      fathomRecordingId: true,
      meetingTitle: true,
      meetingDate: true,
      createdAt: true,
      updatedAt: true,
      transcript: true,
    },
  });
};

const getTranscriptById = async (
  userId: string,
  leadId: string,
  transcriptId: string
) => {
  await verifyLeadOwnership(userId, leadId);

  const transcript = await prisma.leadTranscript.findFirst({
    where: { id: transcriptId, leadId, userId },
  });

  if (!transcript) {
    throw new AppError(404, "Transcript not found");
  }

  return transcript;
};

const updateTranscript = async (
  userId: string,
  leadId: string,
  transcriptId: string,
  payload: UpdateTranscriptInput
) => {
  await getTranscriptById(userId, leadId, transcriptId);

  const data: Record<string, unknown> = { ...payload };
  if (payload.meetingDate) {
    data.meetingDate = new Date(payload.meetingDate);
  }

  return prisma.leadTranscript.update({
    where: { id: transcriptId },
    data,
  });
};

const deleteTranscript = async (
  userId: string,
  leadId: string,
  transcriptId: string
) => {
  await getTranscriptById(userId, leadId, transcriptId);

  return prisma.leadTranscript.delete({
    where: { id: transcriptId },
  });
};

type FathomTranscriptItem = {
  speaker: { display_name: string };
  text: string;
  timestamp: string;
};

const formatTimestamp = (ts: string): string => {
  const parts = ts.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts[2];

  if (hours > 0) {
    return `${hours}:${parts[1]}:${seconds}`;
  }
  return `${minutes}:${seconds}`;
};

const formatFathomTranscript = (items: FathomTranscriptItem[]): string => {
  const groups: { speaker: string; timestamp: string; texts: string[] }[] = [];

  for (const item of items) {
    if (item.text === "...") continue;

    const current = groups[groups.length - 1];

    if (current && current.speaker === item.speaker.display_name) {
      current.texts.push(item.text);
    } else {
      groups.push({
        speaker: item.speaker.display_name,
        timestamp: item.timestamp,
        texts: [item.text],
      });
    }
  }

  return groups
    .map((g) => `@${formatTimestamp(g.timestamp)} - ${g.speaker}: \n${g.texts.join(" ")}`)
    .join("\n\n");
};

const importFromFathom = async (
  userId: string,
  leadId: string,
  payload: FathomTranscriptInput
) => {
  await verifyLeadOwnership(userId, leadId);

  const existing = await prisma.leadTranscript.findFirst({
    where: { leadId, fathomRecordingId: payload.recordingId },
  });

  if (existing) {
    throw new AppError(409, "This meeting transcript is already added to this lead");
  }

  const fathomData = (await FathomService.getTranscript(
    userId,
    String(payload.recordingId)
  )) as { transcript: FathomTranscriptItem[] } | null;



  const items = fathomData?.transcript;

  const transcriptText =
    items && Array.isArray(items) && items.length > 0
      ? formatFathomTranscript(items)
      : "No transcript available";



  return prisma.leadTranscript.create({
    data: {
      userId,
      leadId,
      source: "fathom",
      fathomRecordingId: payload.recordingId,
      meetingTitle: payload.meetingTitle,
      meetingDate: new Date(payload.meetingDate),
      transcript: transcriptText,
    },
  });
};

export const LeadTranscriptService = {
  createTranscript,
  getTranscripts,
  getTranscriptById,
  updateTranscript,
  deleteTranscript,
  importFromFathom,
};
