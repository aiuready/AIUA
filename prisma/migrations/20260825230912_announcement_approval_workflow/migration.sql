-- AlterTable
ALTER TABLE `Announcement` ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX `Announcement_status_idx` ON `Announcement`(`status`);

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
