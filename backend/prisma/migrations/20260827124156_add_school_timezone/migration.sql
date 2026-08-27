/*
  Warnings:

  - Added the required column `timezone` to the `school_signup_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "school_signup_requests" ADD COLUMN     "timezone" TEXT NOT NULL;
