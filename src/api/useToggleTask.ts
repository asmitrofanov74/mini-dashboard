import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Task {
  id: number;
  title: string;
  status: "active" | "paused";
}

export const useToggleTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      const res = await fetch(`http://localhost:3001/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: task.status === "active" ? "paused" : "active",
        }),
      });

      return res.json();
    },

    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const prev = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: t.status === "active" ? "paused" : "active",
              }
            : t
        )
      );

      return { prev };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(["tasks"], context?.prev);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
};
