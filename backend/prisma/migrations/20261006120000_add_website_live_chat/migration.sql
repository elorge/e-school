-- CreateEnum
CREATE TYPE "ChatSender" AS ENUM ('VISITOR', 'AGENT', 'BOT');

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "pageUrl" TEXT,
    "waitingSince" TIMESTAMP(3),
    "nudgeSentAt" TIMESTAMP(3),
    "followUpSentAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAgentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" "ChatSender" NOT NULL,
    "text" TEXT NOT NULL,
    "agentName" TEXT,
    "tgReplyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversations_token_key" ON "chat_conversations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversations_tag_key" ON "chat_conversations"("tag");

-- CreateIndex
CREATE INDEX "chat_conversations_waitingSince_idx" ON "chat_conversations"("waitingSince");

-- CreateIndex
CREATE UNIQUE INDEX "chat_messages_seq_key" ON "chat_messages"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "chat_messages_tgReplyId_key" ON "chat_messages"("tgReplyId");

-- CreateIndex
CREATE INDEX "chat_messages_conversationId_seq_idx" ON "chat_messages"("conversationId", "seq");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep Supabase's public REST API away from chat data (the backend connects as postgres and is unaffected).
ALTER TABLE "chat_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;
