import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { CampaignFormValues } from "@/src/types/components";
import { FormikProps } from "formik";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BatchingThrottlingSectionProps {
  formik: FormikProps<CampaignFormValues>;
}

export const BatchingThrottlingSection = ({
  formik,
}: BatchingThrottlingSectionProps) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-(--card-border-color) bg-slate-50/50 dark:bg-(--page-body-bg) space-y-6">
      <div className="flex items-center gap-2 mb-3">
        <Settings size={18} className="text-primary" />
        <h4 className="font-bold text-md text-primary">
          {t("campaign_wizard_throttle_title")}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="batch_size" className="text-sm font-medium">
            {t("campaign_wizard_throttle_batch_size")}
          </Label>
          <Input
            id="batch_size"
            name="batch_size"
            type="number"
            placeholder={t("campaign_wizard_throttle_batch_size_placeholder")}
            value={formik.values.batch_size || ""}
            onChange={formik.handleChange}
            className="h-12 font-bold text-sm border-[var(--primary-opacity-30)] bg-white dark:bg-(--card-color)"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="pause_between_batches" className="text-sm font-medium">
            {t("campaign_wizard_throttle_pause")}
          </Label>
          <Input
            id="pause_between_batches"
            name="pause_between_batches"
            type="number"
            placeholder={t("campaign_wizard_throttle_pause_placeholder")}
            value={formik.values.pause_between_batches || ""}
            onChange={formik.handleChange}
            className="h-12 font-bold text-sm border-[var(--primary-opacity-30)] bg-white dark:bg-(--card-color)"
          />
        </div>
      </div>
    </div>
  );
};
export default BatchingThrottlingSection;
