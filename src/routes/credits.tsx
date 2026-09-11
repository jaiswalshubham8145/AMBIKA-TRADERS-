import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/credits")({
  beforeLoad: () => {
    throw redirect({
      to: "/maker",
    });
  },
});
