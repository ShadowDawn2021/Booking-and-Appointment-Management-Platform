import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, type FocusEvent } from "react";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "../api/errors";
import { useCreateProvider } from "../api/providers";
import { getBrowserTimezone, getTimezoneOptions } from "../lib/timezones";
import {
  providerProfileSchema,
  slugify,
  type ProviderProfileForm,
} from "../provider/schemas";

export function ProviderOnboarding() {
  const createProvider = useCreateProvider();
  const timezones = useMemo(() => getTimezoneOptions(), []);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ProviderProfileForm>({
    resolver: zodResolver(providerProfileSchema),
    defaultValues: {
      businessName: "",
      slug: "",
      timezone: getBrowserTimezone(),
    },
  });

  const businessName = register("businessName", {
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      if (!getValues("slug")) {
        setValue("slug", slugify(event.target.value), { shouldValidate: true });
      }
    },
  });

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-1 text-2xl font-bold">Set up your business</h1>
      <p className="mb-6 text-gray-600">
        Customers will book you through your own link.
      </p>
      <form
        onSubmit={handleSubmit((values) => createProvider.mutate(values))}
        className="space-y-4"
        noValidate
      >
        <div>
          <label
            htmlFor="businessName"
            className="mb-1 block text-sm font-medium"
          >
            Business name
          </label>
          <input
            id="businessName"
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2"
            {...businessName}
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.businessName.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium">
            Booking link
          </label>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>/book/</span>
            <input
              id="slug"
              type="text"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-base text-gray-900"
              {...register("slug")}
            />
          </div>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="timezone" className="mb-1 block text-sm font-medium">
            Timezone
          </label>
          <select
            id="timezone"
            className="w-full rounded border border-gray-300 px-3 py-2"
            {...register("timezone")}
          >
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          {errors.timezone && (
            <p className="mt-1 text-sm text-red-600">
              {errors.timezone.message}
            </p>
          )}
        </div>
        {createProvider.isError && (
          <p role="alert" className="text-sm text-red-600">
            {getErrorMessage(createProvider.error)}
          </p>
        )}
        <button
          type="submit"
          disabled={createProvider.isPending}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {createProvider.isPending ? "Creating…" : "Create my business"}
        </button>
      </form>
    </main>
  );
}
