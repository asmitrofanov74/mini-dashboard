import React, { useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import styled, { ThemeProvider } from "styled-components";
import {
  useFilters,
  usePagination,
  useTheme,
  useUiStore,
  useSetFilters,
  useSetPageSize,
} from "./store/uiStore";
import { GlobalStyle } from "./GlobalStyle";
import { lightTheme, darkTheme } from "./theme";

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;
const Filters = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;
const Input = styled.input`
  padding: 8px;
  border: 1px solid gray;
`;
const Select = styled.select`
  padding: 8px;
  border: 1px solid gray;
`;
const Header = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 100px;
  gap: 10px;
  padding: 10px;
  background: #f0f0f0;
  font-weight: bold;
`;
const Row = styled.div<{ status: string }>`
  display: grid;
  grid-template-columns: 2fr 1fr 100px;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  background: ${({ status, theme }) =>
    status === "active" ? theme.statusActive : "#ffcc00"};
`;
const Button = styled.button`
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
`;
const TableBox = styled.div`
  height: 500px;
  border: 1px solid #ccc;
  overflow: auto;
`;

interface Task {
  id: number;
  title: string;
  status: "active" | "paused";
}

export default function Dashboard() {
  const themeName = useTheme();
  const theme = themeName === "dark" ? darkTheme : lightTheme;
  const filters = useFilters();
  const setFilters = useSetFilters();
  const setPageSize = useSetPageSize();
  const { page, pageSize } = usePagination();
  const queryClient = useQueryClient();
  const TOTAL_ROWS = 5000;
  const { data, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", filters, page, pageSize],

    queryFn: async (): Promise<Task[]> => {
      await new Promise((r) => setTimeout(r, 500));

      const start = (page - 1) * pageSize;
      let allTasks: Task[] = Array.from({ length: TOTAL_ROWS }, (_, i) => ({
        id: i + 1,
        title: `Task ${i + 1} - Oil Dashboard`,
        status: i % 3 === 0 ? "paused" : ("active" as const),
      }));

      let filtered = allTasks;
      if (filters.q)
        filtered = filtered.filter((t) =>
          t.title.toLowerCase().includes(filters.q.toLowerCase())
        );
      if (filters.status !== "all")
        filtered = filtered.filter((t) => t.status === filters.status);

      const paginated: Task[] = filtered.slice(start, start + pageSize);
      console.log(`📊 Mock: page=${page}, results=${paginated.length}`);
      return paginated;
    },
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  console.log(
    "Data length:",
    data?.length,
    "Visible:",
    rowVirtualizer.getVirtualItems().length
  ); // DEBUG

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <h1>Dashboard (5000+ tasks)</h1>
        <Filters>
          <Input
            placeholder="Search"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value as any })}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </Select>
          <Select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={50}>50/page</option>
            <option value={100}>100/page</option>
          </Select>
          <Button
            onClick={() =>
              useUiStore
                .getState()
                .setTheme(themeName === "light" ? "dark" : "light")
            }
          >
            {themeName === "light" ? "🌙 Dark" : "☀️ Light"}
          </Button>
        </Filters>

        {isLoading ? (
          <div>⏳ Loading...</div>
        ) : (
          <>
            <Header>
              <span>Title</span> <span>Status</span> <span>Action</span>
            </Header>
            <TableBox ref={parentRef}>
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const task = data![virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <Row status={task.status}>
                        <span>{task.title}</span>
                        <span>{task.status.toUpperCase()}</span>
                        <Button
                          onClick={async () => {
                            await fetch(
                              `http://localhost:3001/tasks/${task.id}`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  status:
                                    task.status === "active"
                                      ? "paused"
                                      : "active",
                                }),
                              }
                            );
                            queryClient.invalidateQueries({
                              queryKey: ["tasks"],
                            });
                          }}
                        >
                          {task.status === "active" ? "⏸️ Pause" : "▶️ Active"}
                        </Button>
                      </Row>
                    </div>
                  );
                })}
              </div>
            </TableBox>
            <div>
              Page {page} | Size {pageSize} | Total ~5000 | Loaded:{" "}
              {data?.length}
            </div>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}
