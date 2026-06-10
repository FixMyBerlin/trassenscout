-- CreateEnum
CREATE TYPE "LabelPositionEnum" AS ENUM ('top', 'topRight', 'right', 'bottomRight', 'bottom', 'bottomLeft', 'left', 'topLeft');

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "labelPos" "LabelPositionEnum" DEFAULT 'top';

-- AlterTable
ALTER TABLE "Subsection" ADD COLUMN     "labelPos" "LabelPositionEnum"  DEFAULT 'top';

-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "labelPos" "LabelPositionEnum" DEFAULT 'top';
