import { appToast } from "@/lib/app-toast";

const ComponentToastPlayground = () => {
  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Examples</h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl bg-control-primary px-4 py-2 text-sm font-semibold text-text-primary-control transition-opacity hover:opacity-90"
          onClick={() => {
            appToast.success("Plant added successfully", {
              duration: 2800,
            });
          }}
        >
          Success
        </button>

        <button
          type="button"
          className="rounded-xl bg-control-secondary px-4 py-2 text-sm font-semibold text-text-secondary-control transition-opacity hover:opacity-90"
          onClick={() => {
            appToast.error("Save changes failed", {
              duration: 3200,
            });
          }}
        >
          Error
        </button>

        <button
          type="button"
          className="rounded-xl bg-control-secondary px-4 py-2 text-sm font-semibold text-text-secondary-control transition-opacity hover:opacity-90"
          onClick={() => {
            appToast.info("Reminder turned on", {
              duration: 2800,
            });
          }}
        >
          Info
        </button>
      </div>

      <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
        Tokens used: --control-primary, --text-primary-control, --control-secondary,
        --text-secondary-control, --text-main, --icon-secondary.
      </div>
    </section>
  );
};

export default ComponentToastPlayground;
